# Worker Routes Index — `infra/worker-api.mjs`

Navigation aid so Claude (and you) can read targeted slices instead of the whole 38K file. **Update this index when adding/removing routes** — keep line ranges accurate.

Current version: **v3.4.0** (line 1 header)

## File structure

| Lines | Section |
|---|---|
| 1–6 | Header comment (version, secrets, cron) |
| 8–12 | CORS constants |
| 14–18 | `json()` helper |
| 21–23 | `err()` helper |
| 25–29 | `matchPath()` helper |
| 32–43 | `projectFields()` helper (v3.3.0+) |
| 46–50 | `limitClause()` helper (v3.3.0+) |
| 52–101 | `buildWeeklyDigest()` |
| 103–173 | `formatDigestEmail()` |
| 175–197 | `sendDigestEmail()` |
| 198–219 | `export default { scheduled, fetch }` — entry + auth |

## Route map

Read the line range below to edit a route. The Read tool's `offset`/`limit` lets you pull exactly these slices.

| Method | Path | Lines | Notes |
|---|---|---|---|
| GET | `/health` | 220–222 | Version probe — keep version string here in sync with header |
| GET | `/digest/preview` | 231–235 | Composed weekly digest |
| POST | `/digest/send` | 237–243 | Sends digest via SendGrid |
| **GET** | **`/tasks`** | **246–278** | Filters: `status, assignee_id, priority, q, ownership, target_period, waiting_on, knowledge_type, since, completed_since, fields, limit` |
| POST | `/tasks` | 278–298 | Insert task |
| PATCH | `/tasks/:id` | 299–314 | Update task |
| DELETE | `/tasks/:id` | 315–321 | Delete task |
| **GET** | **`/moves`** | **322–335** | Leadership moves — filters: `category, since` |
| POST | `/moves` | 336–354 | Insert move |
| PATCH | `/moves/:id` | 355–370 | Update move |
| DELETE | `/moves/:id` | 371–377 | Delete move |
| GET | `/reflections` | 378–387 | Weekly reflections |
| POST | `/reflections` | 388–405 | Insert reflection |
| PATCH | `/reflections/:id` | 406–421 | Update reflection |
| DELETE | `/reflections/:id` | 422–428 | Delete reflection |
| GET | `/export` | 429–467 | **Heavy** — full DB dump. Only `/audit` should call this |
| **GET** | **`/people`** | **469–485** | Filters: `department, since, fields, limit` |
| POST | `/people` | 486–496 | Insert person |
| PATCH | `/people/:id` | 497–511 | Update person |
| DELETE | `/people/:id` | 512–518 | Delete person (nulls assignee_id on their tasks) |
| GET | `/people/:id/tasks` | 519–525 | Tasks assigned to a person |
| GET | `/templates` | 526–530 | Task templates |
| POST | `/templates` | 531–542 | Insert template |
| POST | `/otter/extract` | 543–595 | **AI extraction** — uses ANTHROPIC_API_KEY, calls Claude |
| **GET** | **`/intel`** | **597–619** | People intel — filters: `person_id, person_name, intel_type, q, since, fields, limit` |
| POST | `/intel` | 620–636 | Insert intel |
| PATCH | `/intel/:id` | 637–652 | Update intel |
| DELETE | `/intel/:id` | 653–659 | Delete intel |
| **GET** | **`/knowledge`** | **660–680** | Knowledge — filters: `category, area, q, since, fields, limit` |
| POST | `/knowledge` | 681–697 | Insert knowledge |
| PATCH | `/knowledge/:id` | 698–712 | Update knowledge |
| DELETE | `/knowledge/:id` | 713–719 | Delete knowledge |
| GET | `/people/:id/intel` | 720–728 | Convenience — intel for one person |
| GET | `/stats` | 729–end | Counts dashboard — read-heavy, always cheap |

## How to use this index

**Editing a route:** `Read infra/worker-api.mjs offset=246 limit=32` pulls only `/tasks` GET. Edit, then deploy.

**Adding a filter to a GET route:** the four GET routes that take `since/fields/limit` (rows in bold) all follow the same pattern — copy from one to another.

**Adding a new endpoint:** put it near similar ones (e.g. a new `/tasks/foo` route belongs near line 320). Update this index after.

**Bumping version:** edit lines 1 (header comment) AND `/health` response (line 221). They must match.
