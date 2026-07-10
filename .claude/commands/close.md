---
description: End-of-session wrap — reconcile today's D1 deltas, catch unpushed items, capture lessons, push on approval.
---

Session close. Run at end of each conversation. Every session gets its own close.

## Setup
```bash
source infra/env.sh   # EATON_API + EATON_TOKEN + `eaton` helper
TODAY=$(date +%Y-%m-%d)
```

## Step 1: Pull today's D1 deltas (deterministic — works even after compaction)
```bash
eaton "/tasks?since=$TODAY&fields=id,title,status,ownership,priority,created_at" | jq .   # created today
eaton "/tasks?completed_since=$TODAY&fields=id,title,completed_at,priority" | jq .        # completed today
eaton "/knowledge?since=$TODAY&fields=id,category,area,subject,source_label" | jq .        # knowledge today
eaton "/intel?since=$TODAY&fields=person_name,intel_type,source_label,created_at" | jq .   # intel today
eaton "/moves?since=$TODAY" | jq .                                                         # moves today
```
This is the **authoritative** view of what happened today. Conversation history is supplementary — if earlier turns are compacted out, the D1 deltas still show the full day.

## Step 2: Scan THIS conversation for in-flight items NOT yet pushed
Only things mentioned in conversation that should land in D1 but didn't (tasks discussed but not POSTed, knowledge captured verbally, intel observed but not recorded). Don't reconstruct items that ALREADY appear in Step 1's deltas — those are confirmed shipped.

**If context appears compacted/truncated:** say so explicitly. "Earlier turns compacted — closing from D1 deltas only. If anything else was discussed today that should land in D1, paste it now."

## Step 3: Push the in-flight items (with approval)
Present everything from Step 2 for review. Then push:
```bash
eaton /tasks -X POST -H 'Content-Type: application/json' -d '{"title":"...","ownership":"mine","status":"todo","priority":"Medium"}' | jq .
eaton /tasks/<id> -X PATCH -H 'Content-Type: application/json' -d '{"status":"done"}' | jq .
eaton /knowledge -X POST -H 'Content-Type: application/json' -d '{"category":"...","area":"...","subject":"...","detail":"...","source_label":"..."}' | jq .
eaton /intel -X POST -H 'Content-Type: application/json' -d '{"person_name":"...","intel_type":"...","content":"...","source_label":"..."}' | jq .
```
**Required fields:** Knowledge → category, area, subject, detail, source_label (decisions use category `decision`). Intel → person_name, intel_type, content, source_label.

## Step 4: Lessons check
Scan THIS conversation for dead ends, silent failures, wrong assumptions, process gaps. If any, push as knowledge (`category: lesson, area: workflow`) — present for review first. If nothing went wrong, skip silently.

## Step 5: Output
```
SESSION CLOSE — [Date]

✓ DONE TODAY (from D1 deltas):
  → [tasks completed today, top 3-5 by impact]

📝 SHIPPED TO D1 TODAY:
  → [X] new tasks · [X] knowledge · [X] intel · [X] moves

→ JUST PUSHED (Step 3):
  → [items pushed in this close — IDs + titles]

⚠ CARRIES FORWARD:
  → [unresolved items with next step]

⚠ LESSONS CAPTURED:
  → [one-liner per entry, or "None today"]

⚡ NEXT:
  → [1-2 things to hit first tomorrow morning]
```

## Rules
- D1 is the source of truth for "what happened today." Don't argue with it.
- If history is compacted, say so. Don't fabricate a recap from thin context.
- Never push in Step 3 without showing Charlie what's changing.
- Clean session = "Clean session — D1 shows N done, M knowledge, K intel. Nothing in-flight." Skip the rest.
- No log files, no .md updates. D1 is sole system of record.
