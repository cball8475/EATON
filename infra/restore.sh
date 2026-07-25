#!/usr/bin/env bash
# restore.sh — rebuild a D1 database from a JSON backup (the files the Monday
# cron pushes to infra/backups/auto/, or any GET /export dump).
#
# Usage (run from infra/):
#   ./restore.sh <backup.json[.gz]> <target-db-name> [--create] [--force-prod]
#
#   ./restore.sh backups/auto/d1-export-2026-07-22.json.gz eaton-ehs-restore-test --create
#
# What it does:
#   1. Applies infra/schema.sql to the target (base tables + FTS index)
#   2. Converts the backup JSON to INSERT statements (node, no other deps)
#   3. Loads the data, then rebuilds the FTS index
#   4. Verifies row counts against the backup and prints the comparison
#
# Safety: refuses to touch the production database (eaton-ehs-dashboard)
# unless --force-prod is passed. Restoring into a NON-EMPTY database will
# duplicate or collide rows — use a fresh database, that's the point of --create.
set -euo pipefail
cd "$(dirname "$0")"

PROD_DB="eaton-ehs-dashboard"
BACKUP="${1:?usage: restore.sh <backup.json[.gz]> <target-db> [--create] [--force-prod]}"
TARGET="${2:?target database name required}"
CREATE=false
FORCE_PROD=false
for arg in "${@:3}"; do
  case "$arg" in
    --create) CREATE=true ;;
    --force-prod) FORCE_PROD=true ;;
    *) echo "unknown flag: $arg" >&2; exit 1 ;;
  esac
done

if [ "$TARGET" = "$PROD_DB" ] && [ "$FORCE_PROD" != true ]; then
  echo "REFUSING: target is the production database ($PROD_DB)." >&2
  echo "Restore into a fresh database (--create), verify it, then decide." >&2
  echo "If you really mean to load into production, add --force-prod." >&2
  exit 1
fi

[ -f "$BACKUP" ] || { echo "backup file not found: $BACKUP" >&2; exit 1; }
[ -f schema.sql ] || { echo "infra/schema.sql missing — cannot build tables" >&2; exit 1; }

WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

JSON="$WORK/backup.json"
case "$BACKUP" in
  *.gz) gunzip -c "$BACKUP" > "$JSON" ;;
  *)    cp "$BACKUP" "$JSON" ;;
esac

echo "── Backup: $(node -e "const d=require('$JSON'); console.log(d.exported_at, '| worker', d.version)")"

if [ "$CREATE" = true ]; then
  echo "── Creating database $TARGET (ignore error if it already exists)"
  npx wrangler d1 create "$TARGET" || true
fi

echo "── Applying schema"
npx wrangler d1 execute "$TARGET" --remote -y --file schema.sql

echo "── Converting backup JSON to SQL"
node - "$JSON" "$WORK/inserts.sql" <<'NODE'
const fs = require("fs");
const [jsonPath, outPath] = process.argv.slice(2);
const d = JSON.parse(fs.readFileSync(jsonPath, "utf8"));

// Computed join fields present in the export but not in the tables.
const SKIP = { tasks: ["assignee_name"], people_intel: ["linked_person_name"] };
// Order matters only cosmetically — D1/SQLite has no enforced FKs here.
const TABLES = ["people", "templates", "tasks", "leadership_moves",
  "weekly_reflections", "knowledge", "people_intel", "scoreboard", "scoreboard_history"];

const esc = v =>
  v === null || v === undefined ? "NULL" :
  typeof v === "number" ? String(v) :
  "'" + String(v).replace(/'/g, "''") + "'";

const out = fs.createWriteStream(outPath);
// The seed row from schema.sql would collide with a backed-up scoreboard row.
out.write("DELETE FROM scoreboard;\n");
const counts = {};
for (const t of TABLES) {
  let rows = d[t];
  if (rows && !Array.isArray(rows)) rows = [rows];   // scoreboard may export as a single object
  if (!rows || !rows.length) { counts[t] = 0; continue; }
  const skip = new Set(SKIP[t] || []);
  for (const row of rows) {
    const cols = Object.keys(row).filter(c => !skip.has(c));
    out.write(`INSERT INTO ${t} (${cols.join(",")}) VALUES (${cols.map(c => esc(row[c])).join(",")});\n`);
  }
  counts[t] = rows.length;
}
out.write("INSERT INTO knowledge_fts(knowledge_fts) VALUES ('rebuild');\n");
out.write("INSERT INTO intel_fts(intel_fts) VALUES ('rebuild');\n");
out.write("INSERT INTO tasks_fts(tasks_fts) VALUES ('rebuild');\n");
out.end(() => {
  fs.writeFileSync(outPath + ".counts.json", JSON.stringify(counts));
  console.log("   rows to load:", JSON.stringify(counts));
});
NODE

echo "── Loading data + rebuilding FTS index"
npx wrangler d1 execute "$TARGET" --remote -y --file "$WORK/inserts.sql"

echo "── Verifying row counts + backup coverage"
node - "$TARGET" "$WORK/inserts.sql.counts.json" <<'NODE'
const { execFileSync } = require("child_process");
const [target, countsPath] = process.argv.slice(2);
const expected = JSON.parse(require("fs").readFileSync(countsPath, "utf8"));
const run = (sql) => {
  const raw = execFileSync("npx", ["wrangler", "d1", "execute", target, "--remote", "-y",
    "--command", sql, "--json"], { encoding: "utf8", shell: process.platform === "win32" });
  return JSON.parse(raw.slice(raw.indexOf("[")))[0].results;
};

// Coverage check FIRST: a table that exists in schema.sql but was never added
// to the worker's buildExport() is absent from both sides of the count
// comparison, so counts "match" while a whole table silently isn't backed up.
// That's exactly how scoreboard/scoreboard_history went missing until the
// first restore drill (v3.8.1). Compare schema tables against the backup keys.
const schemaTables = run(
  "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' " +
  "AND name NOT LIKE '_cf_%' AND name NOT LIKE '%_fts' AND name NOT LIKE '%_fts_%'"
).map(r => r.name);
const notInBackup = schemaTables.filter(t => !(t in expected));
if (notInBackup.length) {
  console.error(`✗ SCHEMA TABLE(S) NOT COVERED BY THE BACKUP: ${notInBackup.join(", ")}`);
  console.error("  These tables exist in schema.sql but are missing from the export — add them");
  console.error("  to buildExport() in worker-api.mjs AND to TABLES in restore.sh, then re-export.");
  process.exit(1);
}
console.log(`   ✓ backup covers all ${schemaTables.length} schema tables`);

const sql = Object.keys(expected)
  .map(t => `SELECT '${t}' AS tbl, COUNT(*) AS c FROM ${t}`).join(" UNION ALL ");
const rows = run(sql);
let ok = true;
for (const { tbl, c } of rows) {
  const want = expected[tbl];
  const match = tbl === "scoreboard" ? c >= Math.min(want, 1) : c === want;
  if (!match) ok = false;
  console.log(`   ${match ? "✓" : "✗"} ${tbl}: ${c} restored / ${want} in backup`);
}
if (!ok) { console.error("RESTORE INCOMPLETE — counts differ."); process.exit(1); }
console.log("RESTORE VERIFIED — all table counts match the backup.");
NODE

echo ""
echo "Done. Smoke-test search against the restored DB:"
echo "  npx wrangler d1 execute $TARGET --remote -y --command \"SELECT k.subject FROM knowledge_fts JOIN knowledge k ON k.id=knowledge_fts.rowid WHERE knowledge_fts MATCH 'gloria' LIMIT 3\""
echo "To point the live worker at it: change database_id in wrangler.toml and redeploy."
