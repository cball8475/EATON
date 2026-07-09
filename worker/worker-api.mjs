// eaton-ehs-api Worker v3.4.0
// Deployed to: https://eaton-ehs-api.cball8475.workers.dev
// D1 binding: DB → 62ce85d7-0cc1-4832-aa57-d5b09ceaa132
// Secrets: API_TOKEN, ANTHROPIC_API_KEY, SENDGRID_API_KEY (optional)
// Cron: "0 14 * * 5" (Friday 10am ET)
// Last deployed from project: 2026-05-27 (v3.4.0 — added ?completed_since to /tasks for /close + /morning Step 4)

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
    leadership_moves: moves.results
  };
}

function formatDigestEmail(data) {
  const lines = [];
  lines.push(`WEEKLY DIGEST — Week ending ${data.week_ending}`);
  lines.push(`Generated: ${new Date(data.generated_at).toLocaleString("en-US", { timeZone: "America/New_York" })}`);
  lines.push("");

  lines.push(`── COMPLETED THIS WEEK (${data.completed.length}) ──`);
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
    lines.push(`── LEADERSHIP MOVES THIS WEEK (${data.leadership_moves.length}) ──`);
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
  if (!env.SENDGRID_API_KEY) {
    console.error("SENDGRID_API_KEY not set — skipping email");
    return { success: false, reason: "no_sendgrid_key" };
  }

  const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${env.SENDGRID_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: env.DIGEST_TO || "cball8475@gmail.com" }] }],
      from: { email: env.DIGEST_FROM || "digest@florencescservices.com", name: "Eaton EHS Digest" },
      subject: subject,
      content: [{ type: "text/plain", value: body }]
    })
  });

  return { success: res.ok, status: res.status };
}

export default {
  // ── CRON HANDLER ──
  async scheduled(controller, env, ctx) {
    const db = env.DB;
    try {
      const data = await buildWeeklyDigest(db);
      const body = formatDigestEmail(data);
      const weekEnd = data.week_ending;
      const subject = `EHS Weekly Digest — ${weekEnd} | ${data.completed.length} closed, ${data.total_open} open${data.overdue.length > 0 ? `, ${data.overdue.length} overdue` : ""}`;
      ctx.waitUntil(sendDigestEmail(env, subject, body));
      console.log(`Weekly digest sent for week ending ${weekEnd}`);
    } catch (e) {
      console.error("Digest cron error:", e);
    }
  },

  async fetch(request, env) {
    if (request.method === "OPTIONS") return new Response(null, { headers: CORS });

    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;
    const db = env.DB;

    if (path === "/health" && method === "GET") {
      return json({ status: "ok", service: "eaton-ehs-api", version: "3.4.0", ts: new Date().toISOString() });
    }

    // Auth
    const authHeader = request.headers.get("Authorization") || "";
    const token = authHeader.replace("Bearer ", "");
    if (token !== env.API_TOKEN) return err("Unauthorized", 401);

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
        const tasks = await db.prepare("SELECT t.*, p.name as assignee_name FROM tasks t LEFT JOIN people p ON t.assignee_id = p.id ORDER BY t.id").all();
        const people = await db.prepare("SELECT * FROM people ORDER BY id").all();
        const templates = await db.prepare("SELECT * FROM templates ORDER BY id").all();
        const moves = await db.prepare("SELECT * FROM leadership_moves ORDER BY date DESC").all();
        const reflections = await db.prepare("SELECT * FROM weekly_reflections ORDER BY week_of DESC").all();
        const knowledge = await db.prepare("SELECT * FROM knowledge ORDER BY created_at DESC").all();
        const intel = await db.prepare("SELECT i.*, p.name as linked_person_name FROM people_intel i LEFT JOIN people p ON i.person_id = p.id ORDER BY i.created_at DESC").all();
        return json({
          exported_at: new Date().toISOString(),
          version: "3.2.0",
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
        const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": env.ANTHROPIC_API_KEY,
            "anthropic-version": "2023-06-01"
          },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 2000,
            system: `You are an EHS task extractor. Given a meeting transcript, extract action items and tasks. Return ONLY valid JSON with this structure:
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
        let sql = "SELECT i.*, p.name as linked_person_name FROM people_intel i LEFT JOIN people p ON i.person_id = p.id";
        const params = [];
        const conditions = [];
        if (personId) { conditions.push("i.person_id = ?"); params.push(personId); }
        if (personName) { conditions.push("i.person_name LIKE ?"); params.push(`%${personName}%`); }
        if (intelType) { conditions.push("i.intel_type = ?"); params.push(intelType); }
        if (search) { conditions.push("i.content LIKE ?"); params.push(`%${search}%`); }
        if (since) { conditions.push("i.created_at >= ?"); params.push(since); }
        if (conditions.length) sql += " WHERE " + conditions.join(" AND ");
        sql += " ORDER BY i.created_at DESC";
        sql += limitClause(limit);
        const { results } = await db.prepare(sql).bind(...params).all();
        return json({ intel: projectFields(results, fields), count: results.length });
      }

      if (path === "/intel" && method === "POST") {
        const body = await request.json();
        if (!body.person_name || !body.intel_type || !body.content) return err("person_name, intel_type, and content are required");
        const validTypes = ["relationship","political","working_style","reliability","alignment","history","strength","weakness","opportunity"];
        if (!validTypes.includes(body.intel_type)) return err(`intel_type must be one of: ${validTypes.join(", ")}`);
        const result = await db.prepare(
          `INSERT INTO people_intel (person_id, person_name, intel_type, content, source_label, source_meeting_id)
           VALUES (?, ?, ?, ?, ?, ?)`
        ).bind(
          body.person_id || null, body.person_name,
          body.intel_type, body.content,
          body.source_label || null, body.source_meeting_id || null
        ).run();
        const created = await db.prepare("SELECT i.*, p.name as linked_person_name FROM people_intel i LEFT JOIN people p ON i.person_id = p.id WHERE i.id = ?").bind(result.meta.last_row_id).first();
        return json(created, 201);
      }

      if (matchPath(path, "/intel/:id") && method === "PATCH") {
        const [id] = matchPath(path, "/intel/:id");
        const body = await request.json();
        const allowed = ["person_id","person_name","intel_type","content","source_label","source_meeting_id"];
        const sets = [];
        const vals = [];
        for (const key of allowed) {
          if (body[key] !== undefined) { sets.push(`${key} = ?`); vals.push(body[key]); }
        }
        if (!sets.length) return err("No fields to update");
        vals.push(id);
        await db.prepare(`UPDATE people_intel SET ${sets.join(", ")} WHERE id = ?`).bind(...vals).run();
        const updated = await db.prepare("SELECT i.*, p.name as linked_person_name FROM people_intel i LEFT JOIN people p ON i.person_id = p.id WHERE i.id = ?").bind(id).first();
        return json(updated);
      }

      if (matchPath(path, "/intel/:id") && method === "DELETE") {
        const [id] = matchPath(path, "/intel/:id");
        await db.prepare("DELETE FROM people_intel WHERE id = ?").bind(id).run();
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
        let sql = "SELECT * FROM knowledge";
        const params = [];
        const conditions = [];
        if (category) { conditions.push("category = ?"); params.push(category); }
        if (area) { conditions.push("area = ?"); params.push(area); }
        if (search) { conditions.push("(subject LIKE ? OR detail LIKE ?)"); params.push(`%${search}%`, `%${search}%`); }
        if (since) { conditions.push("created_at >= ?"); params.push(since); }
        if (conditions.length) sql += " WHERE " + conditions.join(" AND ");
        sql += " ORDER BY created_at DESC";
        sql += limitClause(limit);
        const { results } = await db.prepare(sql).bind(...params).all();
        return json({ knowledge: projectFields(results, fields), count: results.length });
      }

      if (path === "/knowledge" && method === "POST") {
        const body = await request.json();
        if (!body.category || !body.area || !body.subject || !body.detail) {
          return err("category, area, subject, and detail are required");
        }
        const result = await db.prepare(
          `INSERT INTO knowledge (category, area, subject, detail, people_involved, source_label, source_meeting_id, tags)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(
          body.category, body.area, body.subject, body.detail,
          body.people_involved || null, body.source_label || null,
          body.source_meeting_id || null, body.tags || null
        ).run();
        const created = await db.prepare("SELECT * FROM knowledge WHERE id = ?").bind(result.meta.last_row_id).first();
        return json(created, 201);
      }

      if (matchPath(path, "/knowledge/:id") && method === "PATCH") {
        const [id] = matchPath(path, "/knowledge/:id");
        const body = await request.json();
        const allowed = ["category","area","subject","detail","people_involved","source_label","source_meeting_id","tags"];
        const sets = ["updated_at = datetime('now')"];
        const vals = [];
        for (const key of allowed) {
          if (body[key] !== undefined) { sets.push(`${key} = ?`); vals.push(body[key]); }
        }
        vals.push(id);
        await db.prepare(`UPDATE knowledge SET ${sets.join(", ")} WHERE id = ?`).bind(...vals).run();
        const updated = await db.prepare("SELECT * FROM knowledge WHERE id = ?").bind(id).first();
        return json(updated);
      }

      if (matchPath(path, "/knowledge/:id") && method === "DELETE") {
        const [id] = matchPath(path, "/knowledge/:id");
        await db.prepare("DELETE FROM knowledge WHERE id = ?").bind(id).run();
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

      // ── STATS ──
      if (path === "/stats" && method === "GET") {
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
        return json({
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
        });
      }

      return err("Not found", 404);
    } catch (e) {
      console.error("EHS API error:", e);
      return err(e.message || "Internal error", 500);
    }
  }
};
