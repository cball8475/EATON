-- Full base schema for eaton-ehs-dashboard D1 — used by infra/restore.sh to
-- rebuild a database from a JSON backup. Reconstructed 2026-07-22 from the live
-- worker's queries and a production export; refresh it from the real database
-- when convenient with:
--   npx wrangler d1 export eaton-ehs-dashboard --remote --no-data --output infra/schema.sql
-- (then re-add the seed INSERT at the bottom if the dump drops it).
-- Includes the v3.8.0 columns and FTS index inline, so a restored database
-- needs no separate migration pass.

CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  due_date TEXT,
  priority TEXT DEFAULT 'Medium',
  status TEXT DEFAULT 'todo',
  assignee_id INTEGER,
  automatable INTEGER DEFAULT 0,
  recurring INTEGER DEFAULT 0,
  recurrence_pattern TEXT,
  template_id INTEGER,
  source TEXT DEFAULT 'manual',
  tags TEXT,
  notes TEXT,
  ai_extracted INTEGER DEFAULT 0,
  source_label TEXT,
  source_meeting_id TEXT,
  ownership TEXT DEFAULT 'mine',
  waiting_on TEXT,
  knowledge_type TEXT,
  target_period TEXT,
  completed_at TEXT,
  completion_reason TEXT,
  completion_people TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT
);

CREATE TABLE IF NOT EXISTS people (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  department TEXT,
  area TEXT,
  expertise TEXT,
  strength TEXT,
  go_to_for TEXT,
  reliability TEXT DEFAULT 'watching',
  contact_info TEXT,
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT
);

CREATE TABLE IF NOT EXISTS templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  default_priority TEXT DEFAULT 'Medium',
  default_status TEXT DEFAULT 'todo',
  default_tags TEXT,
  checklist TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS leadership_moves (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT,
  description TEXT NOT NULL,
  category TEXT DEFAULT 'proactive',
  context TEXT,
  people_involved TEXT,
  source_label TEXT,
  source_meeting_id TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS weekly_reflections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  week_of TEXT NOT NULL,
  influenced_vs_executed TEXT,
  clarity_created TEXT,
  learned_about_eaton TEXT,
  time_allocation_note TEXT,
  source_label TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS knowledge (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL,
  area TEXT NOT NULL,
  subject TEXT NOT NULL,
  detail TEXT NOT NULL,
  people_involved TEXT,
  source_label TEXT,
  source_meeting_id TEXT,
  tags TEXT,
  related_ids TEXT,
  superseded_by INTEGER,
  confidence TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT
);

CREATE TABLE IF NOT EXISTS people_intel (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  person_id INTEGER,
  person_name TEXT NOT NULL,
  intel_type TEXT NOT NULL,
  content TEXT NOT NULL,
  source_label TEXT,
  source_meeting_id TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS scoreboard (
  id INTEGER PRIMARY KEY,
  trir REAL,
  recordables_ytd INTEGER,
  lost_time_incidents_ytd INTEGER,
  near_misses_ytd INTEGER,
  observations_month INTEGER,
  observations_ytd INTEGER,
  positive_interrupters_month INTEGER,
  man_hours_ytd INTEGER,
  man_hours_target INTEGER,
  forklift_incidents_ytd INTEGER,
  forklift_incidents_target_reduction INTEGER,
  notes TEXT,
  updated_by TEXT,
  last_updated TEXT
);

INSERT OR IGNORE INTO scoreboard (id) VALUES (1);

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

-- ── FTS5 index + sync triggers (mirrors infra/migrations/2026-07-22-v3.8.0.sql) ──

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
