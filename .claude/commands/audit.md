---
description: Heavy semantic + drift audit (every 21-30 days)
---

Full semantic audit + drift scan. Heavy data fetch — only run on demand, not weekly. Target cadence: every 21–30 days, or when something feels off.

## Step 1: Pull full bodies (only here, not in /morning or /weekly)

Use `EATON_API` + `EATON_TOKEN` from CLAUDE.md.

- `GET /knowledge`
- `GET /intel`
- `GET /people?fields=id,name,department,area`
- `GET /tasks?waiting_on=any`
- `GET /tasks?status=todo`

This is the only command that should ever fetch `/knowledge` and `/intel` full bodies. Everything else uses `?since=` + `?fields=`.

## Step 2: Semantic checks

**Knowledge contradictions** — same `subject`, conflicting `detail`. Newer entry presumed correct. Flag the older one for archive.

**Intel conflicts** — same `person_name`, conflicting entries within the same `intel_type` (e.g., two `reliability` entries that say opposite things). Newer wins.

**Orphaned references** — for every open task with `waiting_on` set, check that the name appears in the people list. Flag mismatches. Also flag tasks with `ai_extracted=true` that have **both** null `source_meeting_id` **and** null `source_label` — those are truly untraceable. Do NOT flag a task that has a `source_label` but null `source_meeting_id`: Otter routinely returns empty meeting IDs, and the label preserves provenance. (Today that true-orphan count is 0; the old check flagged ~29 false positives.)

**Duplicates** — same `subject`+`area` in knowledge with overlapping `detail`. Same person represented under multiple name variants in people (e.g., "Gloria" vs "Gloria Carter").

## Step 3: Drift checks

**Stale knowledge** — knowledge entries older than 30 days with no newer entry on the same subject. Could be stale facts.

**Cold relationships** — key people (Kate, Laura, Gloria, all shift supervisors per CLAUDE.md roster) with no intel entry in 21+ days.

**Skill drift** — scan `skill-*.md` files in the project for references to deleted files (`kb-tribal-knowledge`, `kb-people-intel`, etc.), removed endpoints, stale field names. Flag any found.

## Step 4: Output — severity tagged

```
AUDIT — [Date]

🔴 CONTRADICTIONS / CONFLICTS:
  → [knowledge or intel entries that disagree — show both with IDs and dates]

🟡 STALE / DRIFT:
  → [stale knowledge, cold key relationships, skill file references to dead things]

🔵 CLEANUP:
  → [duplicates, name variants, orphaned references, ai_extracted with no source_meeting_id AND no source_label]

✓ HEALTHY:
  → [one-liner counts: knowledge OK / intel OK / orphans 0 / etc.]
```

Wait for Charlie's review before acting on any finding. Don't auto-delete or auto-merge.

## Step 5: Record the audit baseline
After Charlie reviews (regardless of whether findings are acted on):

`POST /knowledge` with body:
```json
{
  "category": "metric",
  "area": "workflow",
  "subject": "audit-baseline-YYYY-MM-DD",
  "detail": "[N] contradictions, [N] drift, [N] cleanup. Acted: [summary]",
  "source_label": "/audit run YYYY-MM-DD"
}
```

This is what `/weekly` checks to decide whether to nag.

## Rules
- Never auto-act on findings. Always present, wait for approval, then push fixes.
- The audit-baseline knowledge entry MUST be written even if nothing was changed — it's the cadence marker.
- If `/audit` is run twice in the same week, that's fine. The most recent baseline wins.
- Findings should reference IDs (`knowledge #142`, `intel #67`, `task #289`) so Charlie can act precisely.
