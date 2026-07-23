Weekly review. Run Friday afternoon before leaving.

## Setup
Compute `SINCE` = 7 days before today (format YYYY-MM-DD). Use `EATON_API` + `EATON_TOKEN` from Project Instructions for all calls below.

## Step 1: Pull deltas (targeted, not full dumps)

- `GET /stats` — counts (always cheap)
- `GET /digest/preview` — server-composed weekly digest (the real work)
- `GET /tasks?status=done&since={SINCE}` — this-week wins
- `GET /tasks?ownership=mine&status=todo` — open tasks (for Gaps + Next Week)
- `GET /moves?since={SINCE}` — this-week leadership moves
- `GET /knowledge?since={SINCE}&fields=id,category,area,subject,people_involved,created_at` — this-week knowledge headers
- `GET /intel?since={SINCE}&fields=person_name,intel_type,created_at` — this-week intel headers
- `GET /knowledge?category=metric&q=audit-baseline&fields=subject,created_at&limit=1` — audit cadence check
- `GET /trends?weeks=12` — 12-week series: tasks created/completed, knowledge/intel capture, moves by category, scoreboard history. Use for the DIRECTION of each My Five goal, not just this week's number ("TRIR flat 3 weeks", "zero influence-category moves since June"). Trajectory is what Laura reads.

Total payload: ~30–50KB instead of ~500KB.

## Step 2: WSRA progress
21 assigned to Charlie (12 copper, 9 steel). Calculate current rate from open tasks tagged WSRA. On track for EOY 100% site-wide?

## Step 3: My Five / goal tracking
- Fab risk reduction (3-5 workstations)
- Cost-out ($40k wastewater project)
- Observation culture (monthly count vs target)
- WSRA completion
- Forklift incident reduction (25% goal)

## Step 4: Leadership moves audit
From `/moves?since=` response — categories represented, gaps (any category with zero entries in 2+ weeks per `/stats.leadership.by_category` history).

## Step 5: Relationship map check
From `/intel?since=` projected response — distinct `person_name` values touched this week. Cross-check against key people roster in Project Instructions. Any shift supervisors, Gloria, Kate, Laura with zero entries this week?

## Step 6: Knowledge capture audit
From `/knowledge?since=` projected response — counts by category. Kate transition gaps visible? Zero entries this week = debriefs aren't extracting enough.

## Step 7: Audit cadence
From the last `/knowledge?q=audit-baseline` response:
- If no result, or most recent `subject` date > 21 days ago: prompt Charlie — "Last full audit was [date]. Run `/audit` after this brief?"
- If ≤21 days: skip silently. Note in output: `✓ Last audit: [date]`.

The full semantic audit lives in `/audit` — heavy data fetch, not part of the weekly default.

## Step 7b: Weekly reflection — capture to D1
Once per week, write a reflection. This is the influence-vs-execution record Laura cares about for succession; the table has been empty since launch.

Compute `WEEK_OF` = the Monday of the current week (YYYY-MM-DD).

- `GET /reflections?since={WEEK_OF}` — if a row for this week already exists, note it in the output and skip (don't duplicate).

Otherwise draft each field from the week's real signals — leadership moves = influence, closed tasks = execution, intel/knowledge = what was learned — keep each to 1–2 sentences, present to Charlie, then push on approval (same present-first rule as `/close`):

- `POST /reflections` with body:
```json
{
  "week_of": "{WEEK_OF}",
  "influenced_vs_executed": "what moved because Charlie influenced it vs. executed directly",
  "clarity_created": "ambiguity Charlie resolved for others this week",
  "learned_about_eaton": "new org / process / political insight",
  "time_allocation_note": "where the hours actually went vs. where they should have",
  "source_label": "/weekly {WEEK_OF}"
}
```

## Step 8: Output

```
WEEKLY REVIEW — Week of [Monday date]

📊 SCOREBOARD:
  Tasks: [closed_this_week] closed / [total_open] open / [overdue] overdue
  WSRA: [X]/21 complete (open WSRA tasks remaining)
  Observations: [from /stats] / [monthly target]
  TRIR: [current — pull from /stats.scoreboard or skip if not available]
  Knowledge: [this_week] new this week / [total]
  Intel: [this_week] new / [total]
  Moves: [this_week] this week / [this_month] this month

✓ WINS THIS WEEK:
  → [tasks closed since SINCE — top 5 by priority/impact]

⚠ GAPS:
  → [overdue list, goals behind, cold relationships, Kate-transition gaps]

★ LEADERSHIP MOVES THIS WEEK: [count]
  → [list with categories]

🕓 AUDIT CADENCE:
  → ✓ Last audit: [date]   OR   ⚠ No audit in [N] days — run /audit

📓 REFLECTION:
  → [captured for week of [date] | already on file | drafted — awaiting approval]

🎯 NEXT WEEK PRIORITIES:
  1. [highest value action]
  2. [second priority]
  3. [third priority]
```

## Rules
- No full-body `/export` or `/knowledge` or `/intel` or `/people` fetches in the default weekly. Use `?since=` + `?fields=`.
- If Charlie says "run the audit too" or "/weekly --audit", chain into `/audit` after Step 8.
- Audit findings live in `/audit` output, NOT in the weekly brief.
- Reflection is once per week, keyed by `week_of` (Monday). Never write a second row for a week that already has one — PATCH `/reflections/:id` if it needs revising.
