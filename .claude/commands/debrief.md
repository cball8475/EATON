---
description: Process a meeting transcript into tasks, intel, knowledge + a strategic read; push to D1 on approval.
---

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

## Step 2: Extract — every item carries its evidence

**The rule that makes review possible: no claim without its quote.** A paraphrase alone is unreviewable — checking it means re-listening to the meeting. Every extracted item must carry:

- `claim` — the record as it would land in D1
- `ev` — the verbatim transcript line(s) it came from, speaker label included, **unedited**. Mark Otter mistranscriptions inline in `[brackets]` rather than silently correcting them; the mangling is itself information (2026-05-12: names are frequently wrong).
- `src` — meeting label, timestamp, and **how the speaker was identified**: `speaker labeled by Otter` / `speaker inferred from context` / `no speaker labels in this transcript` / `derived from Otter's summary, no transcript`
- proposed field values per the enums in Step 4

If a transcript is too large to fetch in full, say so explicitly on every item derived from it. Summary-derived items are a paraphrase of a paraphrase and belong in tier 3 regardless of how plausible they read.

### Triage by action needed, not by topic

Sort every item into one of three tiers. This is the thing that keeps the review to three minutes — Charlie's attention goes to tier 1, and the other two are skim-or-ignore.

- **Tier 1 — needs Charlie's call.** Contested ownership, unconfirmed names or numbers, a claim that contradicts itself, or intel that is sensitive (unflattering, about his manager, or touching a live comp case). Default-open in the review page.
- **Tier 2 — push unless he objects.** Backed by a transcript line with clear enough attribution.
- **Tier 3 — hold unless he says otherwise.** Already completed inside the meeting, self-contradicting, or summary-derived.

**Silence is a decision, and it must fail safe:** untouched tier 2 gets pushed; untouched tier 1 and tier 3 do not. State this on the page so an unread section can never cause a bad write.

### Also extract, same evidence rule

- **Metrics & goals** — numbers, KPIs, deadlines, My Five / TalentHub triggers. Safety numbers spoken aloud in a meeting are **never** scoreboard truth; note them and reconcile against `GET /scoreboard`.
- **Leadership moves** — influence, alignment shifts, resource asks.
- **Deliberately not extracted** — a visible list of what was dropped and why: hearsay about a person, speculation touching an open comp case, personal/non-Eaton content. Judgment calls Charlie can overrule beat silent omissions.

## Step 3: Publish the review page, do NOT push

Build the extraction as a JSON array and render it as an Artifact — a tap-through review, not a wall of prose. Charlie reads this on a phone between meetings.

Requirements:
- Claims in sans, **verbatim evidence in monospace** — the typographic split is the information design
- Confidence flag + source-attribution line on every card
- Per-item controls: Keep / Make FYI / Make mine / Drop, plus a free-text correction field
- Decisions persisted to `localStorage` so progress survives a closed tab
- A copy button emitting the decision block below
- **Never put the bearer token in the page.** It is a published web page; the page cannot write to D1. (2026-07-29 — a committed bearer stayed live in git history and had to be rotated.)

Decision block format to parse back:
```
#debrief YYYY-MM-DD decisions
keep: T-04, K-01, K-09
fyi: T-01
mine: T-08
drop: T-03, I-03
no answer: K-21, K-22
notes:
  I-01: name is Saquan not Saquon
  K-08: third incident was a laceration, not amputation
```

Then present the four or five items genuinely worth his attention in the reply — the ones where a wrong answer costs something — and stop. Do not restate the whole extraction in prose; that's what the page is for.

### Strategic debrief (in the reply, not the page)
- **Hidden risks:** discussed but nobody fully appreciates yet
- **Power dynamics:** who gained/lost influence; alignment shifts
- **Unowned problems:** gaps Charlie could step into
- **48-hour highest-value action:** most valuable, not most urgent
- **Blind spots:** questions Charlie should have asked
- **Citation log moments:** data framed in Eaton high-performer language

### TOP — Floor Action Items (Charlie reads this walking out)
2-3 specific things to go look at, verify, or talk to someone about on the floor. Include who to talk to and what to ask. Lead the reply with these.

## Step 4: Push to D1 (only after the decision block comes back)

Apply decisions first: `drop` items are discarded, `fyi`/`mine` override the proposed ownership, `notes` override the proposed field values, untouched tier-2 pushes as proposed, untouched tier-1 and tier-3 are left alone.
```bash
eaton /tasks -X POST -H 'Content-Type: application/json' -d '{"title":"...","assignee_id":26,"source_label":"...","source_meeting_id":"<otter id>","ai_extracted":true,"ownership":"mine","status":"todo"}' | jq .
eaton /people -X POST -H 'Content-Type: application/json' -d '{"name":"..."}' | jq .          # check name variants first
eaton /intel -X POST -H 'Content-Type: application/json' -d '{"person_name":"...","intel_type":"...","content":"...","source_label":"...","source_meeting_id":"..."}' | jq .
eaton /knowledge -X POST -H 'Content-Type: application/json' -d '{"category":"...","area":"...","subject":"...","detail":"...","people_involved":"...","source_label":"...","source_meeting_id":"..."}' | jq .
```
FYI items: use `undated` status and `fyi-context` tag. Every task MUST include `source_label` and `source_meeting_id`. No orphan tasks.

## Step 5: Confirm push results
Report: tasks created (IDs + titles), people created/updated, intel entries (count by person), knowledge entries (count by category).
