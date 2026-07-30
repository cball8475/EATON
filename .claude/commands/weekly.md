---
description: Friday review — weekly deltas, WSRA/My-Five goal tracking, audit-cadence check, and a D1 reflection.
---

Weekly review. Run Friday afternoon before leaving.

## Setup
```bash
source infra/env.sh   # EATON_API + EATON_TOKEN + `eaton` helper
```
Compute `SINCE` = 7 days before today (YYYY-MM-DD). Auth: the Worker checks the Secrets Store secret `EATON_TOKEN` (bound as `AUTH_TOKEN`), not the per-Worker `API_TOKEN`. env.sh resolves the value itself (env var → `~/.fsc/eaton.token` → D1 `app_config`); on a 401 after a rotation run `eaton_refresh_token`. See `kb/lessons.md` 2026-07-10 and 2026-07-29. Data also queryable directly from D1 (db `62ce85d7-0cc1-4832-aa57-d5b09ceaa132`) via the Cloudflare MCP if the Worker is down.

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

## Step 7b: Weekly reflection — revise the draft, don't create one
The reflection is the influence-vs-execution record Laura tracks for succession. **As of v3.10.0 a Friday 21:00 UTC cron auto-drafts it, so the row usually already exists** with `status='auto-draft'` and fields computed from the week's real signals. Your job is to turn that draft into something true, not to author from scratch.

```bash
eaton /reflections/health | jq .          # missing_weeks, awaiting_review, alert
```

Then:

- **`awaiting_review` contains this week** → read the draft, rewrite each field in Charlie's voice from the week's real signals (moves = influence, closed tasks = execution, intel/knowledge = learned), keep to 1–2 sentences each, present to Charlie, and on approval PATCH it — including `status` so it stops nagging:
  ```bash
  eaton /reflections/<id> -X PATCH -H 'Content-Type: application/json' -d '{
    "influenced_vs_executed":"...",
    "clarity_created":"...",
    "learned_about_eaton":"...",
    "time_allocation_note":"...",
    "source_label":"/weekly <WEEK_OF> (revised)",
    "status":"confirmed"
  }' | jq .
  ```
- **`this_week_status` is `confirmed`** → already done. Note it and move on.
- **`this_week_status` is `missing`** → the cron didn't run. That is a real failure, not a nudge: say so in the output, then draft it by hand with `POST /reflections/draft` (writes the computed draft immediately) and revise as above.
- **`missing_weeks` is non-empty** → weeks were lost before the automation existed. Surface the list; **don't back-fill silently.** A reflection is evidence Laura reads, so inventing past weeks is worse than an honest gap. Ask Charlie whether he wants a computed draft for any of them (`POST /reflections/draft?week_of=YYYY-MM-DD`).

Never `POST /reflections` for a week that already has a row — the endpoint returns 409 with the existing id. One row per week; PATCH to revise.

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
  → [confirmed for week of [date] | draft revised + confirmed | ⚠ CRON DID NOT RUN — drafted by hand]
  → [⚠ N earlier weeks missing: [list] — offer a computed draft, never back-fill silently]

🎯 NEXT WEEK PRIORITIES:
  1. [highest value action]
  2. [second priority]
  3. [third priority]
```

## Rules
- No full-body `/export`/`/knowledge`/`/intel`/`/people` fetches. Use `?since=` + `?fields=`.
- If Charlie says "run the audit too" / "/weekly --audit", chain into `/audit` after Step 8.
- Reflection is once per week, keyed by `week_of` (Monday). Never write a second row — PATCH `/reflections/:id` to revise. The Friday cron drafts it; `/weekly` confirms it.
- A missing reflection week is a reported failure, not a silent skip. If `/reflections/health` shows a gap, it goes in the output.
