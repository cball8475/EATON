Post-meeting debrief. Arguments: $ARGUMENTS (optional — "Kate", "yesterday", a transcript id, or empty for the most recent unprocessed transcript).

Transcripts live in D1 (`/transcripts`), not Otter. Otter is unreliable (empty bodies, wrong names, bad timestamps — see lessons) so it's an optional source of last resort, never the default path.

## Step 1: Get the transcript (D1-first)

Use `EATON_API` + `EATON_TOKEN` from Project Instructions.

Resolve the transcript in this order:

1. **Charlie pasted text in this message** → store it first, then process it:
   `POST /transcripts` with body `{"title":"<meeting/topic>","meeting_date":"YYYY-MM-DD","source":"paste","body":"<the full paste>"}`.
   Keep the returned `id` — that's the transcript you process and later mark processed.

2. **No paste** → pull from D1: `GET /transcripts?unprocessed=1&fields=id,title,meeting_date,source,created_at`.
   - If `$ARGUMENTS` is a number, fetch that one: `GET /transcripts/{id}`.
   - If `$ARGUMENTS` is a name/date, pick the matching unprocessed transcript.
   - Otherwise take the most recent unprocessed one.
   - If more than one is unprocessed and it's ambiguous, list them (id, title, date) and ask which.
   Then fetch the full text: `GET /transcripts/{id}` (the list omits the body).

3. **D1 has nothing unprocessed and Charlie wants to try Otter** → one Otter search, no retry (date format `YYYY/MM/DD`; T3 is always 8:15 AM; names frequently wrong). If it returns content, store it to D1 first — `POST /transcripts` with `source:"otter"` and `source_meeting_id` — then process that row. If Otter is empty, say: "Otter returned empty. Paste the transcript and I'll store + process it." Don't loop on Otter.

Whatever the source, you should now have a transcript **row id** and its body. Everything downstream links to it.

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

- **Tasks:** `POST /tasks` with `title`, `assignee_id`, `source_label`, `source_meeting_id`, `ai_extracted: true`, `ownership` (mine|fyi), `status` (todo|undated). FYI items: `undated` status + `fyi-context` tag. Use the transcript id as `source_meeting_id` when there's no Otter id (e.g. `transcript:{id}`), so provenance always traces back.
- **People:** `POST /people` — check for name variants before creating.
- **Intel:** `POST /intel` with `{"person_name":"...","intel_type":"...","content":"...","source_label":"...","source_meeting_id":"..."}`
- **Knowledge:** `POST /knowledge` with `{"category":"...","area":"...","subject":"...","detail":"...","people_involved":"...","source_label":"...","source_meeting_id":"..."}`

Every task MUST carry `source_label` and `source_meeting_id`. No orphan tasks.

## Step 5: Mark the transcript processed
After the push succeeds: `PATCH /transcripts/{id}` with `{"processed":1}` (stamps `processed_at`). This is what keeps it out of the `/morning` "unprocessed meetings" flag — a debrief isn't done until its transcript is marked processed.

## Step 6: Confirm results
Report: transcript id marked processed, tasks created (IDs + titles), people created/updated, intel entries (count by person), knowledge entries (count by category).
