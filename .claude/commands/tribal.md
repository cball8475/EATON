Quick tribal knowledge capture. Charlie types `/tribal` followed by notes, voice memo text, or a description.

Arguments: $ARGUMENTS (the knowledge to capture)

## Step 1: Parse what Charlie provides
Extract: what the knowledge is, who said it / where it came from, why it matters (connect to role/risk/transition), date (default today).

## Step 2: Format for review
```
## [Topic] ([Date] — [Source])
- [bullet points of the knowledge]
- [context for why this matters]

D1 entry:
  category: [equipment|process|project-history|vendor|policy|tribal-knowledge|org-context]
  area: [steel-fab|copper-fab|warehouse|plant-wide|corporate|environmental|etc]
  subject: [short title]
  detail: [the knowledge]
  people_involved: [source person]
  source_label: [source context]
```

## Step 3: Show Charlie for review. Don't push without confirmation.

## Step 4: After approval

`POST EATON_API/knowledge` with header `Authorization: Bearer EATON_TOKEN` and body:
```json
{
  "category": "...",
  "area": "...",
  "subject": "...",
  "detail": "...",
  "people_involved": "...",
  "source_label": "..."
}
```

If this creates or updates a task, flag it — don't auto-create.
If the knowledge contradicts something already in D1, flag the conflict.

## Rules
- Keep entries tight. Distill raw text — don't store the raw paste.
- Always tag with source and date.
