-- Migration for worker v3.8.0 — FTS5 search, knowledge edges, scoreboard history
-- Database: eaton-ehs-dashboard (62ce85d7-0cc1-4832-aa57-d5b09ceaa132)
--
-- HOW TO RUN: D1 requires ALTER TABLE statements to run individually, not batched
-- (see CLAUDE.md deploy notes). Run each statement below one at a time, in order,
-- via Cloudflare MCP d1_database_query or:
--   npx wrangler d1 execute eaton-ehs-dashboard --remote --command "<one statement>"
-- The worker degrades gracefully if this migration hasn't run yet (new endpoints
-- return a 503 hint; existing endpoints fall back to pre-3.8.0 behavior), so
-- deploy order doesn't matter — but run this promptly after deploying.

-- ── 1. Knowledge edges + supersede chain (run each ALTER individually) ──

ALTER TABLE knowledge ADD COLUMN related_ids TEXT;

ALTER TABLE knowledge ADD COLUMN superseded_by INTEGER;

ALTER TABLE knowledge ADD COLUMN confidence TEXT;

-- ── 2. Scoreboard history (enables /trends over safety metrics) ──

CREATE TABLE IF NOT EXISTS scoreboard_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  snapshot_date TEXT NOT NULL,
  trir REAL,
  recordables_ytd INTEGER,
  lost_time_incidents_ytd INTEGER,
  near_misses_ytd INTEGER,
  observations_month INTEGER,
  observations_ytd INTEGER,
  positive_interrupters_month INTEGER,
  man_hours_ytd INTEGER,
  forklift_incidents_ytd INTEGER,
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Seed history with the current scoreboard row so /trends has a starting point.

INSERT INTO scoreboard_history (snapshot_date, trir, recordables_ytd, lost_time_incidents_ytd, near_misses_ytd, observations_month, observations_ytd, positive_interrupters_month, man_hours_ytd, forklift_incidents_ytd, notes)
SELECT date('now'), trir, recordables_ytd, lost_time_incidents_ytd, near_misses_ytd, observations_month, observations_ytd, positive_interrupters_month, man_hours_ytd, forklift_incidents_ytd, notes FROM scoreboard WHERE id = 1;

-- ── 3. FTS5 full-text search (knowledge, people_intel, tasks) ──
-- External-content tables: rows live in the base tables, FTS holds only the index.
-- Triggers keep the index in sync; the 'rebuild' insert backfills existing rows.

CREATE VIRTUAL TABLE IF NOT EXISTS knowledge_fts USING fts5(subject, detail, people_involved, tags, content='knowledge', content_rowid='id');

CREATE TRIGGER IF NOT EXISTS knowledge_fts_ai AFTER INSERT ON knowledge BEGIN
  INSERT INTO knowledge_fts(rowid, subject, detail, people_involved, tags) VALUES (new.id, new.subject, new.detail, new.people_involved, new.tags);
END;

CREATE TRIGGER IF NOT EXISTS knowledge_fts_ad AFTER DELETE ON knowledge BEGIN
  INSERT INTO knowledge_fts(knowledge_fts, rowid, subject, detail, people_involved, tags) VALUES ('delete', old.id, old.subject, old.detail, old.people_involved, old.tags);
END;

CREATE TRIGGER IF NOT EXISTS knowledge_fts_au AFTER UPDATE ON knowledge BEGIN
  INSERT INTO knowledge_fts(knowledge_fts, rowid, subject, detail, people_involved, tags) VALUES ('delete', old.id, old.subject, old.detail, old.people_involved, old.tags);
  INSERT INTO knowledge_fts(rowid, subject, detail, people_involved, tags) VALUES (new.id, new.subject, new.detail, new.people_involved, new.tags);
END;

INSERT INTO knowledge_fts(knowledge_fts) VALUES ('rebuild');

CREATE VIRTUAL TABLE IF NOT EXISTS intel_fts USING fts5(person_name, content, content='people_intel', content_rowid='id');

CREATE TRIGGER IF NOT EXISTS intel_fts_ai AFTER INSERT ON people_intel BEGIN
  INSERT INTO intel_fts(rowid, person_name, content) VALUES (new.id, new.person_name, new.content);
END;

CREATE TRIGGER IF NOT EXISTS intel_fts_ad AFTER DELETE ON people_intel BEGIN
  INSERT INTO intel_fts(intel_fts, rowid, person_name, content) VALUES ('delete', old.id, old.person_name, old.content);
END;

CREATE TRIGGER IF NOT EXISTS intel_fts_au AFTER UPDATE ON people_intel BEGIN
  INSERT INTO intel_fts(intel_fts, rowid, person_name, content) VALUES ('delete', old.id, old.person_name, old.content);
  INSERT INTO intel_fts(rowid, person_name, content) VALUES (new.id, new.person_name, new.content);
END;

INSERT INTO intel_fts(intel_fts) VALUES ('rebuild');

CREATE VIRTUAL TABLE IF NOT EXISTS tasks_fts USING fts5(title, description, notes, tags, content='tasks', content_rowid='id');

CREATE TRIGGER IF NOT EXISTS tasks_fts_ai AFTER INSERT ON tasks BEGIN
  INSERT INTO tasks_fts(rowid, title, description, notes, tags) VALUES (new.id, new.title, new.description, new.notes, new.tags);
END;

CREATE TRIGGER IF NOT EXISTS tasks_fts_ad AFTER DELETE ON tasks BEGIN
  INSERT INTO tasks_fts(tasks_fts, rowid, title, description, notes, tags) VALUES ('delete', old.id, old.title, old.description, old.notes, old.tags);
END;

CREATE TRIGGER IF NOT EXISTS tasks_fts_au AFTER UPDATE ON tasks BEGIN
  INSERT INTO tasks_fts(tasks_fts, rowid, title, description, notes, tags) VALUES ('delete', old.id, old.title, old.description, old.notes, old.tags);
  INSERT INTO tasks_fts(rowid, title, description, notes, tags) VALUES (new.id, new.title, new.description, new.notes, new.tags);
END;

INSERT INTO tasks_fts(tasks_fts) VALUES ('rebuild');
