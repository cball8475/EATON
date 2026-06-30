Run the morning brief. No pleasantries — start with the data.

## Step 1: One call — `GET /brief`

Use `EATON_API` + `EATON_TOKEN` from Project Instructions (header `Authorization: Bearer EATON_TOKEN`).

`GET /brief` returns the whole data layer for this brief in a single response:
- `stats` — all counts (tasks, knowledge.this_week, intel, leadership_moves)
- `open_mine` — open tasks owned by Charlie
- `overdue`, `due_today`, `blocked` — task lists
- `completed_since_yesterday` — for dashboard-change detection (Step 4)
- `scoreboard` — with `age_days` + `stale` already computed (Step 9)
- `recent_intel` — intel headers from the last 14 days (drift scan)
- `people_names` — id+name list (waiting_on validation)

One round trip. Do NOT make separate `/stats`, `/tasks`, `/scoreboard`, `/people`, or `/intel` calls — it's all in `/brief`.

Fallback (only if `/brief` 404s — Worker pre-v3.7.0): the old multi-call path — `GET /stats`, `GET /tasks?status=todo&ownership=mine`, `GET /tasks?waiting_on=any`, `GET /scoreboard`, `GET /people?fields=id,name`, `GET /intel?since={14d ago}&fields=person_name,intel_type,created_at`, `GET /tasks?completed_since={yesterday}&fields=id,title,completed_at,priority,notes`.

## Step 2: Lightweight drift scan (from the `/brief` response)
- For each `blocked[].waiting_on`, check the name appears in `people_names`
- From `recent_intel`, identify key people (Kate, Laura, Gloria, shift supervisors) with NO entry in the 14-day window
- If `stats.knowledge.this_week` or intel counts feel off vs. what you remember from last session, flag it

Output drift as single line: `🔍 DRIFT: [count] items — [one-liner per finding]` or omit if clean.

## Step 3: Force-read lessons
Read `kb-lessons.md` (if uploaded to project). Surface any entries added since last session under `⚠ RECENT LESSONS`. Skip if none.

## Step 4: Detect dashboard changes
From `completed_since_yesterday` in the `/brief` response. Parse `[COMPLETED: reason]` tags in the `notes` field. No extra call.

## Step 5: Check for unprocessed meetings
If Otter.ai MCP is connected, search for meetings since last session. Cross-reference against `source_meeting_id` in recent tasks. Flag unprocessed meetings. If Otter fails, skip silently.

## Step 6: Calendar
Ask Charlie to paste or screenshot Outlook calendar for today. Outlook = work, Google Calendar = personal/family. Don't block the brief if skipped.

## Step 7: Output — one screenful, phone-readable

```
MORNING BRIEF — [Day, Date]

🔍 DRIFT: [findings or omit]
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

## Step 9: Safety pulse
From `scoreboard` in the `/brief` response:
- TRIR (current vs 0.65 goal — flag if drifting up)
- Recordables YTD (1 = on track, 2+ = flag)
- Observations this month (vs ~37/month target for 445/year baseline)
- Man-hours YTD (track toward 1M goal by July)

If May-July, flag worst injury window. Any open incident follow-ups from tasks.

`scoreboard.stale` is already computed server-side (true when `age_days > 7`). If `stale`, flag: "⚠ Scoreboard stale ([age_days]d) — update during next /weekly close."

## Step 10: Close with one line
"Highest-value move today: [specific action based on the data]"

## Rules
- No pleasantries. Start with the brief.
- One phone screen max.
- If tools fail, say what failed and work with what's available.
- Don't repeat known info — if nothing changed since yesterday, say so.
- **Never fetch full `/knowledge`, `/intel`, or `/people` bodies** for counts. Use `/stats` (free) or `?fields=` projection. Full bodies are only needed when you're actually reading content (e.g. `/kate-prep` pulling Kate-tagged knowledge).
