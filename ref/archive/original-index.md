# Eaton EHS Project — File Index

Last updated: 2026-05-16

## Naming Convention

Files use prefixes to group by purpose. No actual folders — Claude Projects are flat — so the prefix IS the folder.

| Prefix | Purpose | Examples |
|--------|---------|---------|
| `00-` | Meta/index | This file |
| `ref-` | Reference docs read at session start | context, project instructions, debrief protocol |
| `infra-` | Infrastructure code (Worker, dashboard) | API source, deploy notes |
| `tool-` | Interactive tools/artifacts | Floor form, 1-on-1 coach |
| `kb-` | Knowledge base (tribal knowledge, process docs) | Kate knowledge captures, facility procedures |
| `log-` | Session logs, decisions, weekly summaries | Decision log, weekly captures |
| `skill-` | Command skills (triggers, execution steps, rules) | /morning, /debrief, /close, etc. |

## Current Files

### Reference (`ref-`)
- `ref-context.md` — Session briefing doc. Read this first every session. Who Charlie is, career trajectory, daily cadence, what to watch for.
- `ref-project-instructions.md` — Infrastructure details, commands, API endpoints, key people, facility context. (Currently `eaton-project-instructions-v2.md`)
- `ref-debrief-protocol.md` — Post-meeting debrief prompt and format. (Currently `post-meeting-debrief.md`)

### Infrastructure (`infra-`)
- `infra-worker-api.mjs` — Live Cloudflare Worker source code (eaton-ehs-api). Reference copy — deploy from here.
- `infra-deploy-notes.md` — Deploy patterns, gotchas, credential locations.

### Tools (`tool-`)
- `tool-floor-form.jsx` — Machine method sheet mobile form (React artifact). (Currently `machine-method-sheet-form.jsx`)
- `tool-floor-form.html` — Same form as standalone HTML for Safari/phone use. (Currently `machine-method-sheet-form.html`)
- `tool-1on1-coach.jsx` — 1-on-1 meeting prep coach artifact. (Currently `one-on-one-coach.jsx`)

### Knowledge Base (`kb-`)
- `kb-tribal-knowledge.md` — **Legacy snapshot.** Live data is in D1 via `/knowledge` API endpoint. Do not append to this file.
- `kb-people-intel.md` — **Legacy snapshot.** Live data is in D1 via `/intel` API endpoint. Do not append to this file.
- `kb-lessons.md` — Dead ends, silent failures, wasted effort. Force-read at morning brief if updated previous day. Prevents repeat mistakes.

> **Authoritative source for knowledge and people intel:** D1 database via the Worker API.
> - `GET/POST /knowledge` — Tribal knowledge (category, area, subject, detail). 75 entries as of migration.
> - `GET/POST /intel` — People intel (person_name, intel_type, content). 5 entries as of migration.
> - `GET /people/:id/intel` — Convenience route for person-specific intel.

### Logs (`log-`)
- `log-decisions.md` — Key decisions with date, context, rationale. Prevents re-litigating.
- `log-sessions.md` — Running session log. Date, what was covered, what changed. Archive monthly when >15KB.

### Skills (`skill-`)
- `skill-morning-1.md` — `/morning` command. Daily brief before T3.
- `skill-debrief.md` — `/debrief` command. Post-meeting transcript processing.
- `skill-close.md` — `/close` command. End-of-day session wrap.
- `skill-weekly.md` — `/weekly` command. Friday review.
- `skill-kate-prep.md` — `/kate-prep` command. Kate 1-on-1 prep.
- `skill-status.md` — `/status` command. Quick status pulse.
- `skill-tribal.md` — `/tribal` command. Quick tribal knowledge capture.
- `skill-floorform.md` — `/floorform` command. Opens floor form artifact.

## Rules

1. **Nothing gets lost to compaction.** If it matters, it goes in a file.
2. **Session logs append, never overwrite.** New entries go at the top.
3. **Knowledge and intel grow from debriefs.** After every Kate meeting, tribal knowledge and people intel get extracted and pushed to D1 via `/knowledge` and `/intel` API endpoints. The `kb-tribal-knowledge.md` and `kb-people-intel.md` files are legacy snapshots — do not append to them.
4. **Decisions are permanent.** Once logged, a decision stands unless explicitly reversed with a new entry.
5. **Infrastructure code stays current.** After any Worker deploy, update `infra-worker-api.mjs`.
6. **Rename legacy files** when adding them to the project under the new naming convention. Old names noted in this index for reference.
7. **Lessons capture failures, not successes.** kb-lessons.md is for dead ends and mistakes. Don't log things that worked — that's what the other files are for.
8. **Archive session logs monthly.** When log-sessions.md passes ~15KB, roll to log-sessions-YYYY-MM.md and start fresh.
