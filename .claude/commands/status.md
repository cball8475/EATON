---
description: 10-second status pulse — raw task counts, WSRA, top overdue and blockers. No analysis.
---

Quick status pulse. Compact, phone-readable. No analysis, no recommendations.

## Execute
```bash
source infra/env.sh   # EATON_API + EATON_TOKEN + `eaton` helper
eaton /stats | jq .
eaton "/tasks?status=todo&ownership=mine" | jq .
eaton "/tasks?waiting_on=any&status=todo" | jq .
```

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
