Post-meeting debrief. Arguments: $ARGUMENTS (optional — "Kate", "yesterday", or empty for most recent).

## Setup
```bash
source infra/env.sh   # EATON_API + EATON_TOKEN + `eaton` helper (used in Step 4)
```

## Step 1: Get the transcript
**No arguments / just a name:** Search Otter.ai for today's meetings. If a name is given, use it as the query. Fetch the most recent match.
**"yesterday":** Search with yesterday's date range.
**Otter returns empty:** Say "Otter returned empty. Paste the transcript and I'll process it." Don't retry — manual paste is the established fallback.
**Charlie pastes a transcript directly:** Skip Otter. Process what's pasted.

Otter date format: `YYYY/MM/DD`. T3 is always 8:15 AM regardless of Otter timestamps. Names are frequently wrong — always confirm with Charlie.

## Step 2: Process — output in this exact order

### TOP — Floor Action Items (Charlie reads this walking out)
2-3 specific things to go look at, verify, or talk to someone about on the floor. Include who to talk to and what to ask.

### Tasks Extracted
For each: title, description, priority, suggested due date, who's involved, ownership (`mine`/`fyi`).
**CRITICAL:** Don't over-assign. If the transcript mentions something without explicitly directing Charlie to own it, default to FYI, not mine. Flag ambiguity.

### People Intel
New people → prepare D1 records. Updated intel → prepare PATCH. Relationship/political intel → prepare `/intel` POST.

### Knowledge Captured
Institutional/tribal knowledge, vendor info, process details, policy clarifications. For each: category, area, subject, detail, people_involved, source_label, source_meeting_id.

### Metrics & Goals
Numbers, KPIs, targets, deadlines. Conflicts with existing metrics. My Five / TalentHub triggers.

### BOTTOM — Strategic Debrief (Charlie reads sitting down)
- **Hidden risks:** discussed but nobody fully appreciates yet
- **Power dynamics:** who gained/lost influence; alignment shifts
- **Unowned problems:** gaps Charlie could step into
- **48-hour highest-value action:** most valuable, not most urgent
- **Blind spots:** questions Charlie should have asked
- **Citation log moments:** data framed in Eaton high-performer language

## Step 3: Present for review
Show the complete debrief. Do NOT push anything to D1 yet. Wait for explicit approval — Charlie will correct names, remove done items, adjust ownership/priority.

## Step 4: Push to D1 (only after approval)
```bash
eaton /tasks -X POST -H 'Content-Type: application/json' -d '{"title":"...","assignee_id":26,"source_label":"...","source_meeting_id":"<otter id>","ai_extracted":true,"ownership":"mine","status":"todo"}' | jq .
eaton /people -X POST -H 'Content-Type: application/json' -d '{"name":"..."}' | jq .          # check name variants first
eaton /intel -X POST -H 'Content-Type: application/json' -d '{"person_name":"...","intel_type":"...","content":"...","source_label":"...","source_meeting_id":"..."}' | jq .
eaton /knowledge -X POST -H 'Content-Type: application/json' -d '{"category":"...","area":"...","subject":"...","detail":"...","people_involved":"...","source_label":"...","source_meeting_id":"..."}' | jq .
```
FYI items: use `undated` status and `fyi-context` tag. Every task MUST include `source_label` and `source_meeting_id`. No orphan tasks.

## Step 5: Confirm push results
Report: tasks created (IDs + titles), people created/updated, intel entries (count by person), knowledge entries (count by category).
