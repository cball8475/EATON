---
description: Split a raw floor dump, classify each item, review, push on confirm
argument-hint: [raw notes / voice-to-text]
---

One-verb floor capture. Charlie types `/capture` followed by raw notes or voice-to-text — often messy, run-on, mis-transcribed. Arguments: $ARGUMENTS (the dump to file).

The job: split the dump into discrete items, route each to the right D1 bucket, show the parse, push on one confirm. This replaces having to remember whether something is a `/tribal`, a task, or intel — `/capture` decides.

## Step 1: Split + classify
Break the input into separate items (one thought each). Tolerate filler, false starts, and transcription noise — don't make Charlie clean it up first. Classify each item as exactly one of:

- **task** — an action to do or track. Owns→`mine`, just-watching→`fyi`. → `POST /tasks`
- **knowledge** — institutional/tribal/process/vendor/policy fact worth keeping. → `POST /knowledge`
- **intel** — a read on a person (working style, reliability, political/relationship signal). → `POST /intel`
- **move** — a moment Charlie proactively led, influenced, created clarity, or took ownership. → `POST /moves`
- **noise** — greetings, filler, nothing to file. Drop it (note count only).

If an item could be two types, pick the primary and note the alt — don't create duplicates across buckets.

## Step 2: Draft each item with its real D1 body
Use the field values from CLAUDE.md. Distill — store the point, not the raw transcription.

- task → `{title, description?, priority(High|Medium|Low), ownership(mine|fyi), status(todo|undated), target_period?, due_date?, waiting_on?, source_label:"/capture YYYY-MM-DD"}`
- knowledge → `{category, area, subject, detail, people_involved?, source_label:"/capture YYYY-MM-DD"}`
- intel → `{person_name, intel_type, content, source_label:"/capture YYYY-MM-DD"}`
- move → `{description, category, context?, people_involved?, source_label:"/capture YYYY-MM-DD"}`

Only ask Charlie a question if something blocking is genuinely unclear (a person's name you can't resolve, or task ownership that flips mine/fyi). Otherwise pick sane defaults and flag them in the preview.

## Step 3: Present for review (one screen)
```
CAPTURE — [N] items ([noise] dropped)

📋 TASKS
  1. [title] — [priority], [mine/fyi], [target_period]
📚 KNOWLEDGE
  2. [subject] ([category]/[area])
👤 INTEL
  3. [person] — [intel_type]: [one-line]
★ MOVES
  4. [description] ([category])

⚠ NEEDS A CALL: [any ambiguous ownership / unresolved name, or omit]
```
Don't push yet. Wait for Charlie. He may merge, drop, re-type a name, or flip ownership.

## Step 4: Push on confirm
On "yes" / "push" / "go", POST each item to its endpoint. For intel, the API resolves `person_name`→`person_id` and returns `needs_link=true` when the name matched 0 or 2+ people — surface those so Charlie can fix the name later.

Before creating a new person via intel, check name variants (Otter mis-transcribes — "Jad"→"John"). If a person is new, confirm the name on first appearance.

## Step 5: Confirm
Report what landed: tasks (ids+titles), knowledge (count by category), intel (by person + any `needs_link`), moves (count). One line.

## Rules
- Present before push — same discipline as `/tribal` and `/debrief`. Never auto-write to D1 from a raw dump.
- D1 is the system of record. Don't write captures to `.md` files.
- Distill, don't dump. Store the point, drop the "um, so yeah, I was walking by and…".
- If the whole dump is clearly one thing, skip the grouping and just file it — don't over-ceremony a single note.
