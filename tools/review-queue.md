# Review Queue

A triage shell for anything that arrives as a pile of items needing a decision — inbox
exports, Otter transcripts, audit findings. Renders each item with a suggested
disposition, lets Charlie accept/override/dismiss, then emits a payload Claude executes
against D1 and Google Calendar.

Built because the read-only review artifact (2026-07-28 inbox import) surfaced ~60
actionable items and there was no way to act on them without re-typing everything back
into chat.

**Live file:** `tools/review-queue.html` — self-contained, no build step, no external
requests. Publish with the Artifact tool or open locally.

---

## Why a paste-back payload instead of a direct write

Artifacts run under a strict CSP: no fetch, no XHR, no WebSockets to any host. The page
**cannot** call the Worker API or D1 directly. The only runtime capabilities available on
this account are `downloads` and `mcp`, and `mcp` requires claude.ai connectors that
aren't attached.

So the loop is: **triage in the page → build payload → paste into chat → Claude writes.**
Claude holds the D1 and Google Calendar credentials, not the page. This also keeps a human
confirmation step in front of every write, which matches the debrief protocol rule
("always present for review before pushing to D1").

Do not try to "fix" this by adding a fetch call. It will fail silently in the published
artifact and work in local testing, which is the worst possible failure mode.

---

## Dispositions

| Key | Label | Writes to | Fields collected |
|---|---|---|---|
| `task` | Task | `tasks` (ownership `mine`) | due, priority, note |
| `reply` | Need reply | `tasks` tagged `reply`, `waiting_on` = person | person, due, note |
| `replied` | Replied | nothing — already handled | — |
| `cal` | Calendar | Google Calendar event **+** `knowledge` row | date, time, note |
| `know` | Knowledge | `knowledge` | note |
| `intel` | Person | `people_intel` | person, note |
| `move` | Ldr move | `leadership_moves` | note |
| `deleg` | Delegate | `tasks` with `ownership` = other, `waiting_on` set | person, due, note |
| `fyi` | FYI | `tasks`, undated, `ownership` = `fyi` | — |
| `skip` | Dismiss | nothing — listed in the payload for the record | — |

`task` / `reply` / `cal` / `know` / `skip` are the primary row; the rest sit behind `⋯`.

Every disposition carries the item's `source_label` through to the D1 row so the trail
back to the originating email or transcript line survives.

---

## Reusing it for Otter transcripts

Everything above the `ENGINE` comment in the `<script>` is data. Replace three constants
and nothing else:

```js
const SOURCE   = { kind:"meeting", label:"T3 2026-08-04", window:"...", today:"..." };
const SECTIONS = [ {id:"tasks", h:"Action items", ct:"9 items"}, ... ];
const ITEMS    = [ { s:"tasks", u:"crit", w:"8/4", wn:"Kate",
                     t:"Title", b:["<p>-safe HTML body</p>"],
                     src:"attribution line",
                     tags:[["New","new"]],
                     sug:{ d:"task", due:"2026-08-11", pri:"High", note:"..." } }, ... ];
```

Field notes:
- `u` drives the left stripe: `crit` / `warn` / `calm` / `good`.
- `b` entries are inserted as raw HTML — they're authored by Claude, not user input.
  `t` and `src` are escaped on render.
- `sug` is the pre-selected suggestion. Always set one. `Accept all suggestions` is the
  fast path and it only fires where `sug.d` exists.
- Tag classes: `hot` (red), `new` (amber), `trk` (grey, already in D1), `done` (green).

Section notes (`sec.note`) are optional and render as a lede under the header.

---

## Known constraints

- **State is per-browser, best-effort.** Decisions go to `localStorage` under
  `review-queue::<window>`. Consistent with the 2026-05-10 lesson on artifact
  persistence: treat it as a convenience, not a guarantee. The page says so in the
  footer. Build the payload before closing the tab.
- **`downloads` capability must be declared** at publish time for `Save file` to use the
  native save dialog. Without it the button falls back to a Blob download, which works
  but is less pleasant on mobile.
- **Item indices are the state keys.** Reordering or deleting entries in `ITEMS`
  invalidates saved decisions for that window. Bump `SOURCE.window` when the data
  changes materially.

---

## Source-side lesson: Outlook CSV exports carry no date

The `Inbox_export.CSV` format has 19 columns — Subject, Body, From/To/CC/BCC, Billing,
Categories, Importance, Mileage, Sensitivity — and **no received-date column**. Two
things make the window filter work anyway:

1. Rows are exported in chronological order, oldest first.
2. Reply bodies quote Outlook headers: `Sent: Tuesday, July 28, 2026 11:01 AM`.

Take the max quoted `Sent:` date per row as that row's anchor (roughly 30% of rows have
one), then forward-fill. Backward-fill the leading rows with the *first* real anchor —
filling them with the last anchor silently dates the whole file to today, which is how
the first pass produced a 1,414-row "window."
