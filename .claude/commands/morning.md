---
description: Start-of-day EHS brief — D1 status, drift scan, overdue/today/blocked, safety pulse, highest-value move. One phone screen.
---

Run the morning brief. No pleasantries — start with the data. One phone screen max.

## Setup
```bash
source infra/env.sh   # exports EATON_API + EATON_TOKEN, defines the `eaton` helper
eaton /health         # confirm auth works (200). If /stats 401s, see FALLBACK below.
```

**Auth note:** the Worker checks the **Secrets Store** secret `EATON_TOKEN` (bound as `AUTH_TOKEN`), NOT the per-Worker `API_TOKEN` var. `infra/env.sh` no longer stores the token — it resolves env var → `~/.fsc/eaton.token` → D1 `app_config`. On a 401 after a rotation, run `eaton_refresh_token`. If env.sh reports no token at all, self-serve it: read `app_config` key `EATON_TOKEN` via Cloudflare MCP `d1_database_query`, write `~/.fsc/eaton.token` (mode 600), source again — never ask Charlie to paste it. See `kb/lessons.md` 2026-07-10 and 2026-07-29.

**FALLBACK if the Worker token is dead:** the data lives in D1 — query it directly via the Cloudflare MCP `d1_database_query` (db `62ce85d7-0cc1-4832-aa57-d5b09ceaa132`). No Worker token needed, so a dead token never blocks the brief.

## Step 1: Pull D1 status
```bash
eaton /stats | jq .
eaton "/tasks?status=todo&ownership=mine" | jq .
eaton "/tasks?waiting_on=any" | jq .
eaton /scoreboard | jq .
```

## Step 2: Lean context for drift scan (projected, not full bodies)
```bash
eaton "/people?fields=id,name" | jq .            # names only, for waiting_on validation
SINCE=$(date --date='14 days ago' +%Y-%m-%d)
eaton "/intel?since=$SINCE&fields=person_name,intel_type,created_at" | jq .
```
Counts (knowledge, intel, people, leadership_moves) come from `/stats` — do NOT fetch full bodies for counts.

## Step 2.5: Lightweight drift scan
- For each open-task `waiting_on` value, check the name appears in the projected people list.
- From intel-since-14d, flag key people (Kate, Laura, Gloria, shift supervisors) with NO entry in the window.
- If `/stats` knowledge/intel counts feel off vs. last session, flag it.
- Output as one line: `🔍 DRIFT: [count] items — [one-liner each]`, or omit if clean.

## Step 2.6: Reflection gap (do NOT skip — this is the automation's tripwire)
`/stats` now returns `reflections.alert`. **If it is non-null, render it.** A Friday cron auto-drafts the weekly reflection, but a cron that dies reports nothing, so this check verifies the *rows* exist rather than trusting the cron — the `kb/lessons.md` 2026-07-25 lesson (verify by outcome, not exit status) applied to the succession record Laura tracks.

- `reflections.weeks_missing > 0` → `⚠ REFLECTIONS: [alert]` and name the missing Mondays. Treat it as a broken cron, not a nudge.
- `reflections.awaiting_review` non-empty → one line noting a draft is waiting on `/weekly`.
- Both clear → omit the line entirely.

`/stats` also returns `ops.alert` (v3.11.0+) — backup/digest freshness from the success heartbeats. **If non-null, render it as `⚠ OPS: [ops.alert]`.** A stale backup heartbeat means the Monday backup cron has been failing (usually a dead `GITHUB_BACKUP_TOKEN`); a stale digest heartbeat, the Friday digest (`RESEND_API_KEY`). Same rule as reflections: a broken automation, not a nudge. Omit when null.

## Step 3: Force-read lessons
Read `kb/lessons.md`. Surface entries added since the last session under `⚠ RECENT LESSONS`. Skip if none.

## Step 4: Detect dashboard changes
```bash
YESTERDAY=$(date --date='1 day ago' +%Y-%m-%d)
eaton "/tasks?completed_since=$YESTERDAY&fields=id,title,completed_at,priority,notes" | jq .
```
Parse `[COMPLETED: reason]` tags in the notes field.

## Step 5: Unprocessed meetings
If Otter.ai MCP is connected, search for meetings since last session; cross-reference `source_meeting_id` in recent tasks. Flag unprocessed. If Otter fails, skip silently.

## Step 6: Calendar
Pull today's events (`calendar_events` table, or ask Charlie to paste Outlook). Outlook = work, Google Calendar = personal. Don't block the brief if skipped.

## Step 7: Output — one screenful, phone-readable
```
MORNING BRIEF — [Day, Date]

🔍 DRIFT: [findings or omit]
⚠ REFLECTIONS: [reflections.alert — omit only when null]
⚠ OPS: [ops.alert — omit only when null]
⚠ RECENT LESSONS: [or omit]
↕ DASHBOARD CHANGES SINCE LAST SESSION: [completed/changed tasks]
📣 UNPROCESSED MEETINGS: [count or omit]
🔴 OVERDUE: [count] → [top 3 by priority]
⚡ TODAY: [calendar + tasks due today]
🚧 BLOCKED: [count] → [top blockers]
📋 THIS WEEK: [compliance calendar, benchmark status]
📚 KNOWLEDGE THIS WEEK: [X] new entries
💡 HEADS UP: [floor follow-up, Friday MESH call, 5th-of-month sustainability]
```

## Step 8: Monday-specific
If Monday: Benchmark actions MUST be done before noon (corporate checks at noon, 90%+ required). Flag as priority 1.

## Step 9: Safety pulse (from /scoreboard)
- TRIR (current vs 0.65 goal — flag if drifting up)
- Recordables YTD (1 = on track, 2+ = flag)
- Observations this month (vs ~37/month target)
- Man-hours YTD (toward 1M by July); note the 1M-no-lost-time clock RESET 5/28 — measure since reset
- May–July = flag worst injury window
- If `/scoreboard` `last_updated` > 7 days old, flag: "⚠ Scoreboard stale — update at next /weekly."

## Step 10: Close with one line
"Highest-value move today: [specific action based on the data]"

## Rules
- No pleasantries. Start with the brief. One phone screen.
- If tools fail, say what failed and work with what's available.
- Don't repeat known info — if nothing changed since yesterday, say so.
- Never fetch full `/knowledge`, `/intel`, or `/people` bodies for counts. Use `/stats` or `?fields=` projection.
