---
description: Root cause analysis for a Sumter incident — builds the 8D against Eaton's corporate protocol, checks whether prior controls already failed, and drafts corrective actions with owners and validation. Push to D1 on approval.
---

Incident RCA / 8D. Arguments: $ARGUMENTS (incident description, knowledge ID, task ID, or empty — if empty, ask which incident).

## Setup
```bash
source infra/env.sh   # EATON_API + EATON_TOKEN + `eaton` helper
```

## Step 0: Classify and start the clock

Ask or confirm before anything else — the classification sets the deadlines and the audience.

| Classification | What it triggers |
|---|---|
| OSHA severe (amputation, eye loss, in-patient hospitalization) | Report within 24h of notification |
| Recordable | Plant manager (not EHS) emails corporate within 24h → first corporate call within 48h → 8D root cause + actions complete at the 7-day meeting |
| First aid | Site investigation, no corporate clock. Still gets an 8D if the mechanism has repeated |
| Near miss / property damage | Investigate at the same depth if the potential outcome was severe |

Rules that bite here:
- **PRISM is upstream truth. MESH lags it.** Never infer a classification change from the MESH dashboard (#556). Classification flips first-aid → recordable are a manual in-system action, not automatic (#424).
- Don't accept a soft classification to keep the number down, and don't inflate one either. Charlie has rejected a near-miss label on a case that was a first aid (#455).
- **Containment must be validated in person before the first corporate call** — walked and seen, not documented (#313).
- **Check that the containment didn't create a new hazard.** New pinch points, new fall heights, new blocked egress (#313, #599).

## Step 1: Pull the record before writing anything

```bash
eaton "/search?q=<machine|area|mechanism>&mode=hybrid" | jq '{knowledge:[.knowledge[]|{id,subject}], tasks:[.tasks[]|{id,title,status}]}'
eaton "/knowledge?category=incident&area=<area>" | jq '[.[]|{id,subject,created_at}]'
```

Three questions the search has to answer:

1. **Has this mechanism happened here before?** Same mechanism, not same machine — the press-brake events span PB14, PB27, and PB19 and are one pattern (#455, #509).
2. **What were the corrective actions last time, and did they close?** Pull the prior 8D's D5 and D6. On the 2025 PB27 amputation both were left blank, no per-action owner, and the actions that "closed" on the alert slide were the exact controls that failed in the 6/26 pinch (#460, #494). An action with no owner and no validation date did not happen.
3. **Is the interval compressing?** Two years, then one year, then months is a stronger argument for capital than raw count (#590).

If the same mechanism recurred after a prior 8D, **say so in D2 and treat the prior 8D's failure as part of the problem statement.** A repeat event with a clean prior 8D means the 8D was wrong, not that the operator was.

## Step 2: Facts before causes

Build a timeline: what was being done, what the person was reaching for or moving, what the equipment did, what happened after. Mark every line **observed**, **reported**, or **assumed**. Assumed lines do not feed causes until someone confirms them.

- **No scene recreation. No stepping over the hazard to produce video.** Charlie's standing directive, 8/6/2026 — anyone attempting it gets sent home, because an investigation that generates its own recordable has failed (#598).
- Staged footage reads as caught violation one level up. If video exists, establish who asked for it and why before it becomes evidence (#585).
- Interview for the **why**, not the admission. "Why does the step-over happen" produced the method change; "who stepped over" would have produced discipline.
- Capture the equipment number. A press "one of the oldest" is not a record (#596).

## Step 3: Cause analysis

Run 5-whys down each branch of the timeline, not one chain from the injury. Stop when the next why leaves Charlie's control, not when it reaches the person.

**Corporate rejects training and administrative controls as primary root cause and sends the 8D back** (#304, #313). If a why-chain terminates at "operator was not trained" or "operator did not follow the method sheet", it is not finished. Keep going:

- Was the method sheet correct for this part and this machine? Steel kitting ran the same sheet as copper (#553).
- Did the current revision ever reach the floor? A sheet submitted to Kate and never published to MQ1 is a document that operators never saw (#371).
- Was the guarding in the right mode for this operation, and does the daily checklist cover it (#459)?
- Was the equipment behaving as designed? An uncommanded ram descent means the hazard is energised independent of the hand (#596).
- Was there a place to put the material, a tool to reach it with, a path that didn't cross the hazard?
- Did the standard work assume one person for a two-person load (#593)?

Name the management-system gap explicitly. The reel laceration 8D landed on three: at-risk behavior not corrected, equipment inadequate for the task, management-system gaps (#364). That is the shape to aim for.

**Ask whether this is a class of hazard rather than one location.** Capped floor pipes at B3 tripped one employee and the same capped holes exist plant-wide (#559). If it's a class, the corrective action is a sweep, not a patch.

## Step 4: Corrective actions

Order them by the hierarchy of controls, and state the order out loud in the 8D. Charlie's sequence: **method change first, engineering second, PPE and training last.** Reject a control that moves the hazard rather than removing it — a barrier across the conveyor aisle raises the height somebody falls from (#599).

Every action needs four fields or it does not go in:

| Field | Why |
|---|---|
| Owner (a named person, not a department) | The 2025 8D's actions had none and none were validated (#460) |
| Due date | |
| Validation method (D6) — how we will know it worked | Blank D6 is how a closed 8D fails a year later |
| Verification date | Not the completion date. The date somebody goes back and looks |

Standard actions worth proposing every time:
- **Focused gemba of the same scenario across the department** as a standard CAPA — Charlie's proposal on record 7/20 to close the policy gap where incident management covers only how to fill out the report (#529).
- **Method sheet + WSRA review for the machine or task**, since the two double-dip (#553).
- **Lessons-learned sheet** posted at the point of use, laminated, with a signature record. Confirm it actually prints — the 8/5 sheet would not print for Charlie or for Gloria (#590).

Flag anything that is not a valid engineering control. AI cameras are not safety-rated and do not count as a corrective action (#456).

## Step 5: Present for review

Output in this order. Do NOT push to D1 yet.

1. **Classification + clocks** — what's due when, and to whom
2. **D1 team** — cross-functional, named. Prior 8D teams are a starting roster (#494)
3. **D2 problem statement** — including "this is the Nth event of this mechanism, prior 8D status: …"
4. **D3 interim containment** — plus what was checked to confirm containment created no new hazard
5. **D4 root cause** — the why-chains, management-system gaps named
6. **D5 permanent corrective actions** — the table from Step 4
7. **D6 validation plan** — per action
8. **D7 prevent recurrence** — what changes so the class of hazard is closed, not this instance
9. **Open questions** — what's still marked assumed, and who can confirm it
10. **The read** — where this argument is weak if Kate or corporate pushes back, and which facts carry it

Charlie corrects owners, dates, and classification here.

## Step 6: Push to D1 (only after approval)

```bash
# The incident record
eaton /knowledge -X POST -H 'Content-Type: application/json' -d '{
  "category":"incident","area":"<area>","subject":"<mechanism> — <date> (<person>)",
  "detail":"<timeline, classification, root cause, corrective actions with owners and validation>",
  "people_involved":"...","related_ids":"<prior same-mechanism incident IDs>","source_label":"RCA <date>"}' | jq .

# One task per corrective action — owner and validation date in the notes
eaton /tasks -X POST -H 'Content-Type: application/json' -d '{
  "title":"<action>","assignee_id":26,"ownership":"mine","status":"todo","priority":"High",
  "due_date":"YYYY-MM-DD","notes":"CAPA for incident #<id>. Owner: <name>. Validation: <method>, verify <date>.",
  "source_label":"RCA <date>"}' | jq .
```

Then **PATCH the prior incident entry's `related_ids`** so the chain reads in both directions, and check `has_conflicts` on the POST response — a same-subject entry usually means an earlier partial record exists and one of the two should be superseded, not left to compete.

## Failure modes this command exists to prevent

- An 8D with D5 and D6 blank, which is how the 2025 amputation's actions were never closed or validated
- A root cause that stops at the operator, which corporate sends back
- Corrective actions with no named owner
- A repeat event investigated as if it were the first
- Discipline-flavored actions driven by footage nobody sourced
- Containment that creates the next incident
