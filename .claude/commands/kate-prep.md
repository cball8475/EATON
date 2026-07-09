---
description: Data-driven Kate 1-on-1 prep (14-day delta)
---

Kate 1-on-1 prep. Data-driven, Kate-specific. NOT the generic 1-on-1 coach artifact.

## Setup
Compute `SINCE` = 14 days before today (format YYYY-MM-DD). Use `EATON_API` + `EATON_TOKEN` from CLAUDE.md.

## Step 1: Pull current state (since-filtered — only the delta since last 1-on-1)

- `GET /tasks?ownership=mine&status=todo`
- `GET /tasks?status=done&since={SINCE}`
- `GET /moves?since={SINCE}`

## Step 2: Pull Kate-specific context

- `GET /knowledge?q=Kate`
- `GET /intel?person_name=Kate`

Use this to identify knowledge gaps, frame questions around what Kate has shared, avoid re-asking captured topics. Do NOT pull `/intel` full body — `?person_name=Kate` is the only Kate-related intel that matters here.

## Step 3: Build the prep doc

```
KATE 1-ON-1 PREP — [Date]

SINCE LAST MEETING:
  ✓ Completed: [tasks closed since last 1-on-1]
  → In progress: [active items with status]
  🚧 Blocked on Kate: [items waiting on her]

WHAT TO LEAD WITH:
  → [Single most impressive thing Charlie did — frame in Eaton high-performer language]

QUESTIONS TO ASK:
  1. [Specific, context-aware — not generic]
  2. [About a gap or upcoming event]
  3. [Transition-related if appropriate]

VISIBILITY MOVE:
  → [One natural way to make work visible without performing]

CLOSE THE LOOP ON:
  → [Unresolved item from previous meeting]

TRIBAL KNOWLEDGE TO EXTRACT:
  → [1-2 things Kate knows that aren't in /knowledge yet — frame as natural questions]

WATCH FOR:
  → [Political read or timing consideration]

CITATION LOG CANDIDATES:
  → [1-2 statements from this week that could go in a performance review]
```

## Rules
- Every question connects to something real — a task, project, gap, timeline.
- The "lead with" item should be something Kate can repeat upward to Laura.
- If Kate has upcoming travel, flag coverage gaps.
- Short enough to glance at on the phone walking to Kate's office.
