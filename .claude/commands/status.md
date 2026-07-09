---
description: 10-second status pulse — counts only, no analysis
---

Quick status pulse. Compact, phone-readable. No analysis, no recommendations.

## Execute

Use `EATON_API` + `EATON_TOKEN` from CLAUDE.md.

- `GET /pulse` — one call returns `stats`, `overdue_top` (3), `blockers` (5).

Everything below comes out of that single response: counts from `stats`, top overdue from `overdue_top`, blockers from `blockers`. No separate `/stats` or `/tasks` calls.

Fallback (only if `/pulse` 404s — Worker pre-v3.7.0): `GET /stats` + `GET /tasks?status=todo&ownership=mine` + `GET /tasks?waiting_on=any&status=todo`.

## Output
```
STATUS — [Date, Time]

Open: [X] mine / [Y] fyi / [Z] total
Overdue: [X]  |  Due soon: [X]  |  Blocked: [X]

BY PERIOD:
  This week: [X]  |  30-day: [X]  |  60-day: [X]  |  90-day: [X]

WSRA: [X]/21 complete
Knowledge captured: [X] total ([Y] this week)
People intel entries: [X]
Leadership moves (this month): [X]

TOP 3 OVERDUE:
  1. [title] — due [date]
  2. [title] — due [date]
  3. [title] — due [date]

TOP BLOCKERS:
  → [task] waiting on [who/what]
```

## Rules
- 10-second read. No analysis, no coaching.
- Clean board = "Clean board" + just the counts.
- Don't offer to do anything after. Just show the numbers.
