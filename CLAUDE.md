# Eaton EHS Command Center — Claude Code

## Scope — Read This First If Other Repos Are Attached

Claude Code auto-loads the `CLAUDE.md` of **every** attached repo, with no notion of which one a session is "about." A session with EATON and `skills` attached loads both files at once (verified 2026-07-30: both appeared in one session's project instructions). So decide what applies before acting on anything below.

**Applies in every session, whatever the repo:** the Communication Rules. They describe how Charlie wants to be written to, not anything Eaton-specific.

**Applies only when the session is doing EATON work** — everything else in this file: the Session Start Protocol, the safety-number rule, infra IDs, the API access pattern, people, priorities, targets, working rules. A session is doing EATON work when the working directory is this repo, when the request concerns Eaton EHS, safety metrics, the worker, or D1, or when a slash command from this repo is invoked.

If the session is about `skills`, `site-admin`, `lwvnewportcounty`, or `cball8475.github.io`, **skip the rest of this file.** Don't source `infra/env.sh`, don't hit the API, don't open with an Eaton catch-up. Those repos have their own instructions, or none.

When genuinely ambiguous, ask which repo before running the catch-up — one question beats an unwanted API call and a brief about the wrong project.

## Who You're Working With

Charlie Ball. Sr. EHS Engineer at Eaton's Sumter, SC facility. Started May 4, 2026. Reports to Kate Fowler (EHS Manager). Charlie is on a decided succession track to take over as EHS Manager — Kate is transitioning out over 6–12 months.

- Employee ID: E0879969 | Cost Center: 4137 | Email: charlieball@eaton.com
- 12 years EHS experience across chemical, medical device, aerospace, industrial manufacturing
- BS in Environmental Sustainability, Health & Safety from RIT
- Building toward SMP certification (scored 95% on practice exam)
- Also owns the DSI contract-security relationship (transferred from Kate) — 11 direct reports through DSI, gate access, security-officer issues

Past the onboarding window as of August 2026. Don't frame work as a 30/60/90-day ramp; the current frame is the EOY project commitments below.

## Communication Rules

**Style:** Direct, terse, correction-oriented. No corporate jargon.

**Banned words/phrases:** leverage, streamline, deep dive, unpack, navigate (metaphorical), space (as in "the EHS space"), ecosystem, supercharge, empower, unlock, elevate, utilize, facilitate, impactful, actionable insights, best practices, pain points, bandwidth (people), low-hanging fruit, robust, holistic, innovative, cutting-edge, game-changer, synergy, seamlessly, delve

**Banned openers:** "Certainly!", "Absolutely!", "Great question!", "Happy to help!", "I'd be delighted to..."

**Banned closers:** "I hope this helps!", "Let me know if you have any questions!", "Feel free to reach out!"

**Banned habits:** Over-bolding, unnecessary headers, restating the question, explaining what you're about to do instead of doing it, excessive hedging

**Execution preference:** Act autonomously. Push to D1, deploy via MCP/CLI, run shell commands. Don't ask Charlie to do things manually. Exception: debrief workflow — present extracted data for review first, push only after explicit approval.

## Session Start Protocol — Catch Up Before Acting

**Only when this session is doing EATON work** (see Scope above). If it's about another attached repo, skip this section entirely.

This file is the only thing an EATON session loads automatically. Everything else — tasks, scoreboard, lessons, intel — sits unread until something fetches it, which means a session that skips this step is working from a stale brain. Before substantive work:

1. `source infra/env.sh` — resolves the token (self-serve; never ask Charlie for it).
2. `eaton /brief | jq .` — one composite call: task counts, open/overdue/blocked, scoreboard, recent intel, and `reflections.alert`.
3. Read `kb/lessons.md` — at minimum any entry newer than the conversation's last session. The failure log exists so mistakes don't repeat; an unread lesson is a scheduled repeat.
4. Open the first substantive reply with anything that needs attention: non-null `reflections.alert`, overdue spikes, a stale scoreboard (`stale`/`age_days`), new lessons. One line each, no ceremony.

Skip this only for a pure one-shot that touches no EATON data or infrastructure. When in doubt, catch up — it costs one API call and one file read. If the Worker is down, the same data comes from D1 via the Cloudflare MCP (`d1_database_query`), no token needed.

## Never Quote a Safety Number From Memory

TRIR, recordables, lost-time, near misses, man-hours, observations, positive interrupters, forklift counts: **`GET /scoreboard` before stating any of them.** Not `/stats` — `/stats` has no safety metrics at all, it counts D1 rows.

This rule exists because a stale TRIR surfaced from memory on 2026-06-08 and had to be corrected in front of Kate (knowledge #368). Numbers in this file are **targets and stable facts only**, never snapshots. `/scoreboard` also carries a `notes` field with Charlie's manual corrections plus `stale`/`age_days` flags — read it, it usually explains any apparent conflict.

## Infrastructure

### Worker API
- **URL:** `https://eaton-ehs-api.cball8475.workers.dev`
- **Auth:** Bearer token. Source of truth: Cloudflare **Secrets Store** secret `EATON_TOKEN` (bound as `AUTH_TOKEN`). Sessions self-serve the value from D1 `app_config` (key `EATON_TOKEN`) — never ask Charlie to paste it. Bootstrap: `source infra/env.sh`; if it reports no token, read the row via Cloudflare MCP `d1_database_query`, write `~/.fsc/eaton.token` (mode 600), source again. On a 401 after a rotation: `eaton_refresh_token`. Rotate ONLY via the **Rotate EATON API token** Actions workflow.
- **Worker name:** `eaton-ehs-api` — live version/commit from `/health` (`version`, `git_sha`); don't trust any hardcoded number here
- **Account ID:** `37821191a8c1419e055c2c0a30546589`

### D1 Database
- **ID:** `62ce85d7-0cc1-4832-aa57-d5b09ceaa132`
- **Tables:** tasks, people, templates, knowledge, people_intel, leadership_moves, weekly_reflections, scoreboard, app_config
- **Charlie's person_id:** 26
- D1 via the Cloudflare MCP is the fallback when the Worker is down or the bearer won't resolve. It needs no Worker token.

### API Endpoints
```
GET/POST /tasks           — task CRUD (?ownership=, ?target_period=, ?waiting_on=any, ?knowledge_type=, ?status=, ?since=, ?completed_since=, ?fields=, ?limit=)
GET/POST /people          — people directory (?department=, ?since=, ?fields=, ?limit=)
PATCH    /people/:id      — update person
GET      /people/:id/intel — person-specific intel
GET/POST /intel           — people intel (?person_name=, ?intel_type=, ?since=, ?fields=, ?limit=)
GET/POST /knowledge       — tribal knowledge (?category=, ?area=, ?q=, ?since=, ?fields=, ?limit=)
GET      /stats           — D1 ROW COUNTS ONLY (tasks/knowledge/intel/moves). No safety metrics — use /scoreboard
GET      /export          — full JSON dump
GET      /health          — version + git_sha
GET      /moves           — leadership moves (?since=YYYY-MM-DD, ?category=)
GET/PATCH /scoreboard     — EHS safety metrics (TRIR, recordables, observations, man-hours, forklift). Sole authority. Every PATCH snapshots into scoreboard_history
GET/POST /reflections     — weekly reflections (?since=; PATCH/DELETE /reflections/:id). One row per week_of (Monday); POST 409s on a week that exists — PATCH instead
GET      /reflections/health — missing weeks + drafts awaiting review + a single `alert` string
POST     /reflections/draft — write this week's computed draft now (?week_of= to backfill one week). Manual twin of the Friday 21:00 UTC cron
GET      /search          — search across knowledge + intel + tasks (?q=, ?limit=, ?mode=fts|semantic|hybrid). USE THIS for recall, not ?q= LIKE filters. mode=semantic answers meaning-level questions ("who resists change on the floor") via Vectorize embeddings; fts matches words
POST     /vectorize/backfill — one-time semantic index build (?offset=; loop until done:true)
GET      /trends          — weekly time series (?weeks=, default 12): tasks created/completed, knowledge/intel capture, moves by category, scoreboard history
GET      /brief           — composite for /morning (stats + open/overdue/blocked + scoreboard + recent intel in one call)
GET      /pulse           — composite for /status (stats + top overdue + blockers)
POST     /backup/run      — manual D1 backup to GitHub (Monday 12:00 UTC cron runs the same)
GET      /digest/preview  — formatted weekly digest (POST /digest/send to email it)
POST     /otter/extract   — AI transcript extraction (uses ANTHROPIC_API_KEY)
```

There is no `GET /knowledge/:id` or `/intel/:id`. To read one entry by ID, query D1 directly via the Cloudflare MCP.

**Filter param conventions (v3.3.0+):**
- `?since=YYYY-MM-DD` — filter by `created_at >= date` (or `date >=` for moves)
- `?fields=a,b,c` — return only the listed columns. Use for drift scans, never for content reads.
- `?limit=N` — cap rows (max 1000). Combine with `since` for cheap incrementals.

**Response shape:** `/search` returns separate `knowledge`, `intel`, and `tasks` arrays plus `counts` — not a flat `results` array.

### Task Field Values
- **status:** `todo`, `wip`, `done`, `projects`, `undated` (not plain English)
- **ownership:** `mine`, `fyi`
- **target_period:** `this-week`, `30-day`, `60-day`, `90-day`, `ongoing`
- **priority:** `High`, `Medium`, `Low`

### Knowledge Field Values
- **category:** equipment, process, project-history, incident, vendor, policy, tribal-knowledge, metric, org-context, decision, lesson
- **area:** steel-fab, copper-fab, warehouse, plant-wide, corporate, environmental, switchboard, data-center, seal-shop, workflow
- **related_ids** (v3.8.0+): comma-separated knowledge IDs this entry connects to — link decisions to their outcomes, incidents to their lessons. `GET /knowledge/:id/related` traverses both directions.
- **superseded_by** (v3.8.0+): ID of the entry that replaced this one. Superseded entries drop out of GET /knowledge and /search by default (`?include_superseded=1` to see them). PATCH the old entry instead of deleting — the chain is the audit trail.
- **conflicts on POST:** every knowledge POST returns `conflicts` (live same-subject entries) + `has_conflicts`. When true, surface it and resolve — supersede the loser or keep both deliberately.
- **Intel parity (v3.9.0+):** `people_intel` has the same `superseded_by`/`confidence` columns and the same POST conflict flagging (keyed on person + intel_type). Superseded intel drops out of reads and search; `?include_superseded=1` for audits. Resolve intel conflicts the same way: PATCH the stale entry with `{"superseded_by": <new_id>}`.

### Dashboard
- **URL:** https://eaton-ehs-cmd.netlify.app
- **Netlify site ID:** `5667ffaa-f8bb-4208-9cba-766fd357f2b8`
- Single-file HTML, no build step. Always deploy as `index.html`.

### Deploy Patterns
**Cloudflare Worker:** prefer the `deploy-worker.yml` Actions workflow — it runs on GitHub's runners, which hold the Cloudflare API token. A curl PUT to the Cloudflare API also works but wipes Worker secrets (API_TOKEN, ANTHROPIC_API_KEY, RESEND_API_KEY, GITHUB_BACKUP_TOKEN), which must then be re-set.

**Netlify dashboard:** Copy file to index.html, deploy with netlify CLI. Verify with grep before deploying.

**D1 note:** `ALTER TABLE` statements must run individually, not batched.

**Secret propagation:** a `wrangler secret put` takes ~30–45s to reach the running Worker. An immediate retest returns the old value and reads like a bad key. Wait a minute before concluding the new secret is wrong.

### Credential Rules
- Never ask Charlie for a GitHub PAT
- Use the florence-crm-api /github-push endpoint (GITHUB_TOKEN is a Worker secret) for GitHub operations
- Cloudflare API token (`CLOUDFLARE_API_TOKEN`): **not present in cloud sessions** (confirmed 2026-07-25). It lives as a GitHub Actions repo secret; worker deploys (`deploy-worker.yml`) and token rotations (`rotate-token.yml`) run on GitHub's runners. Charlie's local shells export it for wrangler. Do not commit it; GitHub push protection rejects `cfat_` tokens. Cloud sessions reach Cloudflare through the MCP connector (D1 queries, worker reads, `search_cloudflare_documentation` for platform-semantics questions) instead.
- For Netlify, use the Netlify CLI or MCP
- **Never commit a secret to a tracked file.** Deleting it later does not help — git history serves it forever, so a leak has to be rotated, not removed. (2026-07-29: a bearer removed from `infra/env.sh` stayed live in history and had to be rotated; the workflow now verifies new=200 AND old=401.)

## API Access Pattern (use from Claude Code)

Source `infra/env.sh` at the start of any Bash block, then use the `eaton` helper. The helper forwards to `$EATON_API$path` with Bearer auth. Token resolution is automatic (env var → `~/.fsc/eaton.token` → D1 fetch when `CLOUDFLARE_API_TOKEN` exists). In a cloud session with none of those, env.sh prints the self-serve bootstrap: read `app_config` key `EATON_TOKEN` via Cloudflare MCP `d1_database_query`, write `~/.fsc/eaton.token` (mode 600), source again — do not ask Charlie for the token.

```bash
source ~/projects/eaton-ehs-project/infra/env.sh   # local; in cloud sessions: source infra/env.sh

# Safety numbers — always from /scoreboard
eaton /scoreboard | jq .

# Create task
eaton /tasks -X POST -H 'Content-Type: application/json' \
  -d '{"title":"Example task","assignee_id":26,"ownership":"mine","status":"todo","priority":"Medium"}' | jq .

# Push knowledge
eaton /knowledge -X POST -H 'Content-Type: application/json' \
  -d '{"category":"tribal-knowledge","area":"plant-wide","subject":"Example","detail":"Content here"}' | jq .

# Common filter combinations (v3.3.0+)
eaton "/tasks?ownership=mine&status=todo&since=2026-05-20&fields=id,title,priority,due_date&limit=20" | jq .
eaton "/intel?since=2026-05-13&fields=person_name,intel_type,created_at" | jq .
```

## Key People

Full roster and hierarchy live in D1 (`people`, `people_intel`) and in knowledge #480 (Sumter CPA org chart) and #431 (TalentHub solid-line chain). Search intel before a meeting; don't rely on this list alone.

**Charlie's chain:** Kate Fowler → Laura Oshields → Angela Pastorius → Mark Schneider → … → Paulo Ruiz Sternadt (CEO). The EHS functional chain is separate: Steve Owles (VP-EHS) → Harold Jones → Karen → Georgie → Laura → Kate.

**EHS team — Kate's four reports, plus medical:**
- **Kate Fowler** (Katelyn Lee Fowler) — EHS Manager, Charlie's boss and predecessor. KateLFowler@eaton.com. Results-oriented, doesn't micromanage, expects ownership. Style: buy first, influence adoption second, ask forgiveness not permission. Got $1M+ central safety funding this year. Weekly 1-on-1s.
- **Jim Melton** (James Howard Melton) — EHS Supervisor, switchboard. **Applied for Charlie's role and was not selected — handle with care.** Deep institutional knowledge, knows Benchmark and SharePoint well, owns the gemba program build and the WSRA master list.
- **David Kelly** — EHS facility coordinator
- **Vanessa Smith** — EHS Technician, started June 2026, came off the production floor
- **Gabby** — Medical rep, first aid and engagement. No MESH program ownership. Non-work-related first aid is entirely hers; work-related case management stays Kate's, with no hands-on care without Kate's approval.
- Site runs **5 EHS staff** — the ESS model minimum, one below the Op-A target of 6.

**Site leadership:**
- **Stephen Krajcarski** ("Steve") — **interim Sumter Plant Manager** since June 2026, after Taylor Nations left. Also Mgr OPEX Lean Manufacturing. Ex-GM, 25 years, VP/president level; just over a year at Eaton. Highly structured, takes notes through tier meetings. Corporate is exploring making him permanent — no other candidates.
- **Laura Oshields** — Kate's functional manager (remote, 6 plants)
- **Gireesh Challawar** — Fab Ops Manager
- **Hunter Truett** — Mgr MFG Engineering. MEs Ashwin, Jad, Sachin, and Nitol report to him. Route Jad's non-EHS decisions here.

**Corporate EHS:**
- **Angela Pastorius** — Sr Manager EHS General (Integration); IH documentation, procedural standards, exposure assessments
- **Michelle** — Corporate Industrial Hygienist, under Angela. These are two different people; an older "Angela Michelle" entry conflated them, so don't reuse that name.
- **Tammy** — Environmental lead, global remediation. Go-to for any environmental question.
- **Eric** — Corporate Security (ex-FBI). Plant sits outside city limits, so county response is slow unless corporate calls.

**Fab floor** (working-relationship notes; full shift roster in `ref/eaton-stable.md`):
- **Gloria Carter** — Copper A-shift supervisor. Resistant to change but a powerful ally once bought in. Document everything; get buy-in before pushing change.
- **Stephanie Brownlee** — Copper B-shift supervisor, started 5/11/2026, Kate hire. Still needs supervisor onboarding (emergency response, incident investigation, leader standard work). Strong observation submitter.
- **Jad** — Copper ME. Pattern of bypassing the chain of command. Redirect non-EHS decisions to Hunter.
- **Ashwin** — Steel ME (laser safety and MOC reviewer) | **Sachin** — CI, fab | **Nitol Saha** — OT and automation
- **Kim** (Kimberly Hilton-Lawson) and **Thea** — Quality
- **Supply chain:** Nancy Mateo Perez (Mgr Materials Planning), Jeff Bays (purchasing), Shelly Matlock (Sr Buyer, data center), Amiee McDonald-Benjamin (Materials Ops)
- **Wastewater project:** Dave (project lead; covers Charlie's $40k cost-out target)
- **Waste broker:** Envita (Anna) | **SDS access:** Jose Rojas (3E)
- **Vest colors:** purple = team lead, red = ERT, brown = warehouse

**Recent departures and losses:** Taylor Nations (Plant Manager, June 2026); Marty Drexelius (June 2026 — his projects route to Charlie or Jim); Angie Pack (Mission Critical coordinator, died 7/18/2026, widely mourned).

## Current Priorities — EOY 2026 Commitments

Four projects committed at 100% by end of year. Pull live status from `/tasks`; these are the standing commitments, not a snapshot.

1. **Press brake safety** (task #521) — **highest priority.** Charlie's #1 My Five / AMR project. Sumter leads press-brake safety corporately and other plants are deferring to us, so visibility is high. Divert high-risk parts to AI cameras and automation; write the standard new equipment has to meet.
2. **Observation and work-order visibility** (task #522) — Build-to-Win pick #1. Power BI showing percent complete per area per month, plus a feedback loop so observers see outcomes. Includes ATS safety work orders (Trevor).
3. **MESH procedures** (task #523) — Build-to-Win pick #2. Procedures are missing operational controls: annual reviews, inspection criteria, documentation, record retention. Drive element review through the compliance calendar and the MESH Champion.
4. **Five EHS risk-reduction projects from the roadmap** (task #524) — copper-shop priority: tuggers (Jad/Gloria), spreader beams, scrap-band standardization, station cards, offal racks with ceiling and height control.

**Running alongside:**
- **Method sheet program** — now a site-wide overhaul rather than a solo walk: 853 sheets, roughly a third obsolete, ~200 real processes, 12 cross-functional teams, 6–8 months (knowledge #461). Charlie's scope is **material type and safety portions only**, not full step detail (#348). The target is one document-controlled master where method sheet, WSRA, and training matrix update together.
- **WSRA reviews** — 21 assigned to Charlie (12 copper, 9 steel), 100% by EOY. Only the top 25 were completed last cycle and not every workstation has one; they live in a MESH Elements folder and Jim Melton is building the master list (#374). WSRAs overlap with method-sheet machines, so the two double-dip.
- **TalentHub / My Five** — goals are set. Open items are the TalentHub entry by KPI (#518), the development plan and 70/20/10 workbook (#519), and keeping the My Five dashboard current (#544).
- **LSW binder** — Kate audits weekly. Rollout is uneven: only Switchboard got a full rollout, Fab Steel and Copper got books on A-shift only, and warehouse has a large gap (#462).
- **Daily cadence:** at least one GEMBA per day with an observation (QR code). ~30 positive interrupters per month. Benchmark actions closed Monday before noon. Compliance calendar at 100%. MESH Americas call Fridays. Weekly 1-on-1s with Kate.

## Key Site Targets (stable)

Targets only. For actuals, `GET /scoreboard`.

- TRIR goal: 0.65
- Forklift incident reduction: 25%. The baseline has to come from **Powerfleet impact events**, not the recordable count — `forklift_incidents_ytd` on the scoreboard counts OSHA recordables and understates it (#450). Severe impact is sensor-defined in Powerfleet, not a judgment call.
- $40k EHS cost-out target (the wastewater project covers it)
- ~24 forklifts on site
- 445 observations in full-year 2025 is the baseline; driving observation culture is a 2026 focus. Fab-team math: one observation per department per shift per week = 32/month for copper plus steel (#434).
- **1M man-hours with no lost time:** the clock **reset 5/28/2026** on a reel/finger lost-time case. Count hours since that reset, not `man_hours_ytd`, which is a year-to-date figure and much larger. The original "by July" framing is dead.
- May through July is historically the worst injury period
- The site loses its safety-focused designation next year, so the extra corporate support goes away while the assessment bar rises (#499)

## Memory Architecture

Where data lives. When facts disagree, the authoritative source wins.

- **`/scoreboard`** — sole authority for every safety metric. See the rule near the top of this file.
- **D1** (via Worker API) — authoritative for everything else dynamic: tasks, people, knowledge, intel, leadership_moves, weekly_reflections. Always pull fresh; don't cache those facts here.
- **CLAUDE.md** (this file) — authoritative for stable rules: communication style, infra IDs, working-relationship notes, standing priorities, targets. Auto-loaded every session — and the *only* thing auto-loaded, which is why the Session Start Protocol near the top of this file exists. **The filename has to stay capitalized** — Claude Code only auto-loads `CLAUDE.md`, and on Linux and cloud sessions a lowercase `claude.md` is silently never read.
- **ref/eaton-stable.md** — facility procedures (PPE, MOC, fab flows, EHS systems, full shift-supervisor roster, environmental). Read on demand for operational questions.
- **ref/debrief-protocol.md** — user-facing copy-paste prompt. Charlie's tool, not Claude's reference.
- **kb/lessons.md** — active failure log. The only `.md` file ever appended to. Force-read at `/morning` if updated since the last session.
- **ref/archive/, kb/archive/** — retired and superseded files. Do not read. Do not append. Kept for rollback only.

If a number appears in this file it should be a *target* or *stable fact*, never a snapshot.

**Recall rule (v3.8.0+):** when Charlie asks "what do we know about X", "have we dealt with X before", or "who told us about X", hit `GET /search?q=X` first — it's FTS across knowledge, intel, and tasks, ranked with snippets. The per-endpoint `?q=` LIKE filters only match literal substrings; /search matches terms anywhere in any order. LIKE filters are for structured drift scans; /search is for memory.

**Backup (v3.8.0+):** a Monday 12:00 UTC cron pushes a gzipped full D1 export to `infra/backups/auto/` on GitHub main (needs the `GITHUB_BACKUP_TOKEN` Worker secret). Manual: `POST /backup/run`. `/audit` verifies the cadence. Restore: `infra/restore.sh <backup> <fresh-db> --create` — schema, data, FTS rebuild, count verification (tested 2026-07-22; refuses prod without `--force-prod`). The "07-27 backup miss" was a false alarm: **Cloudflare cron day-of-week is Quartz-style (1 = Sunday, 7 = Saturday), not POSIX**, so the numeric schedules fired a day early for weeks — backups landed Sundays (07-26 was that week's run), digests went out Thursdays. Fixed 2026-08-02 (v3.10.1): every cron now spells the day out (`MON`/`FRI`), and the `scheduled()` switch cases must match those literal strings. Never write a numeric day-of-week in `wrangler.toml`.

**Verify crons by outcome, not exit status.** The digest is proven by an email in the inbox, the backup by a dated file in `infra/backups/auto/`, the reflection by a row in `weekly_reflections`. `ctx.waitUntil(p)` inside a try/catch catches nothing, and any helper that returns `{success:false}` instead of throwing is a silent failure by construction — that pattern has now bitten `/otter/extract`, the digest, and the backup.

**Weekly reflections (v3.10.0+) are automated, and the automation is watched.** Three layers, because the reflection is the influence-vs-execution record Laura tracks and it went 8 weeks unnoticed when it depended on Charlie remembering to run `/weekly`:

1. A **Friday 21:00 UTC cron** auto-drafts the row from that week's real signals (moves, closed tasks, knowledge, intel) with `status='auto-draft'`. Idempotent per `week_of`, so running `/weekly` first makes it a no-op. It throws on failure and verifies the row reads back.
2. **`/reflections/health` rides `/stats`**, so `reflections.alert` reaches `/morning` (via `/brief`) and `/status` (via `/pulse`) every day. This is the layer that catches the *cron* dying — it checks that rows exist rather than trusting any cron's exit status. `/morning` and `/status` must render `alert` whenever it is non-null.
3. The **Friday digest email** carries a reflection-status line — an independent channel that still lands if both the cron and the brief are broken.

An `auto-draft` is a placeholder, not a reflection: it guarantees the week isn't lost, and `/weekly` PATCHes it to `confirmed` once Charlie has revised it. **Never back-fill missing weeks silently** — a reflection is evidence someone reads, so an honest gap beats invented history. Offer `POST /reflections/draft?week_of=` and let Charlie decide.

Every cron in `wrangler.toml` needs an explicit `case` in the worker's `scheduled()` switch. Before v3.10.0 the handler special-cased the backup and let everything else fall through to the digest, so a third trigger would have quietly mailed a second digest each week; an unrecognised cron now throws.

## Working Rules

- **D1 is the sole system of record** for tasks, knowledge, intel, and decisions. Do not write data to .md files.
- **Debrief discipline:** stay close to what transcripts say. Flag attribution uncertainty. Default ambiguous items to FYI, not mine — "mentioned" is not "directed." Don't auto-push; present for review first.
- **Assessment before execution:** give an honest evaluation before building or acting.
- **Diagnose deployed code by reading the live Worker** via Cloudflare MCP `workers_get_worker_code`, not `infra/worker-api.mjs` — the two have diverged before and it cost an hour.
- **Check the credential registry before building on an infrastructure claim.** Three wrong infrastructure claims in one month traced back to docs asserting access that had already been disproved.
- **CapEx and procurement:** submit Q1; 10% down locks a project permanently; Kate does 70–80% upfront. Q3 spending gets cut. Split large projects under the ~$200k internal approval threshold.
- **Every deliverable is a succession demonstration.** Method sheets, observations, goal-setting — all operational and all succession proof.
- **Otter.ai is unreliable.** If a transcript fetch fails, ask Charlie to paste it manually. Otter timestamps are offset — T3 is always 8:15 AM. Date params use `YYYY/MM/DD`. Otter also mis-transcribes names ("Jad" as "John", "Sean" as "Shawn"), so search name variants before creating a people record.

## Process Flows

### Steel Fab
Receive → Laser → Punch → Press Brakes → Spotweld → Paint → Storage → Scrap → Rework

### Copper Fab
Receive → EHRT → Boschert → Press Brakes → Notcher → R5 Shear → Drill → Kitting

**Both flows are changing.** Sumter moves to switchboard-only manufacturing in 2027: the box line and spot weld go out end of 2026 or early 2027, the trim line is fully outsourced, and two suppliers are buying the lasers, punches, and spot welders (one spot welder stays for emergencies). The site also needs 158% more square footage by 2027. Check knowledge #416 before treating any fab flow as permanent.

### MOC Triggers
Chemical changes, equipment moves over 75 lbs, new or modified processes. Auto-routed for EHS/PM/OPEX/ME approval. Pre-startup approval required.

## Environmental Quick Reference
- Title V fully exempt
- RTO = "Right to Operate" doc (a one-pager, not a thermal oxidizer)
- Mission Critical is not compliant on storm water (shared building with Evans, NAICS = construction)
- Legal is blocking the 8700 form to avoid triggering inspections
- Fire marshal inspection incoming — has a history of friction with Kate

## Eaton EHS Systems
- **MESH PRISM** — incidents (needs a SAP EHSM IT ticket plus Reviewer/Approver role)
- **Benchmark** — action tracking, compliance calendar, LPAs, KPIs
- **3E** — SDS management (Jose Rojas for access)
- **MESH Elements** — WSRA storage (switchboard ones prefixed SWBD)
- **MQ1** — method sheet document control
- **SRA Tool** — annual site risk assessment
- **Powerfleet / VisionPro** — forklift telematics, impact events, training list
- **Sustainability Reporting** — worked hours due the 5th of the month
- **ENHESA** — regulatory tracking
- **Eaton University** — course ETNMESHA = MESH Awareness

## File Organization
```
CLAUDE.md                 — This file (capitalized; a lowercase name never loads)
ref/eaton-stable.md       — Facility procedures, PPE, MOC, fab flows, EHS systems, shift supervisors
ref/debrief-protocol.md   — User-facing copy-paste prompt for /debrief
ref/archive/              — Retired duplicates (do not read)
infra/env.sh              — Token resolution, the `eaton` helper, `eaton_refresh_token`
infra/worker-api.mjs      — Worker source (can lag the deployed version — verify via /health)
infra/schema.sql          — D1 schema
infra/migrations/         — Dated migration SQL (run ALTER TABLE individually)
infra/restore.sh          — D1 restore from a backup export
infra/backups/auto/       — Weekly gzipped D1 exports (Monday 12:00 UTC cron)
infra/deploy-notes.md     — Deploy patterns and gotchas
tools/                    — Floor form (html + jsx) and 1-on-1 coach jsx
tools/signage/            — Print-ready ANSI Z535.2 signs (html source + rendered pdf)
kb/lessons.md             — Active failure log (the only .md file appended to)
kb/archive/               — Pre-D1-migration snapshots (do not read)
.claude/commands/         — Slash command definitions
.claude/settings.local.json — Permissions and MCP config
.github/workflows/        — deploy-worker.yml, rotate-token.yml
```
