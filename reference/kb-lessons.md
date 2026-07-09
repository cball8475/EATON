# Lessons & Dead Ends

What failed, what wasted time, and what looked right but wasn't. Force-read at morning brief if updated the previous day. New entries at top.

---

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
