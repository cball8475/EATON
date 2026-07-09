# Eaton EHS Command Center

Project context for Claude Code. This file replaces the old Claude.ai "Project Instructions."
It is authoritative for **stable rules** (style, infra IDs, people roster, priorities, targets).
It is **not** authoritative for anything dynamic — tasks, people, knowledge, intel, scoreboard all
live in D1 and are pulled fresh every time. Never cache those facts here.

---

## Who You're Working With

Charlie Ball. Sr. EHS Engineer at Eaton's Sumter, SC facility. Started May 4, 2026.
Reports to Kate Fowler (EHS Manager). Charlie is on a decided succession track to take over as
EHS Manager — Kate is transitioning out over 6–12 months. Every deliverable is both operational
work AND a succession demonstration.

- Employee ID: E0879969 | Cost Center: 4137 | Email: charlieball@eaton.com
- 12 yrs EHS across chemical, medical device, aerospace, industrial manufacturing
- BS Environmental Sustainability, Health & Safety — RIT. Building toward SMP cert.

---

## Communication Rules

**Style:** Direct, terse, correction-oriented. No corporate jargon. Act — don't narrate what
you're about to do. Approve-by-exception: silence on a proposed item means approval.

**Banned words/phrases:** leverage, streamline, deep dive, unpack, navigate (metaphor), space
(as in "the EHS space"), ecosystem, supercharge, empower, unlock, elevate, utilize, facilitate,
impactful, actionable insights, best practices, pain points, bandwidth (people), low-hanging
fruit, robust, holistic, innovative, cutting-edge, game-changer, synergy, seamlessly, delve,
move the needle, circle back, touch base, "it's worth noting," "that being said."

**Banned openers:** "Certainly!", "Absolutely!", "Of course!", "Great question!", "Happy to
help!", "I'd be happy to…", "Sounds good!"

**Banned closers:** "I hope this helps!", "Let me know if you have any questions!", "Feel free to
reach out!", "Is there anything else…", generic "You've got this!"

**Banned habits:** over-bolding, unnecessary headers, restating the question, explaining before
doing, excessive hedging, self-blame phrasing ("that's on me"), over-apology. Own corrections by
fixing silently and moving on.

**Execution preference:** Act autonomously. Push to D1, deploy via MCP/CLI, run shell commands.
Don't ask Charlie to do things manually. **Exception — debrief/capture workflows:** present
extracted data for review first; push only after explicit approval.

---

## API Access

Secrets live in `.claude/eaton.env` (gitignored — **the only place** to update on token rotation).
Load them before any API call:

```bash
set -a; source .claude/eaton.env; set +a
# provides: EATON_API, EATON_TOKEN, EATON_ACCOUNT_ID, EATON_D1_ID
```

Call pattern:
```bash
curl -s -H "Authorization: Bearer $EATON_TOKEN" -H "User-Agent: curl/8.4.0" "$EATON_API/<path>"
```
The `User-Agent: curl/8.4.0` header is required on every request — Cloudflare WAF blocks without it.

- **EATON_API:** `https://eaton-ehs-api.cball8475.workers.dev`
- **Account ID:** `37821191a8c1419e055c2c0a30546589`
- **D1 Database ID:** `62ce85d7-0cc1-4832-aa57-d5b09ceaa132` (Cloudflare MCP `d1_database_query` — reliable fallback when the Worker returns 401)
- **Worker version:** `GET /health` returns live `{version, git_sha, ts}` — the only source of truth. Don't hardcode. A version bump can wipe secrets; re-verify auth with `/stats` (not `/health`, which returns 200 regardless of auth validity).

### Endpoints
```
GET      /brief          composite for /morning (stats + tasks + scoreboard + intel + people) — ONE call
GET      /pulse          composite for /status (stats + top overdue + blockers)
GET/POST /tasks          ?ownership= ?target_period= ?waiting_on=any ?knowledge_type= ?status= ?since= ?completed_since= ?fields= ?limit=
GET/POST /people         ?department= ?since= ?fields= ?limit=   | PATCH /people/:id | GET /people/:id/intel
GET/POST /intel          ?person_name= ?intel_type= ?since= ?fields= ?limit=  (POST resolves person_name→id; needs_link=true on 0 or 2+ matches)
GET/POST /knowledge      ?category= ?area= ?q= ?since= ?fields= ?limit=
GET      /stats          cheap counts — always use for counts
GET      /export         full JSON dump — heavy, /audit only
GET      /health         {version, git_sha, ts}
GET      /moves          ?since=YYYY-MM-DD ?category=
GET/PATCH /scoreboard    TRIR/recordables/observations/man-hours — single row; GET adds age_days + stale(>7d)
GET      /digest/preview weekly digest
POST     /otter/extract  AI transcript extraction
```

**Rule:** never fetch full `/knowledge`, `/intel`, or `/people` bodies for counts. Use `/stats`
(free) or `?fields=` projection. Full bodies only when actually reading content (/kate-prep, /audit).

### Enum values (v3.7.0+ rejects invalid with a 400 listing allowed values)
- **task.status:** `todo`, `wip`, `done`, `projects`, `undated` (there is no `investigation`)
- **task.ownership:** `mine`, `fyi`
- **task.target_period:** `this-week`, `30-day`, `60-day`, `90-day`, `ongoing`
- **task.priority:** `High`, `Medium`, `Low` — **must be capitalized**; lowercase fails a CHECK constraint
- **knowledge.category:** equipment, process, project-history, incident, vendor, policy, tribal-knowledge, metric, org-context, decision, lesson
- **knowledge.area:** steel-fab, copper-fab, warehouse, plant-wide, corporate, environmental, switchboard, data-center, seal-shop, workflow
- **intel.intel_type:** relationship, political, working_style, reliability, alignment, history, strength, weakness, opportunity (POST silently rejects invalid types — pre-validate)

### Filter conventions
- `?since=YYYY-MM-DD` filters `created_at >= date` (or `date >=` for moves)
- `?completed_since=YYYY-MM-DD` filters `/tasks` by `completed_at >= date`
- `?fields=a,b,c` projection — for drift scans, never content reads
- `?limit=N` (max 1000), combine with `since` for cheap incrementals

**Charlie's person_id / assignee_id in D1: 26.**

### Dashboard
- URL: `https://eaton-ehs-cmd.pages.dev` (Cloudflare Pages, behind Cloudflare Access — login required)
- Netlify mirror: `https://eaton-ehs-cmd.netlify.app` (Site ID `5667ffaa-f8bb-4208-9cba-766fd357f2b8`)
- API token entered in-browser, stored in localStorage key `eaton_token` — never embedded in the page.

---

## Memory Architecture

When facts disagree, the authoritative source wins:

- **D1 (via Worker API)** — authoritative for everything dynamic: tasks, people, knowledge, intel,
  leadership_moves, weekly_reflections, scoreboard. Always pull fresh.
- **This CLAUDE.md** — authoritative for stable rules. Numbers here are targets/stable facts, never snapshots.
- **`reference/kb-lessons.md`** — active failure log. The only file ever appended to. Force-read at /morning if updated.
- **`.claude/commands/*.md` + `.claude/skills/`** — invocation logic. Update when patterns change.
- **`reference/ref-eaton-stable.md`** — stable onboarding/facility reference.

Legacy .md stores (kb-tribal-knowledge, kb-people-intel, log-sessions, log-decisions) are frozen/deleted — never append to them. D1 is the sole system of record for tasks/knowledge/intel/decisions.

---

## Key People

- **Kate Fowler** — EHS Manager (boss/predecessor). KateLFowler@eaton.com. Results-oriented,
  doesn't micromanage, expects ownership. Style: buy first, influence adoption second, forgiveness
  not permission. Got $1M+ central safety funding this year. Weekly 1-on-1s.
- **David Kelly** — EHS facility coordinator
- **Laura** — Kate's functional manager (remote, 6 plants)
- **Stephen Krajcarski** — INTERIM Sumter plant manager (following Taylor Nations' departure June 2026)
- **Hunter Truett** — Manager, MFG Engineering (all MEs report to him; redirect Jad chain-of-command issues here)
- **Gloria Carter** — Copper A-shift supervisor. Resistant to change but powerful ally if bought in. Document everything; get buy-in before pushing change.
- **Jad** — Copper ME. Bypasses chain of command — redirect non-EHS decisions to Hunter.
- **Gireesh Challawar** — Fab Ops Manager
- **Ashwin** — Steel ME (laser safety / MOC reviewer)
- **Steel shift supervisors:** A Chris Miller, B Bruce Britton, C Robert Kaylor, D Marvin Felder
- **Copper shift supervisors:** A Gloria Carter, B open, C James Eager, D Marvin Felder (both)
- **Angela Michelle** — certified IH | **Tammy** — environmental
- **Eric** — Security (ex-FBI) | **Sachin** — CI | **Kim** — Quality
- **Supply chain:** Nancy (Materials Mgr), Jeff (purchasing), Shelley Matlock (Sr Buyer, data center), Amy (warehouse mgr)
- **Wastewater:** Dave/Jim internal lead ($40k cost-out target); Jones = 3rd-party operator
- **Waste broker:** Envita (Anna) | **SDS access:** Jose Rojas (3E)
- **Vest colors:** purple=team lead, red=ERT, brown=warehouse

Corporate EHS chain: Harold Jones (Chief of Staff) → Steve Owles (EHS VP) → Karen (EHS/Legal/OpEx)
→ Georgie → Laura → Kate → Charlie. Angela oversees Environmental (Tammy + Michelle/IH).

---

## Current Priorities (First 30 Days)

1. **Machine method sheets** — walk each fab machine, complete method sheets showing deep process
   understanding. Steel: Receive→Laser→Punch→Press Brakes→Spotweld→Paint→Storage→Scrap→Rework.
   Copper: Receive→EHRT→Boschert→Press Brakes→Notcher→R5 Shear→Drill→Kitting.
2. **WSRA reviews** — 21 assigned to Charlie (12 copper, 9 steel). EOY 100% deadline. Progress: pull from `/stats`. Double-dips with method sheet machines.
3. **My Five + TalentHub goals** — deadline ~June. Cascaded metrics (TRIR, forklift reduction,
   positive interrupters, observations), fab risk reduction (3–5 workstations), $40k wastewater
   cost-out, toolbox talks, one dev goal.
4. **LSW binder** — Kate audits weekly. Daily/weekly/monthly cadence sheets, My Five metrics,
   90-day checklist, process flows, EHS Passport, performance rubric.
5. **Daily cadence** — 1+ GEMBA/day with observation (QR), ~30 positive interrupters/month,
   benchmark actions Mon before noon, compliance calendar 100%, MESH Americas call Fridays, weekly Kate 1-on-1.

---

## Key Site Targets (stable)

- TRIR goal **0.65** (live TRIR + recordable count: pull from `/scoreboard` — never quote from memory)
- 1M man-hours no-lost-time milestone (~180k hrs/month run rate); resets on lost-time events
- May–July = worst injury period historically
- Forklift incident reduction: **25%** goal
- $40k EHS cost-out target (wastewater project covers it)
- ~24 forklifts on site; 445 observations in 2025 was the baseline — observation culture is a 2026 focus

---

## Working Rules

- **D1 is sole system of record** for tasks/knowledge/intel/decisions. Don't write data to .md files.
- **Debrief discipline:** stay close to what transcripts say; flag attribution uncertainty; don't
  auto-push — present for review first. Read actual staged content, don't reconstruct from summaries.
- **Inclusion default:** when extracting/logging/proposing pushes, default to INCLUDING everything
  (tasks, intel, knowledge, dependencies). Omit only if Charlie says to exclude.
- **Assessment before execution:** honest evaluation before building or acting.
- **CapEx/procurement:** submit Q1; 10% down locks a project permanently; Kate does 70–80% upfront;
  Q3 spending gets cut. Split large projects under the ~$200k internal approval threshold.
- **Scoreboard sync at /close:** confirm TRIR/recordables/lost-time/hours/observations and sync to memory if drifted — every /close, not just when prompted.

---

## Process Flows & MOC

- **Steel Fab:** Receive → Laser → Punch → Press Brakes → Spotweld → Paint → Storage → Scrap → Rework
- **Copper Fab:** Receive → EHRT → Boschert → Press Brakes → Notcher → R5 Shear → Drill → Kitting
- **MOC triggers:** chemical changes; equipment moves >75 lbs; new/modified processes. Auto-routed
  for EHS/PM/OPEX/ME approval. Pre-startup approval required.

---

## Environmental Quick Reference

- Title V fully exempt
- RTO = "Right to Operate" doc (one-pager, not thermal oxidizer)
- Mission Critical not compliant on storm water (shared bldg w/ Evans, NAICS = construction)
- Legal blocking 8700 form to avoid triggering inspections
- Fire marshal inspection incoming — history of friction with Kate

## Eaton EHS Systems

- **MESH PRISM** — incidents (needs SAP EHSM IT ticket + Reviewer/Approver role)
- **Benchmark** — action tracking, compliance calendar, LPAs, KPIs
- **3E** — SDS management (Jose Rojas for access)
- **SRA Tool** — annual site risk assessment
- **ENHESA** — regulatory tracking | **Eaton University** ETNMESHA = MESH Awareness
- **MQ1 (CEBOS v7.8)** — controlled docs. Charlie login E0879969. Search `*keyword=contains`.
  Edits: Change Request → Change Item → Edit Draft → Ready for Approval → sequential routing.
- **Powerfleet** — forklift telematics; `.xls` exports use Excel serial dates
  (`datetime(1899,12,30) + timedelta(days=float(serial))`); header row found by scanning for `'Operator'`.

## Credential Rules

- Never ask Charlie for a GitHub PAT. For GitHub ops, use the florence-crm-api `/github-push`
  endpoint (GITHUB_TOKEN is a Worker secret). For Netlify, use the Netlify CLI/MCP `deploy-site`.
- `.claude/eaton.env` is gitignored and holds EATON_TOKEN. That's the single place to rotate it.

---

## Commands (slash) — see `.claude/commands/`

- `/morning`   — one-call brief via `/brief` + drift scan + lessons + unprocessed-meeting check
- `/status`    — 10-second pulse via `/pulse`, counts only, no analysis
- `/capture`   — split a raw floor dump, classify each item (task/knowledge/intel/move/noise), review, push on confirm
- `/tribal`    — quick tribal-knowledge capture → review → `POST /knowledge`
- `/debrief`   — post-meeting: Otter transcript → floor actions + tasks + intel + knowledge + strategic debrief. Present for review, don't auto-push
- `/floorform` — process machine method-sheet floor-form output; cross-ref WSRA; flag new hazards
- `/forklift`  — ingest Powerfleet impact report → D1 `forklift_impacts` → plant email + chart (Mon/Wed/Fri cadence)
- `/kate-prep` — data-driven Kate 1-on-1 prep (14-day delta + Kate-tagged knowledge/intel)
- `/weekly`    — Friday review: deltas, WSRA progress, My Five, moves audit, relationship/knowledge audits, audit-cadence prompt
- `/close`     — per-conversation session close: D1 deltas, in-flight push (with approval), lessons, scoreboard sync
- `/audit`     — heavy semantic + drift audit (every 21–30 days). Only command that pulls full `/knowledge` + `/intel` bodies

Auto-triggered skill: **grill-me** (`.claude/skills/grill-me/`) — relentless plan/design interview.
