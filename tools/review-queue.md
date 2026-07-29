# Review Queue

A triage shell for anything that arrives as a pile of items needing a decision — inbox
exports, Otter transcripts, audit findings. Renders each item with a suggested
disposition, lets Charlie accept/override/dismiss, and **writes the decisions straight to
D1** through the same Worker API the dashboard uses.

**Live file:** `tools/review-queue.html` — single file, no build step, no dependencies.

---

## How it writes

Same transport as `index.html`: `fetch` → `https://eaton-ehs-api.cball8475.workers.dev`
with `Authorization: Bearer <token>`. The Worker sets `Access-Control-Allow-Origin: *`, so
this works from any origin the file is served from.

The token is **never in the file**. On load the page reads `localStorage.eaton_token` —
the same key the dashboard uses, so if you've already authed the dashboard in that browser
this page is authed too. If the key is missing or the token is rejected, an inline field
appears at the top; there is no `prompt()` (it gets blocked in embedded contexts).

> This is why the tool lives on the dashboard and **not** in a Claude Artifact. Artifacts
> run under a CSP that blocks fetch/XHR/WebSockets to every host, so a published artifact
> physically cannot reach the Worker. An earlier draft used a copy-paste payload to work
> around that. Don't go back to it — serving the page from Netlify/Pages removes the
> restriction entirely.

## Dispositions

| Key | Label | Writes | Body |
|---|---|---|---|
| `task` | Task | `POST /tasks` | ownership `mine`, status `todo` |
| `reply` | Need reply | `POST /tasks` | title prefixed `Reply:`, `waiting_on` = person, tag `reply` |
| `cal` | Calendar | `POST /tasks` + `.ics` | reminder task, tag `calendar`, event time in `notes` |
| `know` | Knowledge | `POST /knowledge` | category + area + subject + detail |
| `intel` | Person | `POST /intel` | `person_name`, `intel_type`, `content` |
| `move` | Ldr move | `POST /moves` | `description`, category `proactive` |
| `deleg` | Delegate | `POST /tasks` | ownership `fyi`, `waiting_on` set, tag `delegated` |
| `fyi` | FYI | `POST /tasks` | status `undated`, ownership `fyi`, tag `fyi-context` |
| `replied` | Replied | — | recorded locally, no API call |
| `skip` | Dismiss | — | recorded locally, no API call |

Every row carries `source_label` (the originating email/transcript line), `source` =
`SOURCE.kind`, `ai_extracted: 1`, and a `SOURCE.tag` tag so a whole import can be found —
or undone — with one query:

```sql
SELECT id, title FROM tasks WHERE tags LIKE '%inbox-review-2026-07-28%';
```

Calendar items also build a multi-`VEVENT` `.ics` you can open straight into Outlook or
Google Calendar. Timed events get a 1-hour default duration; dateless ones are all-day.

## Failure handling — the whole point

Per `kb/lessons.md`, this system has been bitten three times by helpers that return
`{success:false}` or an empty-but-200 response and get treated as success. So:

- **A 2xx with no row id in the response is a FAILURE.** The page does not mark anything
  written unless the Worker hands back an `id`.
- **Non-2xx** shows `HTTP <status> — <the server's own error text>`, not a generic message.
- **Network errors** show `NETWORK — <message> (nothing was written)`.
- **A 401 mid-run halts the loop**, and the banner names how many rows were **never
  attempted** — those are neither successes nor failures and are labelled separately.
- **Required fields are validated client-side** against a mirror of the Worker's `ENUMS`
  block, so a row that would 400 is blocked *before* the run with a pointed message.
- **Successful rows are locked.** Retry only re-sends failures, so nothing double-writes.
- `Copy failure report` puts the failed titles, endpoints, errors and full payloads on the
  clipboard.

The mirrored `ENUMS` in the page must stay in sync with `infra/worker-api.mjs`. If you add
an enum value server-side, add it here too.

### Tests

`tools/review-queue.test.mjs` drives the real page in Chromium with a mocked Worker — 41
assertions across 8 scenarios: happy path, HTTP 500, 2xx-without-id, mid-run network drop,
mid-run 401, missing token, blocked validation, and `.ics` output.

```bash
npm i playwright
node tools/review-queue.test.mjs
```

## Deploying

It's a static file. Alongside the dashboard on Netlify:

```bash
mkdir -p /tmp/eaton-dash
cp index.html /tmp/eaton-dash/index.html
cp tools/review-queue.html /tmp/eaton-dash/review.html
npx -y netlify-cli deploy --prod --dir /tmp/eaton-dash --site 5667ffaa-f8bb-4208-9cba-766fd357f2b8
```

Then it's at `/review.html`. **Deploy the whole directory, not one file** — a `--dir` with
only `review.html` in it would wipe `index.html` off the site.

## Reusing it for Otter transcripts

Everything above the `ENGINE` marker is data. Replace three constants, touch nothing else:

```js
const SOURCE   = { kind:"meeting", label:"T3 2026-08-04", window:"...",
                   today:"2026-08-04", tag:"debrief-2026-08-04" };
const SECTIONS = [ {id:"tasks", h:"Action items", ct:"9 items", note:"optional lede"}, ... ];
const ITEMS    = [ { s:"tasks", u:"crit", w:"8/4", wn:"Kate",
                     t:"Title", b:["<p>-safe HTML body</p>"],
                     src:"attribution line",
                     tags:[["New","new"]],
                     sug:{ d:"task", due:"2026-08-11", pri:"High", note:"..." } }, ... ];
```

- `u` drives the left stripe: `crit` / `warn` / `calm` / `good`.
- `b` entries render as raw HTML — authored by Claude, not user input. `t` and `src` are
  escaped, and both are run through `plain()` before going into a D1 row.
- Always set a `sug`. `Accept all suggestions` only fires where one exists.
- Tag classes: `hot` (red), `new` (amber), `trk` (grey, already tracked), `done` (green).

## Known constraints

- Decisions persist to `localStorage` under `review-queue::<window>`, best-effort only
  (see the 2026-05-10 artifact-persistence lesson). Rows already written to D1 are marked
  and locked, so a lost cache costs you the undecided ones, never a double-write.
- **Item indices are the state keys.** Reordering or deleting entries in `ITEMS`
  invalidates saved decisions for that window — bump `SOURCE.window` when the data changes.
- `Reset` warns if rows are already in D1; clearing here does not delete them from the
  database.

## Source-side lesson: Outlook CSV exports carry no date

The `Inbox_export.CSV` format has 19 columns — Subject, Body, From/To/CC/BCC, Billing,
Categories, Importance, Mileage, Sensitivity — and **no received-date column**. Two things
make a date window possible anyway:

1. Rows are exported in chronological order, oldest first.
2. Reply bodies quote Outlook headers: `Sent: Tuesday, July 28, 2026 11:01 AM`.

Take the max quoted `Sent:` date per row as that row's anchor (~30% of rows have one), then
forward-fill. Backward-fill the leading rows with the **first** real anchor — filling them
with the last one silently dates the whole file to today, which is how the first pass
produced a 1,414-row "window."
