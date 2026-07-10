Kate 1-on-1 prep. Data-driven, Kate-specific. NOT the generic 1-on-1 coach artifact.

## Setup
```bash
source infra/env.sh   # EATON_API + EATON_TOKEN + `eaton` helper
SINCE=$(date --date='14 days ago' +%Y-%m-%d)
```

## Step 1: Pull current state (since-filtered — only the delta since last 1-on-1)
```bash
eaton "/tasks?ownership=mine&status=todo" | jq .
eaton "/tasks?status=done&since=$SINCE" | jq .
eaton "/moves?since=$SINCE" | jq .
```

## Step 2: Pull Kate-specific context
```bash
eaton "/knowledge?q=Kate" | jq .
eaton "/intel?person_name=Kate" | jq .
```
Use to identify knowledge gaps, frame questions around what Kate has shared, avoid re-asking captured topics. Do NOT pull `/intel` full body — `?person_name=Kate` is the only Kate-related intel that matters here.

## Step 3: Build the prep doc
```
KATE 1-ON-1 PREP — [Date]

SINCE LAST MEETING:
  ✓ Completed: [tasks closed since last 1-on-1]
  → In progress: [active items with status]
  🚧 Blocked on Kate: [items waiting on her]

WHAT TO LEAD WITH:
  → [Single most impressive thing Charlie did — Eaton high-performer language]

QUESTIONS TO ASK:
  1. [Specific, context-aware — not generic]
  2. [About a gap or upcoming event]
  3. [Transition-related if appropriate]

VISIBILITY MOVE:
  → [One natural way to make work visible without performing]

CLOSE THE LOOP ON:
  → [Unresolved item from previous meeting]

TRIBAL KNOWLEDGE TO EXTRACT:
  → [1-2 things Kate knows that aren't in /knowledge yet — natural questions]

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
