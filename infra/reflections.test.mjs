// Tests for the v3.10.0 weekly-reflection automation.
//
//   node --experimental-sqlite infra/reflections.test.mjs
//
// Runs the worker's real functions against a real in-memory SQLite database
// through a shim that mimics D1's prepare/bind/first/all/run surface. No
// mocking of the SQL itself — a query that D1 would reject fails here too.
//
// What this exists to prove: the reflection record cannot go missing without
// something saying so. The gap-detection test is the important one, because it
// is the layer that catches the CRON dying, and a cron that dies is exactly how
// the weekly digest disappeared for a month (kb/lessons.md 2026-07-25).

import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";

// ── Load the worker's functions without executing its module side effects ──
const src = readFileSync(new URL("./worker-api.mjs", import.meta.url), "utf8");
function extract(name, kind = "function") {
  const re = new RegExp(`^${kind} ${name}\\b[\\s\\S]*?\\n\\}`, "m");
  const m = src.match(re);
  if (!m) throw new Error(`could not extract ${name} from worker-api.mjs — did it get renamed?`);
  return m[0];
}
const UNDER_TEST = [
  "mondayOf", "mondaysBetween", "computeReflectionHealth",
  "draftReflectionFields", "runReflectionDraft",
].map(n => extract(n, src.includes(`async function ${n}`) ? "async function" : "function")).join("\n\n");

const { mondayOf, mondaysBetween, computeReflectionHealth, runReflectionDraft } =
  await import(`data:text/javascript,${encodeURIComponent(`${UNDER_TEST}
export { mondayOf, mondaysBetween, computeReflectionHealth, draftReflectionFields, runReflectionDraft };`)}`);

// ── D1 shim over node:sqlite ──
function d1(sqlite) {
  return {
    prepare(sql) {
      const stmt = sqlite.prepare(sql);
      const bound = [];
      const api = {
        bind(...args) { bound.push(...args); return api; },
        async first() { return stmt.get(...bound) ?? null; },
        async all() { return { results: stmt.all(...bound) }; },
        async run() {
          const r = stmt.run(...bound);
          return { meta: { last_row_id: Number(r.lastInsertRowid), changes: r.changes } };
        },
      };
      return api;
    },
  };
}

function freshDb({ withStatusColumn = true } = {}) {
  const s = new DatabaseSync(":memory:");
  s.exec(`CREATE TABLE weekly_reflections (
    id INTEGER PRIMARY KEY AUTOINCREMENT, week_of TEXT NOT NULL,
    influenced_vs_executed TEXT, clarity_created TEXT, learned_about_eaton TEXT,
    time_allocation_note TEXT, source_label TEXT, created_at TEXT DEFAULT (datetime('now'))
    ${withStatusColumn ? `, status TEXT DEFAULT 'confirmed'` : ""}
  );
  CREATE TABLE leadership_moves (id INTEGER PRIMARY KEY, date TEXT, category TEXT, description TEXT);
  CREATE TABLE tasks (id INTEGER PRIMARY KEY, title TEXT, status TEXT, completed_at TEXT);
  CREATE TABLE knowledge (id INTEGER PRIMARY KEY, category TEXT, subject TEXT, created_at TEXT);
  CREATE TABLE people_intel (id INTEGER PRIMARY KEY, person_name TEXT, created_at TEXT);`);
  return { sqlite: s, db: d1(s) };
}

let pass = 0, fail = 0;
const ok = (cond, label, detail = "") => {
  if (cond) { pass++; console.log(`  ✓ ${label}`); }
  else { fail++; console.log(`  ✗ FAIL ${label}${detail ? ` — ${detail}` : ""}`); }
};
const eq = (a, b, label) => ok(a === b, label, `got ${JSON.stringify(a)}, want ${JSON.stringify(b)}`);

// ── 1. week keying ──
console.log("\n1. week_of is always the Monday of the week");
eq(mondayOf(new Date("2026-07-30T00:00:00Z")), "2026-07-27", "Thursday maps back to Monday");
eq(mondayOf(new Date("2026-07-27T12:00:00Z")), "2026-07-27", "Monday maps to itself");
eq(mondayOf(new Date("2026-08-02T23:59:00Z")), "2026-07-27", "Sunday belongs to the week that began Monday");
eq(mondayOf(new Date("2026-01-01T00:00:00Z")), "2025-12-29", "year boundary crosses correctly");

// ── 2. the draft cron writes a row ──
console.log("\n2. auto-draft creates the row from real signals");
{
  const { db, sqlite } = freshDb();
  sqlite.exec(`
    INSERT INTO leadership_moves (date,category,description) VALUES
      ('2026-07-28','influence','Got Gloria to co-sign the tugger MOC'),
      ('2026-07-29','ownership','Took the LOTO element off Kate');
    INSERT INTO tasks (title,status,completed_at) VALUES
      ('Close press-brake alert','done','2026-07-29'),
      ('Old thing','done','2026-05-01');
    INSERT INTO knowledge (category,subject,created_at) VALUES ('process','Tugger route','2026-07-28');
    INSERT INTO people_intel (person_name,created_at) VALUES ('Gloria Carter','2026-07-28'),('Jad','2026-07-30');`);

  const r = await runReflectionDraft(db, "2026-07-27");
  ok(r.success && r.created, "returns success + created");
  const row = sqlite.prepare("SELECT * FROM weekly_reflections WHERE week_of='2026-07-27'").get();
  ok(!!row, "row exists in the table");
  eq(row.status, "auto-draft", "status is auto-draft, not confirmed");
  ok(row.influenced_vs_executed.includes("2 leadership move"), "counts the week's moves");
  ok(row.influenced_vs_executed.includes("1 task"), "counts only tasks closed IN the week (excludes the May one)");
  ok(row.learned_about_eaton.includes("Gloria Carter") && row.learned_about_eaton.includes("Jad"), "names the people touched");
  ok(row.influenced_vs_executed.startsWith("AUTO-DRAFT"), "every field is labelled AUTO-DRAFT so it can't pass as Charlie's writing");
}

// ── 3. idempotency: the cron cannot duplicate or overwrite ──
console.log("\n3. idempotent per week — /weekly first, cron second is a no-op");
{
  const { db, sqlite } = freshDb();
  sqlite.exec(`INSERT INTO weekly_reflections (week_of,influenced_vs_executed,status,source_label)
               VALUES ('2026-07-27','Charlie''s real reflection','confirmed','/weekly')`);
  const r = await runReflectionDraft(db, "2026-07-27");
  ok(r.success && r.skipped, "reports skipped, not failure");
  eq(sqlite.prepare("SELECT COUNT(*) c FROM weekly_reflections").get().c, 1, "still exactly one row");
  eq(sqlite.prepare("SELECT influenced_vs_executed x FROM weekly_reflections").get().x,
     "Charlie's real reflection", "Charlie's confirmed text is NOT overwritten");
  const again = await runReflectionDraft(db, "2026-07-27");
  ok(again.success, "a second retry is still a success (safe to re-run)");
}

// ── 4. gap detection — the layer that catches the cron dying ──
console.log("\n4. gap detection reports missing weeks loudly");
{
  const { db, sqlite } = freshDb();
  sqlite.exec(`INSERT INTO weekly_reflections (week_of,status) VALUES ('2026-06-01','confirmed')`);
  const h = await computeReflectionHealth(db);
  eq(h.latest_week, "2026-06-01", "latest_week is the newest row");
  ok(h.weeks_missing >= 8, `reports the real gap (${h.weeks_missing} weeks)`);
  ok(h.alert !== null, "alert is non-null so /morning and /status must render it");
  ok(h.alert.includes("missing"), "alert says 'missing'");
  ok(!h.missing_weeks.includes("2026-06-01"), "the week that HAS a row is not reported missing");
  ok(h.missing_weeks.every(w => mondayOf(new Date(`${w}T00:00:00Z`)) === w), "every reported gap is a Monday");
}

// ── 5. no false alarm when current ──
console.log("\n5. silent when the record is current");
{
  const { db, sqlite } = freshDb();
  sqlite.exec(`INSERT INTO weekly_reflections (week_of,status) VALUES ('${mondayOf()}','confirmed')`);
  const h = await computeReflectionHealth(db);
  eq(h.weeks_missing, 0, "no missing weeks");
  eq(h.alert, null, "alert is null so the line is omitted");
  eq(h.this_week_status, "confirmed", "this week reads as confirmed");
}

// ── 6. an unreviewed draft still nags, but differently ──
console.log("\n6. an auto-draft is not the same as a done reflection");
{
  const { db, sqlite } = freshDb();
  sqlite.exec(`INSERT INTO weekly_reflections (week_of,status) VALUES ('${mondayOf()}','auto-draft')`);
  const h = await computeReflectionHealth(db);
  eq(h.weeks_missing, 0, "not counted as missing — the row exists");
  eq(h.this_week_status, "auto-draft", "surfaced as a draft");
  ok(h.alert && h.alert.includes("awaiting review"), "alert asks for review instead of reporting a gap");
  eq(h.awaiting_review.length, 1, "listed in awaiting_review");
}

// ── 7. degrades before the migration runs ──
// This is the deploy-ordering guard. computeReflectionHealth is on the /stats
// path, which /brief and /pulse sit on, so a throw here takes out /morning AND
// /status together. If the worker ships before the migration runs, the brief
// must still work.
console.log("\n7. survives a pre-migration table (no status column)");
{
  const { db, sqlite } = freshDb({ withStatusColumn: false });
  sqlite.exec(`INSERT INTO weekly_reflections (week_of) VALUES ('2026-06-01')`);
  let h;
  try { h = await computeReflectionHealth(db); }
  catch (e) { ok(false, "computeReflectionHealth must not throw pre-migration", e.message); }
  if (h) {
    ok(h.weeks_missing >= 8, "gap detection still works");
    eq(h.confirmed, 1, "treats existing rows as confirmed");
    eq(h.awaiting_review.length, 0, "no drafts claimed");
    eq(h.this_week_status, "missing", "this week still reported missing");
  }
  // Drafting, by contrast, must REFUSE rather than write an unlabelled row that
  // would read as a confirmed reflection.
  const r = await runReflectionDraft(db, "2026-07-27");
  ok(r.success === false, "draft refuses to write pre-migration");
  ok(/migrations\/2026-07-30/.test(r.error || ""), "error names the migration to run", r.error);
  eq(sqlite.prepare("SELECT COUNT(*) c FROM weekly_reflections").get().c, 1, "no row was written");
}

// ── 8. a write that reports success without a row id is a FAILURE ──
console.log("\n8. a 2xx-shaped write with no row id counts as failure");
{
  const { db } = freshDb();
  const lying = { prepare: (sql) => {
    const p = db.prepare(sql);
    return /INSERT INTO weekly_reflections/.test(sql)
      ? { bind: (...a) => ({ run: async () => ({ meta: {} }) }) }   // no last_row_id
      : p;
  }};
  const r = await runReflectionDraft(lying, "2026-07-27");
  ok(r.success === false, "reported as failure, not success");
  ok(/no row id/.test(r.error || ""), "names the reason");
}

// ── 9. cron dispatch is exhaustive ──
console.log("\n9. every registered cron has an explicit handler");
{
  const toml = readFileSync(new URL("./wrangler.toml", import.meta.url), "utf8");
  const crons = [...toml.matchAll(/"(\d[^"]*\*[^"]*)"/g)].map(m => m[1]);
  ok(crons.length === 3, `wrangler.toml registers ${crons.length} crons`);
  for (const c of crons) {
    ok(src.includes(`case "${c}":`), `worker has an explicit case for "${c}"`);
  }
  ok(/default:[\s\S]{0,400}unrecognised cron/.test(src), "unknown cron rejects instead of falling through to the digest");
  // The pre-v3.10.0 shape: a bare digest send after the backup's early return.
  ok(!/if \(controller\.cron === "0 12 \* \* 1"\)/.test(src), "the old if/return fall-through is gone");
}

console.log(`\n${fail === 0 ? "✓" : "✗"} ${pass} passed, ${fail} failed\n`);
process.exit(fail === 0 ? 0 : 1);
