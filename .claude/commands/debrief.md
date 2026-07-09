---
description: Post-meeting debrief from Otter transcript — review before push
argument-hint: [Kate | yesterday | empty]
---

Post-meeting debrief. Arguments: $ARGUMENTS (optional — "Kate", "yesterday", or empty for most recent).

## Step 1: Get the transcript

**If no arguments or just a name:** Search Otter.ai for today's meetings. If a name is provided, use it as search query. Fetch the most recent match.

**If "yesterday":** Search with yesterday's date range.

**If Otter returns empty:** Say "Otter returned empty. Paste the transcript and I'll process it." Don't retry — manual paste is the established fallback.

**If Charlie pastes a transcript directly:** Skip Otter. Process what's pasted.

**Otter date format:** `YYYY/MM/DD`. T3 is always 8:15 AM regardless of Otter timestamps. Names are frequently wrong — always confirm with Charlie.

## Step 2: Process — Output in this exact order

### TOP — Floor Action Items (Charlie reads this walking out)
2-3 specific things to go look at, verify, or talk to someone about on the plant floor. Include who to talk to and what to ask.

### Tasks Extracted
For each action item: title, description, priority, suggested due date, who's involved, ownership (`mine` or `fyi`).
**CRITICAL:** Don't over-assign. If the transcript mentions something without explicitly directing Charlie to own it, default to FYI, not mine. Flag ambiguity.

### People Intel
New people → prepare D1 records. Updated intel → prepare PATCH. Relationship/political intel → prepare `/intel` POST.

### Knowledge Captured
Extract institutional/tribal knowledge, vendor info, process details, policy clarifications. For each:
- category, area, subject, detail, people_involved, source_label, source_meeting_id

### Metrics & Goals
Numbers, KPIs, targets, deadlines. Conflicts with existing metrics. My Five or TalentHub triggers.

### BOTTOM — Strategic Debrief (Charlie reads sitting down)
- **Hidden risks:** What was discussed that nobody fully appreciates yet?
- **Power dynamics:** Who gained or lost influence? Alignment shifts?
- **Unowned problems:** Gaps Charlie could step into
- **48-hour highest-value action:** Not most urgent — most valuable
- **Blind spots:** Questions Charlie should have asked
- **Citation log moments:** Data nuggets framed in Eaton high-performer language

## Step 3: Present for review
Show the complete debrief. Do NOT push anything to D1 yet. Wait for explicit approval. Charlie will correct names, remove done items, adjust ownership/priority.

## Step 4: Push to D1 (only after approval)

Use `EATON_API` + `EATON_TOKEN` from CLAUDE.md.

- **Tasks:** `POST /tasks` with body including `title`, `assignee_id`, `source_label`, `source_meeting_id` (Otter ID), `ai_extracted: true`, `ownership` (mine|fyi), `status` (todo|undated). FYI items: use `undated` status and `fyi-context` tag.
- **People:** `POST /people` — check for name variants before creating.
- **Intel:** `POST /intel` with body `{"person_name":"...","intel_type":"...","content":"...","source_label":"...","source_meeting_id":"..."}`
- **Knowledge:** `POST /knowledge` with body `{"category":"...","area":"...","subject":"...","detail":"...","people_involved":"...","source_label":"...","source_meeting_id":"..."}`

Every task MUST include `source_label` and `source_meeting_id`. No orphan tasks.

## Step 5: Confirm push results
Report: tasks created (IDs + titles), people created/updated, intel entries (count by person), knowledge entries (count by category).
