// eaton-ehs-api Worker v3.8.0
// Deployed to: https://eaton-ehs-api.cball8475.workers.dev
// D1 binding: DB → 62ce85d7-0cc1-4832-aa57-d5b09ceaa132
// Secrets: API_TOKEN, ANTHROPIC_API_KEY, RESEND_API_KEY (weekly digest),
//          GITHUB_BACKUP_TOKEN (weekly D1 backup push — PAT with repo scope)
// Vars: GIT_SHA (set on deploy so /health reports the live commit — see infra/deploy-notes.md)
// Crons: "0 14 * * 5" (Friday 10am ET — weekly digest), "0 12 * * 1" (Monday — D1 backup to GitHub)
// Changelog:
//   v3.9.3 (2026-07-25) — cron handler: a failed digest send or backup now throws so the
//     invocation is marked failed in Cloudflare. Both previously returned {success:false}
//     into a fire-and-forget ctx.waitUntil, so the weekly digest silently stopped landing
//     after 2026-06-25 (RESEND_API_KEY 401) while every cron run reported success.
//   v3.9.2 (2026-07-24) — /otter/extract: inject today's date into the extraction prompt so
//     relative due dates ("Friday", "August 1st") resolve to the right year
//   v3.9.1 (2026-07-24) — /otter/extract: replace retired claude-sonnet-4-20250514 (404 from
//     Anthropic since 2026-06-15) with claude-sonnet-5, and surface Anthropic API errors as
//     502s instead of returning an empty-but-successful extraction (kb/lessons.md 2026-07-24)
//   v3.9.0 (2026-07-23) — intel supersede parity (superseded_by/confidence + write-time
//     conflict flagging on POST /intel), weekly digest week-over-week deltas, semantic
//     search via Vectorize + Workers AI (/search?mode=semantic|hybrid, /vectorize/backfill).
//     Needs infra/migrations/2026-07-23-v3.9.0.sql and the eaton-memory Vectorize index;
//     degrades gracefully without either.
//   v3.8.1 (2026-07-22) — /export (and therefore backups) now includes scoreboard +
//     scoreboard_history; found missing during the first restore drill (infra/restore.sh)
//   v3.8.0 (2026-07-22) — FTS5 /search across knowledge/intel/tasks, weekly gzip D1 backup to
//     GitHub (+ POST /backup/run), /trends time series (+ scoreboard_history snapshots),
//     knowledge edges (related_ids/superseded_by/confidence) + write-time conflict flagging.
//     Requires infra/migrations/2026-07-22-v3.8.0.sql; degrades gracefully until it runs.
//   v3.7.0 (2026-06-29) — enum validation (400 w/ allowed values), /brief + /pulse composite
//     endpoints, /intel person_name→person_id resolution, scoreboard age/stale, /health git SHA
//   v3.6.0 (2026-06-03) — weekly digest moved from SendGrid to Resend
//   v3.5.0 (2026-05-27) — added /scoreboard GET+PATCH for EHS safety pulse metrics

const VERSION = "3.9.3";

// Server-side enum guards. The DB has no enforced CHECK constraints, so this is the
// only thing standing between a typo and a bad row (see task #389 — status "investigation").
const ENUMS = {
  status: ["todo", "wip", "done", "projects", "undated"],
  priority: ["High", "Medium", "Low"],
  ownership: ["mine", "fyi"],
  target_period: ["this-week", "30-day", "60-day", "90-day", "ongoing"]
};

// Returns an error string for the first invalid enum field, or null if all clean.
// Treats undefined/null/"" as absent (those fall back to defaults or stay null on insert).
function validateEnums(body, keys) {
  for (const key of keys) {
    const v = body[key];
    if (v === undefined || v === null || v === "") continue;
    if (!ENUMS[key].includes(v)) {
      return `${key} must be one of: ${ENUMS[key].join(", ")} — got "${v}"`;
    }
  }
  return null;
}

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization"
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...CORS }
  });
}

function err(msg, status = 400) {
  return json({ error: msg }, status);
}

function matchPath(path, pattern) {
  const regex = new RegExp("^" + pattern.replace(/:([^/]+)/g, "([^/]+)") + "$");
  const m = path.match(regex);
  return m ? m.slice(1).map(decodeURIComponent) : null;
}

// Project a row set down to a comma-separated whitelist of fields. No-op if param is absent.
function projectFields(rows, fieldsParam) {
  if (!fieldsParam || !rows?.length) return rows;
  const fields = fieldsParam.split(",").map(f => f.trim()).filter(Boolean);
  if (!fields.length) return rows;
  return rows.map(row => {
    const out = {};
    for (const f of fields) if (f in row) out[f] = row[f];
    return out;
  });
}

// Returns " LIMIT N" if the param is a sane positive int (capped at 1000), else "".
function limitClause(limitParam) {
  const n = parseInt(limitParam, 10);
  if (Number.isFinite(n) && n > 0 && n <= 1000) return ` LIMIT ${n}`;
  return "";
}

// Attach age_days + stale (>7d) to a scoreboard row. Reads the `last_updated` column.
function withScoreboardAge(row) {
  if (!row) return {};
  const out = { ...row };
  if (row.last_updated) {
    const ageDays = Math.floor((Date.now() - new Date(row.last_updated).getTime()) / 86400000);
    out.age_days = ageDays;
    out.stale = ageDays > 7;
  } else {
    out.age_days = null;
    out.stale = true;
  }
  return out;
}

// Full stats object. Extracted so /stats and /brief share one source of truth.
async function computeStats(db) {
  const totalTasks = await db.prepare("SELECT COUNT(*) as c FROM tasks").first();
  const byStatus = await db.prepare("SELECT status, COUNT(*) as c FROM tasks GROUP BY status").all();
  const overdue = await db.prepare("SELECT COUNT(*) as c FROM tasks WHERE due_date < date('now') AND status NOT IN ('done')").first();
  const dueSoon = await db.prepare("SELECT COUNT(*) as c FROM tasks WHERE due_date BETWEEN date('now') AND date('now', '+2 days') AND status NOT IN ('done')").first();
  const automatable = await db.prepare("SELECT COUNT(*) as c FROM tasks WHERE automatable = 1").first();
  const totalPeople = await db.prepare("SELECT COUNT(*) as c FROM people").first();
  const byOwnership = await db.prepare("SELECT ownership, COUNT(*) as c FROM tasks WHERE status != 'done' GROUP BY ownership").all();
  const byPeriod = await db.prepare("SELECT target_period, COUNT(*) as c FROM tasks WHERE status != 'done' GROUP BY target_period").all();
  const blocked = await db.prepare("SELECT COUNT(*) as c FROM tasks WHERE waiting_on IS NOT NULL AND status NOT IN ('done')").first();
  const tribalKnowledge = await db.prepare("SELECT COUNT(*) as c FROM tasks WHERE knowledge_type = 'tribal-knowledge'").first();
  const totalMoves = await db.prepare("SELECT COUNT(*) as c FROM leadership_moves").first();
  const movesByCategory = await db.prepare("SELECT category, COUNT(*) as c FROM leadership_moves GROUP BY category").all();
  const movesThisWeek = await db.prepare("SELECT COUNT(*) as c FROM leadership_moves WHERE date >= date('now', '-7 days')").first();
  const movesThisMonth = await db.prepare("SELECT COUNT(*) as c FROM leadership_moves WHERE date >= date('now', '-30 days')").first();
  const totalReflections = await db.prepare("SELECT COUNT(*) as c FROM weekly_reflections").first();
  const latestReflection = await db.prepare("SELECT week_of FROM weekly_reflections ORDER BY week_of DESC LIMIT 1").first();
  const totalKnowledge = await db.prepare("SELECT COUNT(*) as c FROM knowledge").first();
  const knowledgeByCategory = await db.prepare("SELECT category, COUNT(*) as c FROM knowledge GROUP BY category").all();
  const knowledgeThisWeek = await db.prepare("SELECT COUNT(*) as c FROM knowledge WHERE created_at >= date('now', '-7 days')").first();
  const totalIntel = await db.prepare("SELECT COUNT(*) as c FROM people_intel").first();
  const intelByType = await db.prepare("SELECT intel_type, COUNT(*) as c FROM people_intel GROUP BY intel_type").all();
  return {
    total_tasks: totalTasks.c, by_status: byStatus.results,
    overdue: overdue.c, due_soon: dueSoon.c,
    automatable: automatable.c, total_people: totalPeople.c,
    by_ownership: byOwnership.results, by_period: byPeriod.results,
    blocked: blocked.c, tribal_knowledge: tribalKnowledge.c,
    leadership: {
      total_moves: totalMoves.c,
      by_category: movesByCategory.results,
      this_week: movesThisWeek.c,
      this_month: movesThisMonth.c
    },
    reflections: {
      total: totalReflections.c,
      latest_week: latestReflection?.week_of || null
    },
    knowledge: {
      total: totalKnowledge.c,
      by_category: knowledgeByCategory.results,
      this_week: knowledgeThisWeek.c
    },
    intel: {
      total: totalIntel.c,
      by_type: intelByType.results
    }
  };
}

// Sanitize free text into an FTS5 MATCH expression: AND of quoted terms.
// Quoting each term neutralizes FTS5 operators (-, OR, NEAR, *) so user input
// can't produce a syntax error or an unintended query.
function ftsMatchExpr(q) {
  return q.trim().split(/\s+/).filter(Boolean).slice(0, 12)
    .map(t => `"${t.replace(/"/g, "")}"`).join(" ");
}

// True when the error means the v3.8.0 migration hasn't been applied yet.
function isMigrationPending(e) {
  return /no such (table|column)/i.test(e?.message || "");
}

// ── SEMANTIC LAYER (Vectorize + Workers AI) ──
// Optional: everything checks vecEnabled() and no request ever fails because
// embedding did. Vector ids are "knowledge:123" / "intel:45" so one index
// serves both tables. Index: eaton-memory (768 dims, cosine — bge-base-en-v1.5).
const EMBED_MODEL = "@cf/baai/bge-base-en-v1.5";

function vecEnabled(env) {
  return !!(env.AI && env.VECTORIZE);
}

function knowledgeEmbedText(row) {
  return `${row.subject}\n${row.detail}${row.people_involved ? "\npeople: " + row.people_involved : ""}`;
}

function intelEmbedText(row) {
  return `${row.person_name} (${row.intel_type}): ${row.content}`;
}

async function embedTexts(env, texts) {
  const res = await env.AI.run(EMBED_MODEL, { text: texts });
  return res.data;
}

// Fire-and-forget from request handlers via ctx.waitUntil — never throws upward.
async function upsertVector(env, kind, id, text) {
  if (!vecEnabled(env)) return;
  try {
    const [values] = await embedTexts(env, [text]);
    await env.VECTORIZE.upsert([{ id: `${kind}:${id}`, values, metadata: { kind, ref_id: Number(id) } }]);
  } catch (e) {
    console.error(`vector upsert failed (${kind}:${id}):`, e.message);
  }
}

async function deleteVector(env, kind, id) {
  if (!vecEnabled(env)) return;
  try {
    await env.VECTORIZE.deleteByIds([`${kind}:${id}`]);
  } catch (e) {
    console.error(`vector delete failed (${kind}:${id}):`, e.message);
  }
}

// Query the index and hydrate matches from D1. Excludes superseded rows.
async function semanticSearch(env, db, q, topK) {
  const [values] = await embedTexts(env, [q]);
  const res = await env.VECTORIZE.query(values, { topK, returnMetadata: "indexed" });
  const out = [];
  for (const m of res.matches || []) {
    const [kind, id] = m.id.split(":");
    const table = kind === "knowledge" ? "knowledge" : kind === "intel" ? "people_intel" : null;
    if (!table) continue;
    const row = await db.prepare(`SELECT * FROM ${table} WHERE id = ?`).bind(id).first();
    // Loose != null drops superseded rows and tolerates the column not existing yet.
    if (row && row.superseded_by == null) out.push({ kind, score: m.score, ...row });
  }
  return out;
}

// ── EXPORT (shared by GET /export and the weekly backup) ──
async function buildExport(db) {
  const tasks = await db.prepare("SELECT t.*, p.name as assignee_name FROM tasks t LEFT JOIN people p ON t.assignee_id = p.id ORDER BY t.id").all();
  const people = await db.prepare("SELECT * FROM people ORDER BY id").all();
  const templates = await db.prepare("SELECT * FROM templates ORDER BY id").all();
  const moves = await db.prepare("SELECT * FROM leadership_moves ORDER BY date DESC").all();
  const reflections = await db.prepare("SELECT * FROM weekly_reflections ORDER BY week_of DESC").all();
  const knowledge = await db.prepare("SELECT * FROM knowledge ORDER BY created_at DESC").all();
  const intel = await db.prepare("SELECT i.*, p.name as linked_person_name FROM people_intel i LEFT JOIN people p ON i.person_id = p.id ORDER BY i.created_at DESC").all();
  const scoreboard = await db.prepare("SELECT * FROM scoreboard ORDER BY id").all();
  let scoreboardHistory = [];
  try {
    const sh = await db.prepare("SELECT * FROM scoreboard_history ORDER BY snapshot_date").all();
    scoreboardHistory = sh.results;
  } catch (e) {
    if (!isMigrationPending(e)) throw e;
  }
  return {
    exported_at: new Date().toISOString(),
    version: VERSION,
    scoreboard: scoreboard.results,
    scoreboard_history: scoreboardHistory,
    tasks: tasks.results,
    people: people.results,
    templates: templates.results,
    leadership_moves: moves.results,
    weekly_reflections: reflections.results,
    knowledge: knowledge.results,
    people_intel: intel.results,
    summary: {
      total_tasks: tasks.results.length,
      mine: tasks.results.filter(t => t.ownership === "mine").length,
      fyi: tasks.results.filter(t => t.ownership === "fyi").length,
      by_period: {
        "this-week": tasks.results.filter(t => t.target_period === "this-week").length,
        "30-day": tasks.results.filter(t => t.target_period === "30-day").length,
        "60-day": tasks.results.filter(t => t.target_period === "60-day").length,
        "90-day": tasks.results.filter(t => t.target_period === "90-day").length,
        "ongoing": tasks.results.filter(t => t.target_period === "ongoing").length
      },
      blocked: tasks.results.filter(t => t.waiting_on).length,
      tribal_knowledge: tasks.results.filter(t => t.knowledge_type === "tribal-knowledge").length,
      total_leadership_moves: moves.results.length,
      total_reflections: reflections.results.length,
      total_knowledge: knowledge.results.length,
      total_intel: intel.results.length
    }
  };
}

// ── WEEKLY D1 BACKUP → GITHUB ──
// Pushes a gzipped full export as a dated file. Dated filenames mean plain
// creates (no sha lookup — the contents API can't GET files >1MB anyway).
// Raw export is ~1.2MB; gzipped lands around 150-250KB per week.
async function gzipToBase64(str) {
  const stream = new Blob([str]).stream().pipeThrough(new CompressionStream("gzip"));
  const bytes = new Uint8Array(await new Response(stream).arrayBuffer());
  let bin = "";
  const CHUNK = 0x8000; // chunked to keep String.fromCharCode off the arg-length cliff
  for (let i = 0; i < bytes.length; i += CHUNK) {
    bin += String.fromCharCode.apply(null, bytes.subarray(i, i + CHUNK));
  }
  return btoa(bin);
}

async function runBackup(env, db) {
  if (!env.GITHUB_BACKUP_TOKEN) {
    console.error("GITHUB_BACKUP_TOKEN not set — skipping backup");
    return { success: false, reason: "no_github_backup_token" };
  }
  const repo = env.BACKUP_REPO || "cball8475/EATON";
  const branch = env.BACKUP_BRANCH || "main";
  const today = new Date().toISOString().split("T")[0];
  const path = `infra/backups/auto/d1-export-${today}.json.gz`;
  const data = await buildExport(db);
  const content = await gzipToBase64(JSON.stringify(data));
  const res = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${env.GITHUB_BACKUP_TOKEN}`,
      "Accept": "application/vnd.github+json",
      "User-Agent": "eaton-ehs-api-backup",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      message: `D1 backup ${today} (${data.summary.total_tasks} tasks, ${data.summary.total_knowledge} knowledge, ${data.summary.total_intel} intel)`,
      content,
      branch
    })
  });
  let detail = null;
  try { detail = await res.json(); } catch {}
  const result = {
    success: res.ok || res.status === 422, // 422 = file already exists for today — treated as done
    status: res.status,
    path,
    repo,
    branch,
    rows: data.summary,
    error: res.ok ? null : (detail?.message || null)
  };
  console.log("Backup result:", JSON.stringify({ ...result, rows: undefined }));
  return result;
}

// ── WEEKLY DIGEST ──
async function buildWeeklyDigest(db) {
  const now = new Date();
  const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const today = now.toISOString().split("T")[0];
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const completed = await db.prepare(
    "SELECT title, completed_at, priority, source_label FROM tasks WHERE status = 'done' AND completed_at >= ? ORDER BY completed_at DESC"
  ).bind(weekAgo).all();

  const overdue = await db.prepare(
    "SELECT title, due_date, priority, waiting_on FROM tasks WHERE due_date < ? AND status NOT IN ('done') ORDER BY due_date ASC"
  ).bind(today).all();

  const upcoming = await db.prepare(
    "SELECT title, due_date, priority, waiting_on FROM tasks WHERE due_date BETWEEN ? AND ? AND status NOT IN ('done') ORDER BY due_date ASC"
  ).bind(today, nextWeek).all();

  const blocked = await db.prepare(
    "SELECT title, waiting_on, priority FROM tasks WHERE waiting_on IS NOT NULL AND status NOT IN ('done') ORDER BY priority"
  ).all();

  const byPeriod = await db.prepare(
    "SELECT target_period, COUNT(*) as c FROM tasks WHERE status NOT IN ('done') AND target_period IS NOT NULL GROUP BY target_period"
  ).all();

  const byPriority = await db.prepare(
    "SELECT priority, COUNT(*) as c FROM tasks WHERE status NOT IN ('done') GROUP BY priority"
  ).all();

  const totalOpen = await db.prepare(
    "SELECT COUNT(*) as c FROM tasks WHERE status NOT IN ('done')"
  ).first();

  const moves = await db.prepare(
    "SELECT description, category, date FROM leadership_moves WHERE date >= ? ORDER BY date DESC"
  ).bind(weekAgo).all();

  // Prior-week counts (14d→7d window) so the digest can show direction, not
  // just this week's number — trajectory is what the succession story reads on.
  const twoWeeksAgo = new Date(now - 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const priorCompleted = await db.prepare(
    "SELECT COUNT(*) as c FROM tasks WHERE status = 'done' AND completed_at >= ? AND completed_at < ?"
  ).bind(twoWeeksAgo, weekAgo).first();
  const priorMoves = await db.prepare(
    "SELECT COUNT(*) as c FROM leadership_moves WHERE date >= ? AND date < ?"
  ).bind(twoWeeksAgo, weekAgo).first();
  const knowledgeWeek = await db.prepare(
    "SELECT COUNT(*) as c FROM knowledge WHERE created_at >= ?"
  ).bind(weekAgo).first();
  const priorKnowledge = await db.prepare(
    "SELECT COUNT(*) as c FROM knowledge WHERE created_at >= ? AND created_at < ?"
  ).bind(twoWeeksAgo, weekAgo).first();
  const intelWeek = await db.prepare(
    "SELECT COUNT(*) as c FROM people_intel WHERE created_at >= ?"
  ).bind(weekAgo).first();
  const priorIntel = await db.prepare(
    "SELECT COUNT(*) as c FROM people_intel WHERE created_at >= ? AND created_at < ?"
  ).bind(twoWeeksAgo, weekAgo).first();

  return {
    generated_at: now.toISOString(),
    week_ending: today,
    completed: completed.results,
    overdue: overdue.results,
    upcoming: upcoming.results,
    blocked: blocked.results,
    by_period: byPeriod.results,
    by_priority: byPriority.results,
    total_open: totalOpen.c,
    leadership_moves: moves.results,
    prior_week: {
      completed: priorCompleted.c,
      moves: priorMoves.c,
      knowledge: priorKnowledge.c,
      intel: priorIntel.c
    },
    this_week: {
      knowledge: knowledgeWeek.c,
      intel: intelWeek.c
    }
  };
}

// "12 (↑3 vs last wk)" / "(↓2)" / "(= last wk)" — plain text, email-safe.
function delta(current, prior) {
  if (prior === undefined || prior === null) return "";
  const d = current - prior;
  if (d === 0) return " (= last wk)";
  return ` (${d > 0 ? "↑" : "↓"}${Math.abs(d)} vs last wk)`;
}

function formatDigestEmail(data) {
  const lines = [];
  lines.push(`WEEKLY DIGEST — Week ending ${data.week_ending}`);
  lines.push(`Generated: ${new Date(data.generated_at).toLocaleString("en-US", { timeZone: "America/New_York" })}`);
  lines.push("");

  lines.push(`── COMPLETED THIS WEEK (${data.completed.length}${delta(data.completed.length, data.prior_week?.completed)}) ──`);
  if (data.completed.length === 0) {
    lines.push("  No tasks closed this week.");
  } else {
    for (const t of data.completed) {
      const src = t.source_label ? ` [${t.source_label}]` : "";
      lines.push(`  ✓ ${t.title}${src}`);
    }
  }
  lines.push("");

  if (data.overdue.length > 0) {
    lines.push(`── OVERDUE (${data.overdue.length}) ──`);
    for (const t of data.overdue) {
      const wait = t.waiting_on ? ` → waiting on: ${t.waiting_on}` : "";
      lines.push(`  ⚠ ${t.title} (due ${t.due_date}, ${t.priority})${wait}`);
    }
    lines.push("");
  }

  if (data.upcoming.length > 0) {
    lines.push(`── DUE NEXT 7 DAYS (${data.upcoming.length}) ──`);
    for (const t of data.upcoming) {
      const wait = t.waiting_on ? ` → waiting on: ${t.waiting_on}` : "";
      lines.push(`  → ${t.title} (due ${t.due_date}, ${t.priority})${wait}`);
    }
    lines.push("");
  }

  if (data.blocked.length > 0) {
    lines.push(`── BLOCKED (${data.blocked.length}) ──`);
    for (const t of data.blocked) {
      lines.push(`  ✋ ${t.title} → waiting on: ${t.waiting_on}`);
    }
    lines.push("");
  }

  lines.push(`── SNAPSHOT ──`);
  lines.push(`  Open tasks: ${data.total_open}`);
  if (data.this_week) {
    lines.push(`  Knowledge captured: ${data.this_week.knowledge}${delta(data.this_week.knowledge, data.prior_week?.knowledge)}`);
    lines.push(`  Intel captured: ${data.this_week.intel}${delta(data.this_week.intel, data.prior_week?.intel)}`);
  }
  for (const p of data.by_priority) {
    lines.push(`    ${p.priority}: ${p.c}`);
  }
  if (data.by_period.length > 0) {
    lines.push(`  By target period:`);
    for (const p of data.by_period) {
      lines.push(`    ${p.target_period}: ${p.c}`);
    }
  }
  lines.push("");

  if (data.leadership_moves.length > 0) {
    lines.push(`── LEADERSHIP MOVES THIS WEEK (${data.leadership_moves.length}${delta(data.leadership_moves.length, data.prior_week?.moves)}) ──`);
    for (const m of data.leadership_moves) {
      lines.push(`  ★ [${m.category}] ${m.description}`);
    }
    lines.push("");
  }

  lines.push("—");
  lines.push("Eaton EHS Command Center • https://eaton-ehs-cmd.netlify.app");

  return lines.join("\n");
}

async function sendDigestEmail(env, subject, body) {
  if (!env.RESEND_API_KEY) {
    console.error("RESEND_API_KEY not set — skipping email");
    return { success: false, reason: "no_resend_key" };
  }

  const fromEmail = env.DIGEST_FROM || "digest@florencescservices.com";
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: `Eaton EHS Digest <${fromEmail}>`,
      to: [env.DIGEST_TO || "cball8475@gmail.com"],
      subject: subject,
      text: body
    })
  });

  let detail = null;
  try { detail = await res.json(); } catch {}
  return {
    success: res.ok,
    status: res.status,
    id: detail?.id || null,
    error: res.ok ? null : (detail?.message || detail?.name || null)
  };
}

export default {
  // ── CRON HANDLER ──
  // "0 14 * * 5" → Friday weekly digest email. "0 12 * * 1" → Monday D1 backup.
  // A cron that reports success while its work silently failed is how the weekly
  // digest went missing for a month (RESEND_API_KEY 401 — kb/lessons.md 2026-07-25).
  // Both routines return {success:false} rather than throwing, and ctx.waitUntil()
  // never rejected into the old try/catch, so every run looked clean. Now a
  // non-success result throws inside the waitUntil promise, which marks the
  // invocation failed in Cloudflare instead of hiding it.
  async scheduled(controller, env, ctx) {
    const db = env.DB;
    if (controller.cron === "0 12 * * 1") {
      ctx.waitUntil((async () => {
        const r = await runBackup(env, db);
        if (!r?.success) {
          console.error("Backup cron FAILED:", JSON.stringify(r));
          throw new Error(`backup failed: ${r?.reason || r?.error || "unknown"}`);
        }
        console.log(`Backup pushed: ${r.path}`);
      })());
      return;
    }
    ctx.waitUntil((async () => {
      const data = await buildWeeklyDigest(db);
      const body = formatDigestEmail(data);
      const weekEnd = data.week_ending;
      const subject = `EHS Weekly Digest — ${weekEnd} | ${data.completed.length} closed, ${data.total_open} open${data.overdue.length > 0 ? `, ${data.overdue.length} overdue` : ""}`;
      const r = await sendDigestEmail(env, subject, body);
      if (!r?.success) {
        console.error("Digest cron FAILED:", JSON.stringify(r));
        throw new Error(`digest send failed (status ${r?.status ?? "n/a"}): ${r?.error || r?.reason || "unknown"}`);
      }
      console.log(`Weekly digest sent for week ending ${weekEnd} (resend id ${r.id})`);
    })());
  },

  async fetch(request, env, ctx) {
    if (request.method === "OPTIONS") return new Response(null, { headers: CORS });

    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;
    const db = env.DB;

    if (path === "/health" && method === "GET") {
      return json({ status: "ok", service: "eaton-ehs-api", version: VERSION, git_sha: env.GIT_SHA || "unknown", ts: new Date().toISOString() });
    }

    // Auth — prefer the Secrets Store binding (AUTH_TOKEN), fall back to the
    // per-worker API_TOKEN secret. The deployed worker has read from Secrets Store
    // since before it was tracked here; keep this so a repo deploy doesn't silently
    // change which secret is authoritative. Rotate the live token in the Secrets
    // Store value bound as AUTH_TOKEN, not the API_TOKEN fallback.
    const authHeader = request.headers.get("Authorization") || "";
    const token = authHeader.replace("Bearer ", "");
    let expectedToken = env.API_TOKEN;
    try {
      if (env.AUTH_TOKEN && typeof env.AUTH_TOKEN.get === "function") {
        expectedToken = await env.AUTH_TOKEN.get();
      }
    } catch (_) {}
    if (token !== expectedToken) return err("Unauthorized", 401);

    try {
      // ── DIGEST ──
      if (path === "/digest/preview" && method === "GET") {
        const data = await buildWeeklyDigest(db);
        const body = formatDigestEmail(data);
        return json({ digest: data, formatted: body });
      }

      if (path === "/digest/send" && method === "POST") {
        const data = await buildWeeklyDigest(db);
        const body = formatDigestEmail(data);
        const subject = `EHS Weekly Digest — ${data.week_ending} | ${data.completed.length} closed, ${data.total_open} open${data.overdue.length > 0 ? `, ${data.overdue.length} overdue` : ""}`;
        const result = await sendDigestEmail(env, subject, body);
        return json({ sent: result, digest: data, formatted: body });
      }

      // ── TASKS ──
      if (path === "/tasks" && method === "GET") {
        const status = url.searchParams.get("status");
        const assignee = url.searchParams.get("assignee_id");
        const priority = url.searchParams.get("priority");
        const search = url.searchParams.get("q");
        const ownership = url.searchParams.get("ownership");
        const targetPeriod = url.searchParams.get("target_period");
        const waitingOn = url.searchParams.get("waiting_on");
        const knowledgeType = url.searchParams.get("knowledge_type");
        const since = url.searchParams.get("since");
        const completedSince = url.searchParams.get("completed_since");
        const fields = url.searchParams.get("fields");
        const limit = url.searchParams.get("limit");
        let sql = "SELECT t.*, p.name as assignee_name FROM tasks t LEFT JOIN people p ON t.assignee_id = p.id";
        const params = [];
        const conditions = [];
        if (status) { conditions.push("t.status = ?"); params.push(status); }
        if (assignee) { conditions.push("t.assignee_id = ?"); params.push(assignee); }
        if (priority) { conditions.push("t.priority = ?"); params.push(priority); }
        if (search) { conditions.push("(t.title LIKE ? OR t.description LIKE ?)"); params.push(`%${search}%`, `%${search}%`); }
        if (ownership) { conditions.push("t.ownership = ?"); params.push(ownership); }
        if (targetPeriod) { conditions.push("t.target_period = ?"); params.push(targetPeriod); }
        if (waitingOn === "any") { conditions.push("t.waiting_on IS NOT NULL"); }
        else if (waitingOn) { conditions.push("t.waiting_on LIKE ?"); params.push(`%${waitingOn}%`); }
        if (knowledgeType) { conditions.push("t.knowledge_type = ?"); params.push(knowledgeType); }
        if (since) { conditions.push("t.created_at >= ?"); params.push(since); }
        if (completedSince) { conditions.push("t.completed_at >= ?"); params.push(completedSince); }
        if (conditions.length) sql += " WHERE " + conditions.join(" AND ");
        sql += " ORDER BY CASE WHEN t.due_date IS NULL THEN 1 ELSE 0 END, t.due_date ASC, CASE t.priority WHEN 'High' THEN 1 WHEN 'Medium' THEN 2 WHEN 'Low' THEN 3 END";
        sql += limitClause(limit);
        const { results } = await db.prepare(sql).bind(...params).all();
        return json({ tasks: projectFields(results, fields), count: results.length });
      }

      if (path === "/tasks" && method === "POST") {
        const body = await request.json();
        if (!body.title) return err("title is required");
        const taskEnumErr = validateEnums(body, ["status", "priority", "ownership", "target_period"]);
        if (taskEnumErr) return err(taskEnumErr);
        const result = await db.prepare(
          `INSERT INTO tasks (title, description, due_date, priority, status, assignee_id, automatable, recurring, recurrence_pattern, template_id, source, tags, notes, ai_extracted, source_label, source_meeting_id, ownership, waiting_on, knowledge_type, target_period)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(
          body.title, body.description || null, body.due_date || null,
          body.priority || "Medium", body.status || "todo",
          body.assignee_id || null, body.automatable ? 1 : 0,
          body.recurring ? 1 : 0, body.recurrence_pattern || null,
          body.template_id || null, body.source || "manual",
          body.tags || null, body.notes || null, body.ai_extracted ? 1 : 0,
          body.source_label || null, body.source_meeting_id || null,
          body.ownership || "mine", body.waiting_on || null,
          body.knowledge_type || null, body.target_period || null
        ).run();
        const created = await db.prepare("SELECT t.*, p.name as assignee_name FROM tasks t LEFT JOIN people p ON t.assignee_id = p.id WHERE t.id = ?").bind(result.meta.last_row_id).first();
        return json(created, 201);
      }

      if (matchPath(path, "/tasks/:id") && method === "PATCH") {
        const [id] = matchPath(path, "/tasks/:id");
        const body = await request.json();
        const taskPatchEnumErr = validateEnums(body, ["status", "priority", "ownership", "target_period"]);
        if (taskPatchEnumErr) return err(taskPatchEnumErr);
        const allowed = ["title","description","due_date","priority","status","assignee_id","automatable","recurring","recurrence_pattern","template_id","tags","notes","source_label","source_meeting_id","ownership","waiting_on","knowledge_type","target_period"];
        const sets = ["updated_at = datetime('now')"];
        const vals = [];
        for (const key of allowed) {
          if (body[key] !== undefined) { sets.push(`${key} = ?`); vals.push(body[key]); }
        }
        if (body.status === "done" && body.completed_at === undefined) { sets.push("completed_at = datetime('now')"); }
        vals.push(id);
        await db.prepare(`UPDATE tasks SET ${sets.join(", ")} WHERE id = ?`).bind(...vals).run();
        const updated = await db.prepare("SELECT t.*, p.name as assignee_name FROM tasks t LEFT JOIN people p ON t.assignee_id = p.id WHERE t.id = ?").bind(id).first();
        return json(updated);
      }

      if (matchPath(path, "/tasks/:id") && method === "DELETE") {
        const [id] = matchPath(path, "/tasks/:id");
        await db.prepare("DELETE FROM tasks WHERE id = ?").bind(id).run();
        return json({ deleted: true });
      }

      // ── LEADERSHIP MOVES ──
      if (path === "/moves" && method === "GET") {
        const category = url.searchParams.get("category");
        const since = url.searchParams.get("since");
        let sql = "SELECT * FROM leadership_moves";
        const params = [];
        const conditions = [];
        if (category) { conditions.push("category = ?"); params.push(category); }
        if (since) { conditions.push("date >= ?"); params.push(since); }
        if (conditions.length) sql += " WHERE " + conditions.join(" AND ");
        sql += " ORDER BY date DESC, created_at DESC";
        const { results } = await db.prepare(sql).bind(...params).all();
        return json({ moves: results, count: results.length });
      }

      if (path === "/moves" && method === "POST") {
        const body = await request.json();
        if (!body.description) return err("description is required");
        const result = await db.prepare(
          `INSERT INTO leadership_moves (date, description, category, context, people_involved, source_label, source_meeting_id)
           VALUES (?, ?, ?, ?, ?, ?, ?)`
        ).bind(
          body.date || new Date().toISOString().split("T")[0],
          body.description,
          body.category || "proactive",
          body.context || null,
          body.people_involved || null,
          body.source_label || null,
          body.source_meeting_id || null
        ).run();
        const created = await db.prepare("SELECT * FROM leadership_moves WHERE id = ?").bind(result.meta.last_row_id).first();
        return json(created, 201);
      }

      if (matchPath(path, "/moves/:id") && method === "PATCH") {
        const [id] = matchPath(path, "/moves/:id");
        const body = await request.json();
        const allowed = ["date","description","category","context","people_involved","source_label","source_meeting_id"];
        const sets = [];
        const vals = [];
        for (const key of allowed) {
          if (body[key] !== undefined) { sets.push(`${key} = ?`); vals.push(body[key]); }
        }
        if (!sets.length) return err("No fields to update");
        vals.push(id);
        await db.prepare(`UPDATE leadership_moves SET ${sets.join(", ")} WHERE id = ?`).bind(...vals).run();
        const updated = await db.prepare("SELECT * FROM leadership_moves WHERE id = ?").bind(id).first();
        return json(updated);
      }

      if (matchPath(path, "/moves/:id") && method === "DELETE") {
        const [id] = matchPath(path, "/moves/:id");
        await db.prepare("DELETE FROM leadership_moves WHERE id = ?").bind(id).run();
        return json({ deleted: true });
      }

      // ── WEEKLY REFLECTIONS ──
      if (path === "/reflections" && method === "GET") {
        const since = url.searchParams.get("since");
        let sql = "SELECT * FROM weekly_reflections";
        const params = [];
        if (since) { sql += " WHERE week_of >= ?"; params.push(since); }
        sql += " ORDER BY week_of DESC";
        const { results } = await db.prepare(sql).bind(...params).all();
        return json({ reflections: results, count: results.length });
      }

      if (path === "/reflections" && method === "POST") {
        const body = await request.json();
        if (!body.week_of) return err("week_of is required (YYYY-MM-DD of Monday)");
        const result = await db.prepare(
          `INSERT INTO weekly_reflections (week_of, influenced_vs_executed, clarity_created, learned_about_eaton, time_allocation_note, source_label)
           VALUES (?, ?, ?, ?, ?, ?)`
        ).bind(
          body.week_of,
          body.influenced_vs_executed || null,
          body.clarity_created || null,
          body.learned_about_eaton || null,
          body.time_allocation_note || null,
          body.source_label || null
        ).run();
        const created = await db.prepare("SELECT * FROM weekly_reflections WHERE id = ?").bind(result.meta.last_row_id).first();
        return json(created, 201);
      }

      if (matchPath(path, "/reflections/:id") && method === "PATCH") {
        const [id] = matchPath(path, "/reflections/:id");
        const body = await request.json();
        const allowed = ["week_of","influenced_vs_executed","clarity_created","learned_about_eaton","time_allocation_note","source_label"];
        const sets = [];
        const vals = [];
        for (const key of allowed) {
          if (body[key] !== undefined) { sets.push(`${key} = ?`); vals.push(body[key]); }
        }
        if (!sets.length) return err("No fields to update");
        vals.push(id);
        await db.prepare(`UPDATE weekly_reflections SET ${sets.join(", ")} WHERE id = ?`).bind(...vals).run();
        const updated = await db.prepare("SELECT * FROM weekly_reflections WHERE id = ?").bind(id).first();
        return json(updated);
      }

      if (matchPath(path, "/reflections/:id") && method === "DELETE") {
        const [id] = matchPath(path, "/reflections/:id");
        await db.prepare("DELETE FROM weekly_reflections WHERE id = ?").bind(id).run();
        return json({ deleted: true });
      }

      // ── EXPORT ──
      if (path === "/export" && method === "GET") {
        return json(await buildExport(db));
      }

      // ── BACKUP (manual trigger — the Monday cron runs the same routine) ──
      if (path === "/backup/run" && method === "POST") {
        const result = await runBackup(env, db);
        return json(result, result.success ? 200 : 500);
      }

      // ── SEARCH (FTS5 across knowledge, intel, tasks — ranked, snippeted) ──
      // ?mode=fts (default) | semantic | hybrid. Semantic needs the Vectorize
      // index + backfill; without them it reports semantic_available: false.
      if (path === "/search" && method === "GET") {
        const q = url.searchParams.get("q");
        if (!q || !q.trim()) return err("q is required");
        const mode = url.searchParams.get("mode") || "fts";
        const match = ftsMatchExpr(q);
        const n = Math.min(Math.max(parseInt(url.searchParams.get("limit"), 10) || 8, 1), 25);
        let semanticExtra = null;
        if (mode === "semantic" || mode === "hybrid") {
          let semantic = [];
          let semanticAvailable = vecEnabled(env);
          if (semanticAvailable) {
            try {
              semantic = await semanticSearch(env, db, q, n);
            } catch (e) {
              console.error("semantic search failed:", e.message);
              semanticAvailable = false;
            }
          }
          if (mode === "semantic") {
            return json({ query: q, mode, semantic_available: semanticAvailable, semantic, count: semantic.length });
          }
          semanticExtra = { semantic_available: semanticAvailable, semantic };
        }
        try {
          const knowledge = await db.prepare(
            `SELECT k.id, k.category, k.area, k.subject, k.created_at, k.superseded_by,
                    snippet(knowledge_fts, 1, '>>', '<<', ' … ', 16) as snippet,
                    bm25(knowledge_fts) as rank
             FROM knowledge_fts JOIN knowledge k ON k.id = knowledge_fts.rowid
             WHERE knowledge_fts MATCH ? AND k.superseded_by IS NULL
             ORDER BY rank LIMIT ?`
          ).bind(match, n).all();
          let intel;
          try {
            intel = await db.prepare(
              `SELECT i.id, i.person_name, i.intel_type, i.created_at,
                      snippet(intel_fts, 1, '>>', '<<', ' … ', 16) as snippet,
                      bm25(intel_fts) as rank
               FROM intel_fts JOIN people_intel i ON i.id = intel_fts.rowid
               WHERE intel_fts MATCH ? AND i.superseded_by IS NULL
               ORDER BY rank LIMIT ?`
            ).bind(match, n).all();
          } catch (e) {
            if (!isMigrationPending(e)) throw e;
            // pre-v3.9 migration: people_intel has no superseded_by yet
            intel = await db.prepare(
              `SELECT i.id, i.person_name, i.intel_type, i.created_at,
                      snippet(intel_fts, 1, '>>', '<<', ' … ', 16) as snippet,
                      bm25(intel_fts) as rank
               FROM intel_fts JOIN people_intel i ON i.id = intel_fts.rowid
               WHERE intel_fts MATCH ?
               ORDER BY rank LIMIT ?`
            ).bind(match, n).all();
          }
          const tasks = await db.prepare(
            `SELECT t.id, t.title, t.status, t.priority, t.due_date, t.created_at,
                    snippet(tasks_fts, 1, '>>', '<<', ' … ', 16) as snippet,
                    bm25(tasks_fts) as rank
             FROM tasks_fts JOIN tasks t ON t.id = tasks_fts.rowid
             WHERE tasks_fts MATCH ?
             ORDER BY rank LIMIT ?`
          ).bind(match, n).all();
          return json({
            query: q,
            mode,
            knowledge: knowledge.results,
            intel: intel.results,
            tasks: tasks.results,
            counts: { knowledge: knowledge.results.length, intel: intel.results.length, tasks: tasks.results.length },
            ...(semanticExtra || {})
          });
        } catch (e) {
          if (isMigrationPending(e)) return err("FTS index not built — run infra/migrations/2026-07-22-v3.8.0.sql", 503);
          throw e;
        }
      }

      // ── VECTORIZE BACKFILL (one-time after index creation; resumable) ──
      // POST /vectorize/backfill?offset=0 — embeds live knowledge + intel in
      // batches. Re-run with the returned next_offset until done: true.
      if (path === "/vectorize/backfill" && method === "POST") {
        if (!vecEnabled(env)) return err("Vectorize/AI bindings not configured — create the eaton-memory index and redeploy", 503);
        const offset = Math.max(parseInt(url.searchParams.get("offset"), 10) || 0, 0);
        const BATCH = 40; // rows per call — keeps well under subrequest and body limits
        const items = [];
        let know = [];
        try {
          const k = await db.prepare("SELECT id, subject, detail, people_involved FROM knowledge WHERE superseded_by IS NULL ORDER BY id").all();
          know = k.results;
        } catch (e) {
          if (!isMigrationPending(e)) throw e;
          const k = await db.prepare("SELECT id, subject, detail, people_involved FROM knowledge ORDER BY id").all();
          know = k.results;
        }
        for (const r of know) items.push({ id: `knowledge:${r.id}`, kind: "knowledge", ref_id: r.id, text: knowledgeEmbedText(r) });
        const i = await db.prepare("SELECT id, person_name, intel_type, content FROM people_intel ORDER BY id").all();
        for (const r of i.results) items.push({ id: `intel:${r.id}`, kind: "intel", ref_id: r.id, text: intelEmbedText(r) });
        const slice = items.slice(offset, offset + BATCH);
        if (slice.length) {
          const vectors = await embedTexts(env, slice.map(s => s.text));
          await env.VECTORIZE.upsert(slice.map((s, idx) => ({
            id: s.id, values: vectors[idx], metadata: { kind: s.kind, ref_id: s.ref_id }
          })));
        }
        const nextOffset = offset + slice.length;
        return json({
          embedded: slice.length,
          total: items.length,
          next_offset: nextOffset,
          done: nextOffset >= items.length
        });
      }

      // ── TRENDS (weekly time series — the trajectory view /weekly and Laura care about) ──
      if (path === "/trends" && method === "GET") {
        const weeks = Math.min(Math.max(parseInt(url.searchParams.get("weeks"), 10) || 12, 1), 52);
        const sinceExpr = `-${weeks * 7} days`;
        // %Y-%W groups by year-week; good enough for trend lines, no week-boundary math.
        const tasksCreated = await db.prepare(
          "SELECT strftime('%Y-%W', created_at) as week, COUNT(*) as c FROM tasks WHERE created_at >= date('now', ?) GROUP BY week ORDER BY week"
        ).bind(sinceExpr).all();
        const tasksCompleted = await db.prepare(
          "SELECT strftime('%Y-%W', completed_at) as week, COUNT(*) as c FROM tasks WHERE completed_at >= date('now', ?) AND status = 'done' GROUP BY week ORDER BY week"
        ).bind(sinceExpr).all();
        const knowledgeAdded = await db.prepare(
          "SELECT strftime('%Y-%W', created_at) as week, COUNT(*) as c FROM knowledge WHERE created_at >= date('now', ?) GROUP BY week ORDER BY week"
        ).bind(sinceExpr).all();
        const intelAdded = await db.prepare(
          "SELECT strftime('%Y-%W', created_at) as week, COUNT(*) as c FROM people_intel WHERE created_at >= date('now', ?) GROUP BY week ORDER BY week"
        ).bind(sinceExpr).all();
        const movesByWeek = await db.prepare(
          "SELECT strftime('%Y-%W', date) as week, category, COUNT(*) as c FROM leadership_moves WHERE date >= date('now', ?) GROUP BY week, category ORDER BY week"
        ).bind(sinceExpr).all();
        const reflectionWeeks = await db.prepare(
          "SELECT week_of FROM weekly_reflections WHERE week_of >= date('now', ?) ORDER BY week_of"
        ).bind(sinceExpr).all();
        let scoreboardHistory = [];
        try {
          const sh = await db.prepare(
            "SELECT * FROM scoreboard_history WHERE snapshot_date >= date('now', ?) ORDER BY snapshot_date"
          ).bind(sinceExpr).all();
          scoreboardHistory = sh.results;
        } catch (e) {
          if (!isMigrationPending(e)) throw e; // pre-migration: series just comes back empty
        }
        return json({
          generated_at: new Date().toISOString(),
          weeks,
          tasks_created: tasksCreated.results,
          tasks_completed: tasksCompleted.results,
          knowledge_added: knowledgeAdded.results,
          intel_added: intelAdded.results,
          moves_by_week: movesByWeek.results,
          reflection_weeks: reflectionWeeks.results.map(r => r.week_of),
          scoreboard_history: scoreboardHistory
        });
      }

      // ── PEOPLE ──
      if (path === "/people" && method === "GET") {
        const dept = url.searchParams.get("department");
        const since = url.searchParams.get("since");
        const fields = url.searchParams.get("fields");
        const limit = url.searchParams.get("limit");
        let sql = "SELECT p.*, COUNT(t.id) as active_tasks FROM people p LEFT JOIN tasks t ON t.assignee_id = p.id AND t.status NOT IN ('done')";
        const params = [];
        const conditions = [];
        if (dept) { conditions.push("p.department = ?"); params.push(dept); }
        if (since) { conditions.push("p.created_at >= ?"); params.push(since); }
        if (conditions.length) sql += " WHERE " + conditions.join(" AND ");
        sql += " GROUP BY p.id ORDER BY p.name";
        sql += limitClause(limit);
        const { results } = await db.prepare(sql).bind(...params).all();
        return json({ people: projectFields(results, fields), count: results.length });
      }

      if (path === "/people" && method === "POST") {
        const body = await request.json();
        if (!body.name) return err("name is required");
        const result = await db.prepare(
          `INSERT INTO people (name, department, area, expertise, strength, go_to_for, reliability, contact_info, notes)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(body.name, body.department || null, body.area || null, body.expertise || null, body.strength || null, body.go_to_for || null, body.reliability || "watching", body.contact_info || null, body.notes || null).run();
        const created = await db.prepare("SELECT * FROM people WHERE id = ?").bind(result.meta.last_row_id).first();
        return json(created, 201);
      }

      if (matchPath(path, "/people/:id") && method === "PATCH") {
        const [id] = matchPath(path, "/people/:id");
        const body = await request.json();
        const allowed = ["name","department","area","expertise","strength","go_to_for","reliability","contact_info","notes"];
        const sets = ["updated_at = datetime('now')"];
        const vals = [];
        for (const key of allowed) {
          if (body[key] !== undefined) { sets.push(`${key} = ?`); vals.push(body[key]); }
        }
        vals.push(id);
        await db.prepare(`UPDATE people SET ${sets.join(", ")} WHERE id = ?`).bind(...vals).run();
        const updated = await db.prepare("SELECT * FROM people WHERE id = ?").bind(id).first();
        return json(updated);
      }

      if (matchPath(path, "/people/:id") && method === "DELETE") {
        const [id] = matchPath(path, "/people/:id");
        await db.prepare("UPDATE tasks SET assignee_id = NULL WHERE assignee_id = ?").bind(id).run();
        await db.prepare("DELETE FROM people WHERE id = ?").bind(id).run();
        return json({ deleted: true });
      }

      if (matchPath(path, "/people/:id/tasks") && method === "GET") {
        const [id] = matchPath(path, "/people/:id/tasks");
        const { results } = await db.prepare("SELECT * FROM tasks WHERE assignee_id = ? ORDER BY CASE WHEN due_date IS NULL THEN 1 ELSE 0 END, due_date ASC").bind(id).all();
        return json({ tasks: results, count: results.length });
      }

      // ── TEMPLATES ──
      if (path === "/templates" && method === "GET") {
        const { results } = await db.prepare("SELECT * FROM templates ORDER BY name").all();
        return json({ templates: results, count: results.length });
      }

      if (path === "/templates" && method === "POST") {
        const body = await request.json();
        if (!body.name) return err("name is required");
        const result = await db.prepare(
          `INSERT INTO templates (name, description, default_priority, default_status, default_tags, checklist)
           VALUES (?, ?, ?, ?, ?, ?)`
        ).bind(body.name, body.description || null, body.default_priority || "Medium", body.default_status || "todo", body.default_tags || null, body.checklist ? JSON.stringify(body.checklist) : null).run();
        const created = await db.prepare("SELECT * FROM templates WHERE id = ?").bind(result.meta.last_row_id).first();
        return json(created, 201);
      }

      // ── OTTER EXTRACT ──
      if (path === "/otter/extract" && method === "POST") {
        const body = await request.json();
        if (!body.transcript) return err("transcript is required");
        if (!env.ANTHROPIC_API_KEY) return err("ANTHROPIC_API_KEY secret is not set on the worker (wiped by a PUT-based redeploy? see infra/deploy-notes.md)", 500);
        const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": env.ANTHROPIC_API_KEY,
            "anthropic-version": "2023-06-01"
          },
          body: JSON.stringify({
            model: "claude-sonnet-5",
            // Sonnet 5 runs adaptive thinking when the field is omitted; keep it off so
            // max_tokens stays output-only for this fixed JSON extraction.
            thinking: { type: "disabled" },
            max_tokens: 3000,
            system: `Today's date is ${new Date().toISOString().slice(0, 10)}. You are an EHS task extractor. Given a meeting transcript, extract action items and tasks. Resolve relative dates ("Friday", "August 1st") against today's date — never a past year. Return ONLY valid JSON with this structure:
{
  "tasks": [
    {
      "title": "short action title",
      "description": "more detail if available",
      "due_date": "YYYY-MM-DD or null",
      "priority": "High|Medium|Low",
      "assignee_hint": "person name or null",
      "automatable": false,
      "recurring": false,
      "ownership": "mine|fyi",
      "waiting_on": "who/what is blocking or null",
      "knowledge_type": "documented|tribal-knowledge or null",
      "target_period": "this-week|30-day|60-day|90-day|ongoing or null"
    }
  ],
  "leadership_moves": [
    {
      "description": "what Charlie did that shows leadership",
      "category": "proactive|influence|visibility|mentoring|decision|clarity|ownership",
      "context": "brief context",
      "people_involved": "names or null"
    }
  ]
}
Be specific and concise. Only extract clear action items. Mark ownership as "fyi" if the task belongs to someone else and Charlie is just tracking it. For leadership_moves, only include moments where Charlie proactively led, influenced, created clarity, or took ownership beyond his basic job duties.`,
            messages: [{ role: "user", content: `Extract tasks and leadership moves from this transcript:\n\n${body.transcript}` }]
          })
        });
        const aiData = await anthropicRes.json();
        // Never fold an API error into an empty success — a silent `raw:"{}"` hid the
        // Sonnet 4 retirement for weeks (kb/lessons.md 2026-07-24).
        if (!anthropicRes.ok) {
          return err(`Anthropic API ${anthropicRes.status} (${aiData.error?.type || "error"}): ${aiData.error?.message || anthropicRes.statusText}`, 502);
        }
        const rawText = aiData.content?.filter(b => b.type === "text").map(b => b.text).join("") || "{}";
        let parsed;
        try { parsed = JSON.parse(rawText.replace(/```json|```/g, "").trim()); }
        catch { parsed = { tasks: [], leadership_moves: [] }; }
        return json({ extracted_tasks: parsed.tasks || [], extracted_moves: parsed.leadership_moves || [], raw: rawText });
      }

      // (old tribal_knowledge routes removed — knowledge routes below query the correct table)

      // ── PEOPLE INTEL ──
      if (path === "/intel" && method === "GET") {
        const personId = url.searchParams.get("person_id");
        const personName = url.searchParams.get("person_name");
        const intelType = url.searchParams.get("intel_type");
        const search = url.searchParams.get("q");
        const since = url.searchParams.get("since");
        const fields = url.searchParams.get("fields");
        const limit = url.searchParams.get("limit");
        const includeSupersededIntel = url.searchParams.get("include_superseded") === "1";
        let sql = "SELECT i.*, p.name as linked_person_name FROM people_intel i LEFT JOIN people p ON i.person_id = p.id";
        const params = [];
        const conditions = [];
        if (personId) { conditions.push("i.person_id = ?"); params.push(personId); }
        if (personName) { conditions.push("i.person_name LIKE ?"); params.push(`%${personName}%`); }
        if (intelType) { conditions.push("i.intel_type = ?"); params.push(intelType); }
        if (search) { conditions.push("i.content LIKE ?"); params.push(`%${search}%`); }
        if (since) { conditions.push("i.created_at >= ?"); params.push(since); }
        if (!includeSupersededIntel) conditions.push("i.superseded_by IS NULL");
        let results;
        try {
          let q = sql + (conditions.length ? " WHERE " + conditions.join(" AND ") : "") + " ORDER BY i.created_at DESC" + limitClause(limit);
          ({ results } = await db.prepare(q).bind(...params).all());
        } catch (e) {
          if (!isMigrationPending(e)) throw e;
          // pre-v3.9 migration: no superseded_by column — rerun without that filter
          const legacy = conditions.filter(c => c !== "i.superseded_by IS NULL");
          let q = sql + (legacy.length ? " WHERE " + legacy.join(" AND ") : "") + " ORDER BY i.created_at DESC" + limitClause(limit);
          ({ results } = await db.prepare(q).bind(...params).all());
        }
        return json({ intel: projectFields(results, fields), count: results.length });
      }

      if (path === "/intel" && method === "POST") {
        const body = await request.json();
        if (!body.person_name || !body.intel_type || !body.content) return err("person_name, intel_type, and content are required");
        const validTypes = ["relationship","political","working_style","reliability","alignment","history","strength","weakness","opportunity"];
        if (!validTypes.includes(body.intel_type)) return err(`intel_type must be one of: ${validTypes.join(", ")}`);
        // Resolve person_name → person_id so intel links to a real person row.
        // needs_link = true when the caller gave no id and the name matched 0 or 2+ people.
        let resolvedPersonId = body.person_id || null;
        let needsLink = false;
        if (!resolvedPersonId) {
          const matches = await db.prepare("SELECT id FROM people WHERE name = ? COLLATE NOCASE").bind(body.person_name).all();
          if (matches.results.length === 1) resolvedPersonId = matches.results[0].id;
          else needsLink = true;
        }
        // Write-time conflict check — mirror of the knowledge one: live entries for
        // the same person + intel_type surface BEFORE this lands. Advisory only.
        let intelConflicts = [];
        try {
          const existing = await db.prepare(
            "SELECT id, person_name, intel_type, content, created_at FROM people_intel WHERE person_name = ? COLLATE NOCASE AND intel_type = ? AND superseded_by IS NULL ORDER BY created_at DESC LIMIT 5"
          ).bind(body.person_name, body.intel_type).all();
          intelConflicts = existing.results;
        } catch (e) {
          if (!isMigrationPending(e)) throw e;
        }
        let result;
        try {
          result = await db.prepare(
            `INSERT INTO people_intel (person_id, person_name, intel_type, content, source_label, source_meeting_id, confidence)
             VALUES (?, ?, ?, ?, ?, ?, ?)`
          ).bind(
            resolvedPersonId, body.person_name,
            body.intel_type, body.content,
            body.source_label || null, body.source_meeting_id || null,
            body.confidence || null
          ).run();
        } catch (e) {
          if (!isMigrationPending(e)) throw e;
          result = await db.prepare(
            `INSERT INTO people_intel (person_id, person_name, intel_type, content, source_label, source_meeting_id)
             VALUES (?, ?, ?, ?, ?, ?)`
          ).bind(
            resolvedPersonId, body.person_name,
            body.intel_type, body.content,
            body.source_label || null, body.source_meeting_id || null
          ).run();
        }
        const created = await db.prepare("SELECT i.*, p.name as linked_person_name FROM people_intel i LEFT JOIN people p ON i.person_id = p.id WHERE i.id = ?").bind(result.meta.last_row_id).first();
        ctx.waitUntil(upsertVector(env, "intel", created.id, intelEmbedText(created)));
        return json({ ...created, needs_link: needsLink, conflicts: intelConflicts, has_conflicts: intelConflicts.length > 0 }, 201);
      }

      if (matchPath(path, "/intel/:id") && method === "PATCH") {
        const [id] = matchPath(path, "/intel/:id");
        const body = await request.json();
        const allowed = ["person_id","person_name","intel_type","content","source_label","source_meeting_id","superseded_by","confidence"];
        const sets = [];
        const vals = [];
        for (const key of allowed) {
          if (body[key] !== undefined) { sets.push(`${key} = ?`); vals.push(body[key]); }
        }
        if (!sets.length) return err("No fields to update");
        vals.push(id);
        await db.prepare(`UPDATE people_intel SET ${sets.join(", ")} WHERE id = ?`).bind(...vals).run();
        const updated = await db.prepare("SELECT i.*, p.name as linked_person_name FROM people_intel i LEFT JOIN people p ON i.person_id = p.id WHERE i.id = ?").bind(id).first();
        if (updated.superseded_by != null) ctx.waitUntil(deleteVector(env, "intel", id));
        else ctx.waitUntil(upsertVector(env, "intel", id, intelEmbedText(updated)));
        return json(updated);
      }

      if (matchPath(path, "/intel/:id") && method === "DELETE") {
        const [id] = matchPath(path, "/intel/:id");
        await db.prepare("DELETE FROM people_intel WHERE id = ?").bind(id).run();
        ctx.waitUntil(deleteVector(env, "intel", id));
        return json({ deleted: true });
      }

      // ── KNOWLEDGE ──
      if (path === "/knowledge" && method === "GET") {
        const category = url.searchParams.get("category");
        const area = url.searchParams.get("area");
        const search = url.searchParams.get("q");
        const since = url.searchParams.get("since");
        const fields = url.searchParams.get("fields");
        const limit = url.searchParams.get("limit");
        const includeSuperseded = url.searchParams.get("include_superseded") === "1";
        let sql = "SELECT * FROM knowledge";
        const params = [];
        const conditions = [];
        if (category) { conditions.push("category = ?"); params.push(category); }
        if (area) { conditions.push("area = ?"); params.push(area); }
        if (search) { conditions.push("(subject LIKE ? OR detail LIKE ?)"); params.push(`%${search}%`, `%${search}%`); }
        if (since) { conditions.push("created_at >= ?"); params.push(since); }
        if (!includeSuperseded) conditions.push("superseded_by IS NULL");
        let results;
        try {
          let q = sql + (conditions.length ? " WHERE " + conditions.join(" AND ") : "") + " ORDER BY created_at DESC" + limitClause(limit);
          ({ results } = await db.prepare(q).bind(...params).all());
        } catch (e) {
          if (!isMigrationPending(e)) throw e;
          // Pre-migration: no superseded_by column — rerun without that filter.
          const legacy = conditions.filter(c => c !== "superseded_by IS NULL");
          let q = sql + (legacy.length ? " WHERE " + legacy.join(" AND ") : "") + " ORDER BY created_at DESC" + limitClause(limit);
          ({ results } = await db.prepare(q).bind(...params).all());
        }
        return json({ knowledge: projectFields(results, fields), count: results.length });
      }

      if (path === "/knowledge" && method === "POST") {
        const body = await request.json();
        if (!body.category || !body.area || !body.subject || !body.detail) {
          return err("category, area, subject, and detail are required");
        }
        // Write-time conflict check: surface live entries on the same subject BEFORE
        // this one lands, so contradictions get flagged at capture instead of waiting
        // for the monthly /audit. Purely advisory — never blocks the insert.
        let conflicts = [];
        try {
          const existing = await db.prepare(
            "SELECT id, category, area, subject, detail, created_at FROM knowledge WHERE subject = ? COLLATE NOCASE AND superseded_by IS NULL ORDER BY created_at DESC LIMIT 5"
          ).bind(body.subject).all();
          conflicts = existing.results;
        } catch (e) {
          if (!isMigrationPending(e)) throw e;
        }
        let result;
        try {
          result = await db.prepare(
            `INSERT INTO knowledge (category, area, subject, detail, people_involved, source_label, source_meeting_id, tags, related_ids, confidence)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
          ).bind(
            body.category, body.area, body.subject, body.detail,
            body.people_involved || null, body.source_label || null,
            body.source_meeting_id || null, body.tags || null,
            body.related_ids || null, body.confidence || null
          ).run();
        } catch (e) {
          if (!isMigrationPending(e)) throw e;
          result = await db.prepare(
            `INSERT INTO knowledge (category, area, subject, detail, people_involved, source_label, source_meeting_id, tags)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
          ).bind(
            body.category, body.area, body.subject, body.detail,
            body.people_involved || null, body.source_label || null,
            body.source_meeting_id || null, body.tags || null
          ).run();
        }
        const created = await db.prepare("SELECT * FROM knowledge WHERE id = ?").bind(result.meta.last_row_id).first();
        ctx.waitUntil(upsertVector(env, "knowledge", created.id, knowledgeEmbedText(created)));
        return json({ ...created, conflicts, has_conflicts: conflicts.length > 0 }, 201);
      }

      // Resolve a knowledge entry's edges: related_ids out, plus anything pointing back.
      if (matchPath(path, "/knowledge/:id/related") && method === "GET") {
        const [id] = matchPath(path, "/knowledge/:id/related");
        const row = await db.prepare("SELECT * FROM knowledge WHERE id = ?").bind(id).first();
        if (!row) return err("Not found", 404);
        let related = [], supersededBy = null, supersedes = [];
        try {
          const ids = (row.related_ids || "").split(",").map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
          if (ids.length) {
            const placeholders = ids.map(() => "?").join(",");
            const rel = await db.prepare(`SELECT id, category, area, subject, created_at, superseded_by FROM knowledge WHERE id IN (${placeholders})`).bind(...ids).all();
            related = rel.results;
          }
          if (row.superseded_by) {
            supersededBy = await db.prepare("SELECT id, subject, created_at FROM knowledge WHERE id = ?").bind(row.superseded_by).first();
          }
          const sup = await db.prepare("SELECT id, subject, created_at FROM knowledge WHERE superseded_by = ?").bind(id).all();
          supersedes = sup.results;
          const backlinks = await db.prepare(
            "SELECT id, category, area, subject, created_at FROM knowledge WHERE (',' || related_ids || ',') LIKE ? AND id != ?"
          ).bind(`%,${id},%`, id).all();
          for (const b of backlinks.results) {
            if (!related.some(r => r.id === b.id)) related.push({ ...b, backlink: true });
          }
        } catch (e) {
          if (!isMigrationPending(e)) throw e;
        }
        return json({ entry: row, related, superseded_by_entry: supersededBy, supersedes });
      }

      if (matchPath(path, "/knowledge/:id") && method === "PATCH") {
        const [id] = matchPath(path, "/knowledge/:id");
        const body = await request.json();
        const allowed = ["category","area","subject","detail","people_involved","source_label","source_meeting_id","tags","related_ids","superseded_by","confidence"];
        const sets = ["updated_at = datetime('now')"];
        const vals = [];
        for (const key of allowed) {
          if (body[key] !== undefined) { sets.push(`${key} = ?`); vals.push(body[key]); }
        }
        vals.push(id);
        await db.prepare(`UPDATE knowledge SET ${sets.join(", ")} WHERE id = ?`).bind(...vals).run();
        const updated = await db.prepare("SELECT * FROM knowledge WHERE id = ?").bind(id).first();
        if (updated.superseded_by != null) ctx.waitUntil(deleteVector(env, "knowledge", id));
        else ctx.waitUntil(upsertVector(env, "knowledge", id, knowledgeEmbedText(updated)));
        return json(updated);
      }

      if (matchPath(path, "/knowledge/:id") && method === "DELETE") {
        const [id] = matchPath(path, "/knowledge/:id");
        await db.prepare("DELETE FROM knowledge WHERE id = ?").bind(id).run();
        ctx.waitUntil(deleteVector(env, "knowledge", id));
        return json({ deleted: true });
      }

      // Convenience: get all intel for one person
      if (matchPath(path, "/people/:id/intel") && method === "GET") {
        const [id] = matchPath(path, "/people/:id/intel");
        const { results } = await db.prepare(
          "SELECT * FROM people_intel WHERE person_id = ? ORDER BY created_at DESC"
        ).bind(id).all();
        return json({ intel: results, count: results.length });
      }

      // ── SCOREBOARD (single-row metrics dashboard for safety pulse) ──
      if (path === "/scoreboard" && method === "GET") {
        const row = await db.prepare("SELECT * FROM scoreboard WHERE id = 1").first();
        return json(withScoreboardAge(row));
      }

      if (path === "/scoreboard" && method === "PATCH") {
        const body = await request.json();
        const allowed = ["trir","recordables_ytd","lost_time_incidents_ytd","near_misses_ytd","observations_month","observations_ytd","positive_interrupters_month","man_hours_ytd","man_hours_target","forklift_incidents_ytd","forklift_incidents_target_reduction","notes","updated_by"];
        const sets = [];
        const vals = [];
        for (const k of allowed) {
          if (body[k] !== undefined) { sets.push(`${k} = ?`); vals.push(body[k]); }
        }
        if (!sets.length) return err("No valid fields to update. Allowed: " + allowed.join(", "));
        sets.push("last_updated = ?");
        vals.push(new Date().toISOString());
        await db.prepare(`UPDATE scoreboard SET ${sets.join(", ")} WHERE id = 1`).bind(...vals).run();
        const updated = await db.prepare("SELECT * FROM scoreboard WHERE id = 1").first();
        // Snapshot into history so /trends can chart the metrics over time.
        // One row per day — a same-day re-patch replaces that day's snapshot.
        try {
          await db.prepare("DELETE FROM scoreboard_history WHERE snapshot_date = date('now')").run();
          await db.prepare(
            `INSERT INTO scoreboard_history (snapshot_date, trir, recordables_ytd, lost_time_incidents_ytd, near_misses_ytd, observations_month, observations_ytd, positive_interrupters_month, man_hours_ytd, forklift_incidents_ytd, notes)
             SELECT date('now'), trir, recordables_ytd, lost_time_incidents_ytd, near_misses_ytd, observations_month, observations_ytd, positive_interrupters_month, man_hours_ytd, forklift_incidents_ytd, notes FROM scoreboard WHERE id = 1`
          ).run();
        } catch (e) {
          if (!isMigrationPending(e)) throw e; // pre-migration: skip snapshot silently
        }
        return json(updated);
      }

      // ── STATS ──
      if (path === "/stats" && method === "GET") {
        return json(await computeStats(db));
      }

      // ── COMPOSITE: PULSE (everything /status needs in one call) ──
      if (path === "/pulse" && method === "GET") {
        const today = new Date().toISOString().split("T")[0];
        const stats = await computeStats(db);
        const overdueTop = await db.prepare(
          "SELECT title, due_date, priority, waiting_on FROM tasks WHERE due_date < ? AND status NOT IN ('done') ORDER BY due_date ASC LIMIT 3"
        ).bind(today).all();
        const blockers = await db.prepare(
          "SELECT title, waiting_on, priority FROM tasks WHERE waiting_on IS NOT NULL AND status NOT IN ('done') ORDER BY CASE priority WHEN 'High' THEN 1 WHEN 'Medium' THEN 2 ELSE 3 END LIMIT 5"
        ).all();
        return json({
          generated_at: new Date().toISOString(),
          stats,
          overdue_top: overdueTop.results,
          blockers: blockers.results
        });
      }

      // ── COMPOSITE: BRIEF (everything /morning needs in one call) ──
      if (path === "/brief" && method === "GET") {
        const now = new Date();
        const today = now.toISOString().split("T")[0];
        const yesterday = new Date(now.getTime() - 86400000).toISOString().split("T")[0];
        const since14 = new Date(now.getTime() - 14 * 86400000).toISOString().split("T")[0];
        const stats = await computeStats(db);
        const openMine = await db.prepare(
          "SELECT t.id, t.title, t.priority, t.due_date, t.target_period, t.waiting_on, t.tags FROM tasks t WHERE t.status = 'todo' AND t.ownership = 'mine' ORDER BY CASE WHEN t.due_date IS NULL THEN 1 ELSE 0 END, t.due_date ASC, CASE t.priority WHEN 'High' THEN 1 WHEN 'Medium' THEN 2 ELSE 3 END"
        ).all();
        const overdue = await db.prepare(
          "SELECT id, title, due_date, priority, waiting_on FROM tasks WHERE due_date < ? AND status NOT IN ('done') ORDER BY due_date ASC"
        ).bind(today).all();
        const dueToday = await db.prepare(
          "SELECT id, title, priority, waiting_on FROM tasks WHERE due_date = ? AND status NOT IN ('done')"
        ).bind(today).all();
        const blocked = await db.prepare(
          "SELECT id, title, waiting_on, priority FROM tasks WHERE waiting_on IS NOT NULL AND status NOT IN ('done') ORDER BY CASE priority WHEN 'High' THEN 1 WHEN 'Medium' THEN 2 ELSE 3 END"
        ).all();
        const completedSinceYesterday = await db.prepare(
          "SELECT id, title, completed_at, priority, notes FROM tasks WHERE completed_at >= ? AND status = 'done' ORDER BY completed_at DESC"
        ).bind(yesterday).all();
        const scoreboard = await db.prepare("SELECT * FROM scoreboard WHERE id = 1").first();
        const recentIntel = await db.prepare(
          "SELECT person_name, intel_type, created_at FROM people_intel WHERE created_at >= ? ORDER BY created_at DESC"
        ).bind(since14).all();
        const peopleNames = await db.prepare("SELECT id, name FROM people ORDER BY name").all();
        return json({
          generated_at: now.toISOString(),
          today,
          stats,
          open_mine: openMine.results,
          overdue: overdue.results,
          due_today: dueToday.results,
          blocked: blocked.results,
          completed_since_yesterday: completedSinceYesterday.results,
          scoreboard: withScoreboardAge(scoreboard),
          recent_intel: recentIntel.results,
          people_names: peopleNames.results
        });
      }

      return err("Not found", 404);
    } catch (e) {
      console.error("EHS API error:", e);
      return err(e.message || "Internal error", 500);
    }
  }
};
