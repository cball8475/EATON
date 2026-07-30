# Lessons & Dead Ends

What failed, what wasted time, and what looked right but wasn't. Force-read at morning brief if updated the previous day. New entries at top.

---

## 2026-07-30 — The project instruction file was named `claude.md` and had never loaded in a cloud session
**What:** Reviewing the file surfaced that it was `claude.md`, lowercase. Claude Code auto-loads `CLAUDE.md`; on a case-sensitive filesystem (Linux, every cloud session) `claude.md` does not match and is silently skipped — no warning, no error, the session just runs with none of the communication rules, infra IDs, or people context. Confirmed directly: this session's loaded project instructions listed only the `skills` repo's CLAUDE.md, nothing from EATON. It likely worked on Charlie's Mac the whole time, since macOS is case-insensitive by default, which is why ~3 months passed without anyone noticing. Every cloud session since the repo was created has been flying without context.
**Fix:** `git mv claude.md CLAUDE.md`. Added a line to the Memory Architecture section and the file-organization block stating the name must stay capitalized, so a future edit doesn't quietly undo it.
**Lesson:** A convention-named file that is *silently* optional fails invisibly — there is no error to notice, only degraded output that reads like the model being dumb. Anything loaded by filename convention should be verified as actually loaded, on the case-sensitive platform, not assumed from a local run. Same class of bug as the crons that reported success: absence of an error is not evidence of working.
**Also closed today:** the 07-29 open item ("until the first run, the leaked value stays live") is resolved. The rotation workflow ran — the leaked bearer `Karwji0...` now returns 401 and the current value returns 200. The git-history leak is closed. Backup cadence still worth watching: autos exist for 07-22/23/25/26/29 but the Monday 07-27 cron miss is still unexplained.
**Source:** CLAUDE.md review + rewrite, 2026-07-30.

## 2026-07-29 — Deleting the committed bearer without rotating broke every cloud session and left the leak live
**What:** "Worker API keeps failing" — every authed endpoint 401'd from Claude cloud sessions starting 2026-07-28, when PR #7 removed the hardcoded `EATON_TOKEN` from `infra/env.sh`. Cloud sessions have neither `~/.fsc/eaton.token` nor the env var, so every skill's `eaton` call died at auth and sessions kept asking Charlie to paste the token. The worker itself was healthy the whole time (`/stats` 200 with a valid bearer). Worse: the "removed" token still authenticated — `git show 66cf834~1:infra/env.sh` in the PUBLIC repo hands anyone the live bearer, full read/write on 670 tasks + 553 knowledge + 193 intel rows. Removal is not rotation. Separately: the Monday 07-27 12:00 UTC backup cron produced no commit; a manual `/backup/run` on 07-29 pushed fine (201) with the same `GITHUB_BACKUP_TOKEN`, so the secret is healthy and the miss is unexplained — verify a `d1-export-2026-08-03` commit appears next Monday.
**Fix:** D1 `app_config` now carries the bearer as the session self-serve copy (D1 access already ⊇ what the bearer guards; `/export` enumerates its tables, so backups can never leak it). `env.sh` resolves env var → cache file → D1-via-`CLOUDFLARE_API_TOKEN`, prints the MCP bootstrap when all three miss, and grew `eaton_refresh_token` for post-rotation 401s. New `rotate-token.yml` workflow (manual dispatch; runs on GitHub runners because cloud sessions hold no Cloudflare API token) mints a fresh value, updates Secrets Store + `API_TOKEN` fallback + `app_config` together, then fails unless new=200 AND leaked-old=401. **Run it — until the first run, the leaked value stays live.**
**Lesson:** A secret deleted from a tracked file is still published — git history serves it forever; the same change must rotate it or it changed nothing. And moving a credential's home has to ship a distribution path for every consumer — cloud sessions had none, which turned a security cleanup into a three-day outage. Third wrong-infrastructure-claim in a month: docs said sessions get `CLOUDFLARE_API_TOKEN` automatically; registry §6 had already disproved it. Check the registry before building on a claim.
**Source:** Worker-API-failure debugging, 2026-07-29.

## 2026-07-25 — Weekly digest silently dead for a month; second invalid Worker secret
**What:** Investigating reported cron failures. Both cron routines passed when triggered by hand (`POST /backup/run` → 201 GitHub push; `/digest/preview` → builds fine), all four Worker secrets present, both crons registered. The tell came from Gmail, not Cloudflare: digests arrived weekly 2026-06-04 → 06-25, then **nothing**. `POST /digest/send` returned `{"success":false,"status":401,"error":"API key is invalid"}` — **RESEND_API_KEY is invalid**, the same failure mode as ANTHROPIC_API_KEY the day before. Two of four secrets bad, both symptomless.
**Root cause (why it hid):** `sendDigestEmail` and `runBackup` *return* `{success:false}` instead of throwing, and the cron called them through fire-and-forget `ctx.waitUntil(...)` — which never rejects into the surrounding try/catch. So the handler logged "Weekly digest sent" unconditionally and Cloudflare recorded a clean invocation on every run. There was no failure to find in the dashboard because the cron genuinely reported success.
**Fix:** New Resend key set 2026-07-25; digest delivered and confirmed in the inbox. The key was the whole problem — `GET api.resend.com/domains` shows `florencescservices.com` still `verified` / sending enabled, so the 2026-07-08 Cloudflare Registrar transfer did *not* disturb the DNS. Note: a `wrangler secret put` takes **~30-45s to propagate** to the running Worker — an immediate retest still returns the old secret's 401 and reads like a bad key. Wait a minute before concluding the new value is wrong.
**Lesson:** Verify crons by their **outcome**, not their exit status — the digest is proven by an email in the inbox, the backup by a dated file in `infra/backups/auto/`. `ctx.waitUntil(p)` inside `try/catch` catches nothing; the check must live inside the promise. Any helper returning `{success:false}` needs its caller to inspect the result or it's a silent failure by construction (third instance of this exact anti-pattern after `/otter/extract`). When one Worker secret turns out to be invalid, **test the others the same day** — they tend to go bad together. Fixed in v3.9.3: both cron paths throw on non-success.
**Open:** delivered digests all landed **Thursday** 14:00 UTC, but the registered cron is `0 14 * * 5` (Friday) — day-of-week discrepancy unexplained; confirm intended day with Charlie.
**Source:** Cron-failure investigation, 2026-07-25.

## 2026-07-24 — /otter/extract silently died when its pinned Claude model retired
**What:** Automatic debriefs reported down with "an API issue." Testing `/otter/extract` with a transcript containing three obvious tasks returned `{"extracted_tasks":[],"extracted_moves":[],"raw":"{}"}` — HTTP 200, sub-second, no error anywhere. Worker, D1, and the rotated bearer token all checked out healthy.
**Root cause:** Two stacked failures. (1) The worker pinned `claude-sonnet-4-20250514`, which Anthropic retired 2026-06-15 — every call since then gets a 404 `not_found_error` from the Anthropic API. (2) The endpoint swallowed it: `aiData.content?.filter(...) || "{}"` converts ANY upstream error (retired model, bad key, no credit) into an empty-but-successful extraction, so nothing ever surfaced.
**Lesson:** Never default an API error into an empty success — check `res.ok` and return the upstream status/type. A sub-second "empty" response from an AI endpoint is a rejection, not an answer (a real extraction takes seconds). Anything pinning a dated model ID has a shelf life; prefer the current alias (`claude-sonnet-5`) and note retirement dates. Fixed in v3.9.1: model swapped to `claude-sonnet-5`, errors surface as 502s, missing-secret guard added.
**Source:** Debrief-outage debugging, 2026-07-24.

## 2026-07-10 — EATON auth is a Secrets Store secret, NOT the Worker API_TOKEN var
**What:** `/morning` 401'd on every authed endpoint (Worker v3.7.0). Burned ~an hour because editing the per-Worker `API_TOKEN` secret in the dashboard did nothing — kept returning 401 even with a clean, byte-perfect token typed directly into curl (ruled out mobile paste, proxy, wrong-worker via `workers_list`).
**Root cause:** The DEPLOYED worker code (v3.7.0) authenticates against a **Cloudflare Secrets Store** binding named `AUTH_TOKEN`, and only falls back to `env.API_TOKEN` if that binding is absent:
```js
let expectedToken = env.API_TOKEN;
if (env.AUTH_TOKEN && typeof env.AUTH_TOKEN.get === "function") expectedToken = await env.AUTH_TOKEN.get();
if (token !== expectedToken) return err("Unauthorized", 401);
```
The `AUTH_TOKEN` binding points to Secrets Store secret **`EATON_TOKEN`** (account-level Secrets Store → Workers). That's the only value that matters. The repo `infra/worker-api.mjs` still shows the OLD `API_TOKEN`-only check — deployed code diverged from the repo and nobody updated the file, which is what made this invisible.
**Lesson:** To rotate the EATON token, update the **Secrets Store secret `EATON_TOKEN`** (dash → Secrets Store), not the Worker's `API_TOKEN` variable, then set the same value in `infra/env.sh`. Keep `API_TOKEN` matching too as a fallback. Diagnose deployed auth by reading the LIVE code via Cloudflare MCP `workers_get_worker_code`, not the repo file. Meanwhile, the morning brief data lives in D1 — query it directly via `d1_database_query` (db `62ce85d7-0cc1-4832-aa57-d5b09ceaa132`), no Worker token needed, so a dead token never blocks the brief. (Also this morning: GitHub `fsc-crm-api-push` PAT / florence `GITHUB_TOKEN`, id 13405149, expired — regenerated + re-set via CF dashboard.)
**Source:** Morning brief token 401 debugging, 2026-07-10.

## 2026-05-16 — File size will become a problem
**What:** log-sessions.md will hit noise threshold (~35KB) within 2 months at current pace.
**Lesson:** Archive monthly. Keep current month only in log-sessions.md, roll to log-sessions-YYYY-MM.md.
**Source:** Reddit feedback from someone who hit this wall managing 860+ ad campaigns.

## 2026-05-12 — Debrief over-attribution
**What:** First T3 debrief assigned tasks to Charlie that were mentioned in conversation but not directed at him. Copper shop door and Gloria items were already done. Supply chain meeting wasn't Charlie's.
**Lesson:** Default ambiguous items to FYI, not mine. "Mentioned" ≠ "directed." Always present for review before pushing to D1.
**Source:** Charlie correction during debrief review.

## 2026-05-12 — Otter names are frequently wrong
**What:** Otter transcribed "Jad" as "John" and "Sean" as "Shawn." Created duplicate people records before catching it.
**Lesson:** Always search name variants before creating D1 people records. Confirm names with Charlie on first appearance.
**Source:** T3 debrief processing.

## 2026-05-12 — Otter timestamps are unreliable
**What:** Otter reported T3 meeting at a time that didn't match Charlie's actual schedule.
**Lesson:** T3 is always 8:15 AM regardless of what Otter reports. Don't infer meeting sequence from Otter timestamps.
**Source:** Charlie correction.

## 2026-05-10 — Netlify deploy uploaded wrong file
**What:** Deploy with --no-wait appeared to succeed but served stale content. The deploy directory contained dashboard.html but Netlify serves index.html by default.
**Lesson:** Always copy target file to index.html before deploying. Always grep to verify content before deploy command.
**Source:** Dashboard deploy debugging.

## 2026-05-10 — React artifact persistence is a lie
**What:** Claude app artifact storage does NOT survive dismiss/reopen. It creates a new instance every time. Spent ~10 conversations across multiple days trying to make the floor form persist.
**Lesson:** For anything that needs to survive app close: (1) use window.storage within a single session, (2) copy-before-close for handoff to chat, (3) deploy to Netlify/external for true persistence. Don't try to solve this differently.
**Approaches that failed:** React state persistence, multiple artifact rebuild strategies, assuming window.storage would survive app restart.
**Source:** Machine method sheet form build — May 8-12.

## 2026-05-10 — Otter MCP returns empty transcripts
**What:** Otter.ai MCP integration sometimes returns empty transcript bodies even when the meeting exists and has content.
**Lesson:** Don't retry multiple times. Tell Charlie to paste the transcript manually. Manual paste is the established fallback.
**Source:** Multiple debrief attempts.

## 2026-05-07 — Worker secrets get wiped on PUT redeploy
**What:** After deploying Worker via curl PUT with multipart form data, all secrets (API_TOKEN, ANTHROPIC_API_KEY) were reset. API returned 401 until secrets were re-set.
**Lesson:** After any PUT-based Worker redeployment, re-set all secrets explicitly via Cloudflare API.
**Source:** Worker v2 deploy.

## 2026-05-07 — People search has no server-side filter
**What:** Tried to search for a person by name via the Worker API. No name search parameter exists.
**Lesson:** Must GET /people (full list) and filter client-side. Don't assume server-side search exists for people.
**Source:** People record creation during Kate debrief.
