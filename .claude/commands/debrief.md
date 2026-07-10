---
description: Post-meeting debrief - list unprocessed meetings, or extract + log a meeting to D1
argument-hint: "[list | today | <otter-meeting-id-or-title>]"
---

# /debrief

Charlie's post-meeting debrief workflow. Two modes: **list** what hasn't been
processed, and **process** a specific meeting (or everything from today).

## Data sources
- **Otter.ai** (MCP) - meeting transcripts. `search` to list, `fetch <id>` for a
  full transcript. Otter is unreliable; if a fetch fails, ask Charlie to paste.
- **D1** - system of record for `tasks`, `people_intel`, `knowledge`.
  Worker API `https://eaton-ehs-api.cball8475.workers.dev`, or the Cloudflare D1
  MCP against database `62ce85d7-0cc1-4832-aa57-d5b09ceaa132`.

A meeting is **processed** when its Otter meeting ID appears in `source_meeting_id`
on any row in `tasks`, `people_intel`, or `knowledge`.

## Mode 1 - list unprocessed  (`/debrief list`)
1. Pull recent Otter meetings (default: last ~14 days) via Otter `search`.
2. Pull the set of already-processed IDs from D1:
   ```sql
   SELECT DISTINCT source_meeting_id FROM tasks        WHERE source_meeting_id <> ''
   UNION SELECT DISTINCT source_meeting_id FROM people_intel WHERE source_meeting_id <> ''
   UNION SELECT DISTINCT source_meeting_id FROM knowledge   WHERE source_meeting_id <> '';
   ```
3. Unprocessed = Otter meetings whose ID is NOT in that set. List title / date /
   duration. Ignore sub-60s junk "Note" clips (no content).

## Mode 2 - process  (`/debrief today`, or `/debrief <id|title>`)
`today` = every unprocessed meeting with today's date. For each target meeting,
`fetch` the transcript and run the full protocol in `ref/debrief-protocol.md`:
1. **Tasks** - every action item that is Charlie's: title, description, priority,
   suggested due date, others involved. Separate real tasks from FYI/context.
2. **People intel** - new or updated people, political dynamics, and injury /
   accommodation cases.
3. **Metrics & goals** - numbers, KPIs, deadlines; note conflicts with tracked
   EHS metrics or the scoreboard.
4. **Project memory** - significant new operational context; correct anything
   now outdated.
5. **Strategic debrief** - the coach-style questions in the protocol.
6. **Floor action items** - 2-3 things to go check / verify on the floor.

### Push rules (hard)
- **Present the extracted data for review first. Push only after Charlie's
  explicit approval.** (CLAUDE.md debrief discipline - never auto-push.)
- On approval, write to D1 stamping every row so the meeting counts as processed:
  - `assignee_id = 26` (Charlie), `ownership = 'mine'` (or `'fyi'` for context).
  - `source_meeting_id = <otter id>`, `source_label = '<title> <date>'`,
    `source = 'debrief'`, `ai_extracted = 1`.
  - Use the CLAUDE.md field values for `status`, `target_period`, `priority`,
    `category`, `area`.
- Stay close to the transcript. Flag attribution uncertainty. Keep unverified
  hearsay out of the record.
