# Lessons & Dead Ends

What failed, what wasted time, and what looked right but wasn't. Force-read at morning brief if updated the previous day. New entries at top.

---

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
