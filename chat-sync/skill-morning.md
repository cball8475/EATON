Run the morning brief. No pleasantries — start with the data.

## Step 1: Pull D1 status

Fetch these endpoints (use `EATON_API` + `EATON_TOKEN` from Project Instructions, header `Authorization: Bearer EATON_TOKEN`):

- `GET /stats`
- `GET /tasks?status=todo&ownership=mine`
- `GET /tasks?waiting_on=any`
- `GET /scoreboard`

## Step 2: Pull lean context for drift scan (projected, not full bodies)

- `GET /people?fields=id,name` — names only, for waiting_on validation
- Compute `SINCE` = 14 days before today (format YYYY-MM-DD)
- `GET /intel?since={SINCE}&fields=person_name,intel_type,created_at` — recent intel only

Counts (knowledge, intel, people, leadership_moves) come from `/stats` in Step 1 — do NOT fetch full bodies for counts.

## Step 2.5: Lightweight drift scan
- Scan open tasks from Step 1 — for each `waiting_on` value, check if name appears in the projected people list
- From the projected intel-since-14d response, identify key people (Kate, Laura, Gloria, shift supervisors) with NO entry in the window
- If `/stats` knowledge.this_week or intel counts feel off vs. what you remember from last session, flag it

Output drift as single line: `🔍 DRIFT: [count] items — [one-liner per finding]` or omit if clean.

## Step 3: Force-read lessons
Read `kb-lessons.md` (if uploaded to project). Surface any entries added since last session under `⚠ RECENT LESSONS`. Skip if none.

## Step 4: Detect dashboard changes

Compute `YESTERDAY` = 1 day before today.
`GET /tasks?completed_since={YESTERDAY}&fields=id,title,completed_at,priority,notes`

Parse `[COMPLETED: reason]` tags in notes field.

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
From `/scoreboard` (pulled in Step 1):
- TRIR (current vs 0.65 goal — flag if drifting up)
- Recordables YTD (1 = on track, 2+ = flag)
- Observations this month (vs ~37/month target for 445/year baseline)
- Man-hours YTD (track toward 1M goal by July)

If May-July, flag worst injury window. Any open incident follow-ups from tasks.

If `last_updated` on /scoreboard is older than 7 days, flag: "⚠ Scoreboard stale — update during next /weekly close."

## Step 10: Close with one line
"Highest-value move today: [specific action based on the data]"

## Rules
- No pleasantries. Start with the brief.
- One phone screen max.
- If tools fail, say what failed and work with what's available.
- Don't repeat known info — if nothing changed since yesterday, say so.
- **Never fetch full `/knowledge`, `/intel`, or `/people` bodies** for counts. Use `/stats` (free) or `?fields=` projection. Full bodies are only needed when you're actually reading content (e.g. `/kate-prep` pulling Kate-tagged knowledge).
