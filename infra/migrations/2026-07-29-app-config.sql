-- 2026-07-29 — app_config: session self-serve credential handoff.
--
-- Holds the worker bearer (key 'EATON_TOKEN') so any Claude session with the
-- Cloudflare connector can bootstrap API access without anyone pasting tokens:
-- read the row via d1_database_query → write ~/.fsc/eaton.token (mode 600) →
-- source infra/env.sh. D1 access already implies full data access, so storing
-- the bearer here grants nothing new.
--
-- Deliberately ABSENT from /export (buildExport enumerates its tables), so the
-- value never lands in the public repo's backups. After a restore to a fresh
-- database this table must be recreated (this file) and reseeded — run the
-- "Rotate EATON API token" workflow, which upserts the row.
--
-- Applied to production 2026-07-29 via Cloudflare MCP.

CREATE TABLE IF NOT EXISTS app_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  note TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
