---
description: Friday review — weekly deltas, WSRA/My-Five goal tracking, audit-cadence check, and a D1 reflection.
---

Weekly review. Run Friday afternoon before leaving.

## Setup
```bash
source infra/env.sh   # EATON_API + EATON_TOKEN + `eaton` helper
```
Compute `SINCE` = 7 days before today (YYYY-MM-DD). Auth: the Worker checks the Secrets Store secret `EATON_TOKEN` (bound as `AUTH_TOKEN`), not the per-Worker `API_TOKEN` — on a 401 see `kb/lessons.md` 2026-07-10. Data also queryable directly from D1 (db `62ce85d7-0cc1-4832-aa57-d5b09ceaa132`) via the Cloudflare MCP if the Worker is down.

## Step 1: Pull deltas (targeted, not full dumps)
```bash
SINCE=$(date --date='7 days ago' +%Y-%m-%d)
eaton /stats | jq .                                   # counts (cheap)
eaton /digest/preview | jq .                          # server-composed weekly digest (the real work)
eaton "/tasks?status=done&since=$SINCE" | jq .        # this-week wins
eaton "/tasks?ownership=mine&status=todo" | jq .      # open tasks (Gaps + Next Week)
eaton "/moves?since=$SINCE" | jq .                    # this-week leadership moves
eaton "/knowledge?since=$SINCE&fields=id,category,area,subject,people_involved,created_at" | jq .
eaton "/intel?since=$SINCE&fields=person_name,intel_type,created_at" | jq .
eaton "/knowledge?category=metric&q=audit-baseline&fields=subject,created_at&limit=1" | jq .
eaton "/trends?weeks=12" | jq .                       # 12-week series: tasks, knowledge, intel, moves, scoreboard history
```
Total payload: ~30–50KB instead of ~500KB.

`/trends` (v3.8.0+) is the trajectory view: created-vs-completed per week, capture rates, moves by category over time, and `scoreboard_history` (snapshotted on every scoreboard PATCH). Use it for the direction of each My Five goal, not just this week's number — "TRIR flat 3 weeks," "observation rate declining," "zero influence-category moves since June." That trajectory read IS the succession story Laura tracks.

## Step 2: WSRA progress
21 assigned to Charlie (12 copper, 9 steel). Calculate current rate from open tasks tagged WSRA. On track for EOY 100% site-wide?

## Step 3: My Five / goal tracking
- Fab risk reduction (3-5 workstations)
- Cost-out ($40k wastewater project)
- Observation culture (monthly count vs target)
- WSRA completion
- Forklift incident reduction (25% goal)

## Step 4: Leadership moves audit
From `/moves?since=` — categories represented, gaps (any category with zero entries in 2+ weeks per `/stats.leadership.by_category`).

## Step 5: Relationship map check
From `/intel?since=` projected response — distinct `person_name` values touched this week. Cross-check against key people roster. Any shift supervisors, Gloria, Kate, Laura with zero entries this week?

## Step 6: Knowledge capture audit
From `/knowledge?since=` — counts by category. Kate transition gaps visible? Zero entries this week = debriefs aren't extracting enough.

## Step 7: Audit cadence
From the last `/knowledge?q=audit-baseline` response:
- If no result, or most recent `subject` date > 21 days ago: prompt — "Last full audit was [date]. Run `/audit` after this brief?"
- If ≤21 days: skip silently. Note `✓ Last audit: [date]`.

The full semantic audit lives in `/audit` — heavy fetch, not part of the weekly default.

## Step 7b: Weekly reflection — capture to D1
Once per week, write a reflection (the influence-vs-execution record Laura cares about for succession). Compute `WEEK_OF` = Monday of the current week.
```bash
WEEK_OF=$(date --date="last monday" +%Y-%m-%d)   # or this Monday if today is Monday
eaton "/reflections?since=$WEEK_OF" | jq .
```
If a row for this week exists, note it and skip. Otherwise draft each field from the week's real signals (moves = influence, closed tasks = execution, intel/knowledge = learned), keep to 1–2 sentences, present to Charlie, then push on approval:
```bash
eaton /reflections -X POST -H 'Content-Type: application/json' -d '{
  "week_of":"'"$WEEK_OF"'",
  "influenced_vs_executed":"...",
  "clarity_created":"...",
  "learned_about_eaton":"...",
  "time_allocation_note":"...",
  "source_label":"/weekly '"$WEEK_OF"'"
}' | jq .
```

## Step 8: Output
```
WEEKLY REVIEW — Week of [Monday date]

📊 SCOREBOARD:
  Tasks: [closed_this_week] closed / [total_open] open / [overdue] overdue
  WSRA: [X]/21 complete (open WSRA tasks remaining)
  Observations: [from /stats] / [monthly target]
  TRIR: [current — from /scoreboard]
  Knowledge: [this_week] new / [total]
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
- No full-body `/export`/`/knowledge`/`/intel`/`/people` fetches. Use `?since=` + `?fields=`.
- If Charlie says "run the audit too" / "/weekly --audit", chain into `/audit` after Step 8.
- Reflection is once per week, keyed by `week_of` (Monday). Never write a second row — PATCH `/reflections/:id` to revise.
