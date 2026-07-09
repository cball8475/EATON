---
description: Per-conversation session close — D1 deltas, push, lessons, scoreboard sync
---

Session close. Run at end of each conversation. Every session gets its own close.

## Setup
Use `EATON_API` + `EATON_TOKEN` from CLAUDE.md. Set `TODAY` = today's date (YYYY-MM-DD).

## Step 1: Pull today's D1 deltas (deterministic — works even after compaction)

- `GET /tasks?since={TODAY}&fields=id,title,status,ownership,priority,created_at` — tasks created today
- `GET /tasks?completed_since={TODAY}&fields=id,title,completed_at,priority` — tasks completed today
- `GET /knowledge?since={TODAY}&fields=id,category,area,subject,source_label` — knowledge captured today
- `GET /intel?since={TODAY}&fields=person_name,intel_type,source_label,created_at` — intel captured today
- `GET /moves?since={TODAY}` — leadership moves today

This is the **authoritative** view of what happened today. Conversation history is supplementary — if it's been a long session and earlier turns are compacted out, the D1 deltas above still show the full day accurately.

## Step 2: Scan THIS conversation for in-flight items NOT yet pushed
Look only for things mentioned in conversation that should land in D1 but didn't (tasks discussed but not POSTed, knowledge captured verbally but not saved, intel observed but not recorded). Don't try to reconstruct items that ALREADY appear in Step 1's D1 deltas — those are confirmed shipped.

**If conversation context appears compacted or truncated:** say so explicitly. "Earlier turns compacted — closing from D1 deltas only. If anything else was discussed today that should land in D1, paste it now."

## Step 3: Push the in-flight items (with approval)
Present everything from Step 2 for review. Then push:

- New tasks: `POST /tasks` with body `{"title":"...", ...}`
- Status changes: `PATCH /tasks/{id}` with body `{"status":"done"}`
- Knowledge: `POST /knowledge` with body `{"category":"...","area":"...","subject":"...","detail":"...","source_label":"..."}`
- Intel: `POST /intel` with body `{"person_name":"...","intel_type":"...","content":"...","source_label":"..."}`

**Required fields:**
- Knowledge: category, area, subject, detail, source_label. Decisions use category `decision`.
- Intel: person_name, intel_type, content, source_label.

## Step 4: Lessons check
Scan THIS conversation for dead ends, silent failures, wrong assumptions, process gaps. If any, push as knowledge (`category: lesson, area: workflow`). Present for review first. If nothing went wrong, skip silently.

## Step 5: Output

```
SESSION CLOSE — [Date]

✓ DONE TODAY (from D1 deltas):
  → [X tasks completed today, top 3-5 by impact]

📝 SHIPPED TO D1 TODAY:
  → [X] new tasks
  → [X] knowledge entries
  → [X] intel entries
  → [X] leadership moves

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
- If conversation history is compacted, say so. Don't fabricate a recap from thin context.
- Never push to D1 in Step 3 without showing Charlie what's changing.
- Clean session = "Clean session — D1 shows N tasks done, M knowledge, K intel. Nothing in-flight." Skip the rest.
- No log files, no .md updates. D1 is sole system of record.
