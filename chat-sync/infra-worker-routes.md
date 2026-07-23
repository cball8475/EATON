# Worker Routes Index — `infra/worker-api.mjs`

Navigation aid for editing the worker without loading the whole file. Line numbers rot with every version, so this maps routes to **grep anchors** instead — search for the anchor string to land on the section. Version: whatever `/health` says (v3.9.0 at last sync, 2026-07-23).

## Helpers (top of file)

| Anchor | What it is |
|---|---|
| `const ENUMS` | Server-side enum guards for task fields |
| `function projectFields` | `?fields=` projection |
| `function withScoreboardAge` | scoreboard age/stale computation |
| `async function computeStats` | shared by /stats, /brief, /pulse |
| `function ftsMatchExpr` | FTS5 query sanitizer |
| `function isMigrationPending` | graceful-degradation detector |
| `SEMANTIC LAYER` | Vectorize + Workers AI: embed/upsert/delete/semanticSearch |
| `async function buildExport` | shared by GET /export and backups |
| `WEEKLY D1 BACKUP` | gzip + GitHub push (`runBackup`) |
| `WEEKLY DIGEST` | buildWeeklyDigest / formatDigestEmail (w/ `function delta`) / sendDigestEmail |

## Entry points

| Anchor | What it is |
|---|---|
| `async scheduled` | cron dispatch: `0 14 * * 5` digest, `0 12 * * 1` backup |
| `async fetch` | request entry; auth (Secrets Store `AUTH_TOKEN` → `API_TOKEN` fallback) right after `/health` |

## Routes (grep the path string with quotes, e.g. `"/search"`)

| Path | Notes |
|---|---|
| `/health` | version + git_sha — unauthenticated |
| `/digest/preview`, `/digest/send` | weekly digest |
| `/tasks`, `/tasks/:id` | CRUD + filters |
| `/moves`, `/moves/:id` | leadership moves |
| `/reflections`, `/reflections/:id` | weekly reflections |
| `/export` | full dump (uses buildExport) |
| `/backup/run` | manual backup trigger |
| `/search` | FTS + semantic/hybrid modes |
| `/vectorize/backfill` | resumable semantic index build |
| `/trends` | weekly time series |
| `/people`, `/people/:id`, `/people/:id/tasks`, `/people/:id/intel` | people |
| `/templates` | task templates |
| `/otter/extract` | AI transcript extraction |
| `/intel`, `/intel/:id` | people intel (conflict flagging on POST, supersede on PATCH) |
| `/knowledge`, `/knowledge/:id`, `/knowledge/:id/related` | knowledge (conflict flagging, edges, supersede) |
| `/scoreboard` | single-row metrics; PATCH snapshots into scoreboard_history |
| `/stats`, `/pulse`, `/brief` | stats + composites |

## Editing rules

- v3.8+ paths degrade gracefully pre-migration — keep the `isMigrationPending` fallbacks intact when editing.
- Bump `VERSION` and the header changelog on every deploy; `/health.git_sha` is stamped by the deploy command (see infra/deploy-notes.md).
- New knowledge/intel writes must keep their `ctx.waitUntil(upsertVector(...))` hooks or the semantic index silently drifts.
