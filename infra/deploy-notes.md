# Infrastructure Deploy Notes

## Netlify Dashboard

**Site:** https://eaton-ehs-cmd.netlify.app
**Site ID:** `5667ffaa-f8bb-4208-9cba-766fd357f2b8`

### Deploy pattern
1. Edit the target file
2. Copy to `index.html` in the deploy directory: `cp dashboard.html /home/claude/index.html`
3. Verify content: `grep "some-unique-string" /home/claude/index.html`
4. Deploy: `npx -y @netlify/mcp@latest --site-id 5667ffaa-f8bb-4208-9cba-766fd357f2b8 --proxy-path [proxy] deploy --dir /home/claude --prod --no-wait`

### Gotchas
- Netlify serves `index.html` by default, NOT `dashboard.html`
- Prior deploys using `--no-wait` appeared to succeed but uploaded the wrong filename — always verify with grep before deploying
- Single-file HTML, no build step

> **Note (2026-06-29):** the Netlify deploy was **public** and shipped the API token in client JS — a full read/write leak. ~~The dashboard is moving to Cloudflare Pages behind Access (below).~~
> **Update (2026-07-23):** the leak persisted with the LIVE token until today. Fixed: `index.html` now prompts once and stores the token in localStorage — no secret in the file. The exposed token was rotated (see env.sh). The Cloudflare Pages + Access move below remains the better end-state (defense in depth) but is optional now.

### Dashboard deploy (Netlify, current)
```bash
mkdir -p /tmp/eaton-dash && cp index.html /tmp/eaton-dash/index.html
npx -y netlify-cli deploy --prod --dir /tmp/eaton-dash --site 5667ffaa-f8bb-4208-9cba-766fd357f2b8
# first run opens a browser to authorize, same as wrangler login
```
After a token rotation, in the dashboard browser: DevTools console → `localStorage.removeItem('eaton_token')` → reload → enter the new token.

---

## Dashboard auth — Cloudflare Pages + Access (replaces public Netlify)

The dashboard no longer hardcodes a token. It prompts once in the browser and stores the value in `localStorage` (see the config block in `index.html`). It's served behind Cloudflare Access so only you can reach it; the in-browser token is therefore only ever exposed to an authenticated session.

### One-time setup
1. **Deploy to Pages** (single static file, no build):
   ```bash
   mkdir -p /tmp/eaton-dash && cp index.html /tmp/eaton-dash/index.html
   npx wrangler pages deploy /tmp/eaton-dash --project-name eaton-ehs-dashboard
   ```
   Note the `*.pages.dev` URL it prints.
2. **Put Access in front** — Cloudflare dashboard → **Zero Trust** → **Access** → **Applications** → **Add an application** → **Self-hosted**:
   - Application domain: the `eaton-ehs-dashboard.pages.dev` hostname
   - Policy: **Allow**, include **Emails** = `charlieball@eaton.com` (+ any others)
   - Session duration: your preference (e.g. 24h)
3. **First visit:** Cloudflare emails a one-time PIN → log in → dashboard loads → enter the (rotated) token at the prompt. Stored locally from then on.

### After a token rotation
In the dashboard browser console: `localStorage.removeItem('eaton_token')` then reload, and enter the new token.

### Cost
Cloudflare Pages: free. Cloudflare Access: free up to 50 users. (Netlify password protection would have required a Pro plan — this avoids that.)

---

## Cloudflare Worker API

**Worker:** `eaton-ehs-api`
**URL:** https://eaton-ehs-api.cball8475.workers.dev
**Account ID:** `37821191a8c1419e055c2c0a30546589`
**D1 Database ID:** `62ce85d7-0cc1-4832-aa57-d5b09ceaa132`
**Auth:** Bearer token — source of truth is `infra/env.sh` (`EATON_TOKEN`)

### Deploy pattern (preferred: wrangler — preserves secrets)
```bash
cd infra
export XDG_CONFIG_HOME="$HOME/.wrangler-config"
# Set GIT_SHA on its own line — `GIT_SHA=$(...) wrangler --var "$GIT_SHA"` expands
# the arg BEFORE the inline assignment applies, passing an empty value.
GIT_SHA=$(git rev-parse --short HEAD)
npx wrangler deploy --var GIT_SHA:"$GIT_SHA"
```
Reads `infra/wrangler.toml` (D1 binding + cron). Secrets stay intact.

**Stamp the commit (v3.7.0+):** pass `GIT_SHA` as a var on every deploy (shown above) so `/health` reports the live commit. That's how you check live-vs-repo drift: `curl .../health` returns `{ version, git_sha, ... }` — if `git_sha` doesn't match `git rev-parse --short HEAD` in the repo, the deploy is behind. Don't hardcode the version anywhere else; `/health` is the only truth.

### WAF / firewall (required for the chat surface)
The Claude chat surface fetches the API with a browser-style user-agent, not curl. If a Cloudflare WAF or firewall rule filters by user-agent, those calls 403 and the morning brief silently half-renders (see D1 knowledge #454, auth-verification lesson). Keep a skip/allow rule on the API path:
- Scope: `http.host eq "eaton-ehs-api.cball8475.workers.dev"` (or the route path)
- Action: skip remaining WAF rules / managed rules for that path
- Auth is already enforced by the Bearer check in the Worker — the WAF UA filtering adds no security here, only breakage.

### Deploy pattern (fallback: curl PUT to Cloudflare API)
Uses multipart form data:
- metadata JSON (main_module, bindings, compatibility_date)
- worker.mjs file content

Use only if wrangler auth is broken. **PUT-based deploys WIPE secrets** — re-set them after.

### Secrets (must be re-set after PUT-based redeployments only — wrangler preserves them)
- `API_TOKEN` — bearer token for auth
- `ANTHROPIC_API_KEY` — for Otter transcript extraction
- `RESEND_API_KEY` — for weekly digest emails (v3.6.0+; replaced SendGrid). Sends from `digest@florencescservices.com` (FSC Resend account / verified domain). Set via `npx wrangler secret put RESEND_API_KEY`.
- `GITHUB_BACKUP_TOKEN` — v3.8.0+; PAT with `repo` scope on `cball8475/EATON`, used by the Monday backup cron to push gzipped D1 exports. Set via `npx wrangler secret put GITHUB_BACKUP_TOKEN`. Until it's set, backups log a skip — nothing breaks.

### Cron
- `0 14 * * 5` — Friday 14:00 UTC (10:00 AM ET during EDT) — builds and emails weekly digest
- `0 12 * * 1` — Monday 12:00 UTC (v3.8.0+) — gzipped full D1 export pushed to `infra/backups/auto/d1-export-YYYY-MM-DD.json.gz` on GitHub main (~150-250KB/week). Manual trigger: `eaton /backup/run -X POST`.

### Restore (tested 2026-07-22 against the first production backup)
```bash
cd infra
./restore.sh backups/auto/d1-export-YYYY-MM-DD.json.gz eaton-ehs-restore-test --create
```
Builds the schema (`infra/schema.sql`), loads every table, rebuilds the FTS index, and verifies row counts against the backup — refusing to touch `eaton-ehs-dashboard` unless `--force-prod` is passed. To cut over to a restored DB: change `database_id` in `wrangler.toml` to the new database's ID and redeploy. Backups from v3.8.1+ include `scoreboard` + `scoreboard_history` (earlier ones don't — that gap is what the first drill caught). Run a drill against a fresh test DB ~quarterly, then `npx wrangler d1 delete eaton-ehs-restore-test`.

### v3.9.0 rollout checklist (one-time — includes the token rotation)
0. **Rotate the leaked API token.** The old bearer token shipped in public dashboard JS for weeks. The new value is already in `infra/env.sh` (pull first). Apply it server-side:
   - Cloudflare dashboard → Secrets Store → secret `EATON_TOKEN` → update to the value in env.sh
   - `npx wrangler secret put API_TOKEN` → same value (keeps the fallback in sync)
   Until this is done the `eaton` helper (running the new env.sh) gets 401s.
1. **Create the Vectorize index BEFORE deploying** (the wrangler.toml binding fails the deploy if it doesn't exist):
   ```bash
   npx wrangler vectorize create eaton-memory --dimensions=768 --metric=cosine
   ```
2. **Deploy the worker** (standard pattern with GIT_SHA).
3. **Run the migration:** `infra/migrations/2026-07-23-v3.9.0.sql` (two ALTERs — run individually if the batch errors).
4. **Backfill the semantic index** (~724 entries, resumable):
   ```bash
   source infra/env.sh
   eaton "/vectorize/backfill?offset=0" -X POST | jq .
   # repeat with the returned next_offset until done:true (about 18 calls),
   # or loop it:
   O=0; while :; do R=$(eaton "/vectorize/backfill?offset=$O" -X POST); echo "$R"; \
     [ "$(echo "$R" | jq -r .done)" = "true" ] && break; O=$(echo "$R" | jq -r .next_offset); done
   ```
5. **Verify:**
   ```bash
   eaton "/search?q=who+resists+change+on+the+floor&mode=semantic" | jq '.semantic[:3]'
   eaton "/intel?limit=1&fields=id,person_name,superseded_by" | jq .
   eaton /digest/preview | jq -r .formatted | head -5    # deltas in the header lines
   ```
6. **Deploy the fixed dashboard** (see "Dashboard deploy (Netlify, current)" above), open it, enter the new token at the prompt.

New entries embed automatically on POST/PATCH (fire-and-forget — a failed embed never fails the write). Semantic mode reports `semantic_available:false` instead of erroring when the index/bindings are missing.

### v3.8.0 rollout checklist (one-time)
1. **Deploy the worker** (wrangler pattern above — sets both crons from wrangler.toml).
2. **Run the migration:** `infra/migrations/2026-07-22-v3.8.0.sql`. D1 requires statements run **one at a time** (ALTERs especially). Either paste statement-by-statement into Cloudflare MCP `d1_database_query`, or:
   ```bash
   # crude splitter — fine for this file's statement-per-blank-line layout
   npx wrangler d1 execute eaton-ehs-dashboard --remote --file infra/migrations/2026-07-22-v3.8.0.sql
   # if the batched file errors on the ALTERs, run those three individually first, then the rest
   ```
3. **Set the backup secret:** `npx wrangler secret put GITHUB_BACKUP_TOKEN` (PAT, `repo` scope on cball8475/EATON).
4. **Verify:**
   ```bash
   source infra/env.sh
   eaton /health | jq .              # version 3.8.0, git_sha = repo HEAD
   eaton "/search?q=gloria" | jq .counts    # 503 until migration runs; counts after
   eaton "/trends?weeks=4" | jq 'keys'
   eaton /backup/run -X POST | jq .  # success:true + path, or reason:"no_github_backup_token"
   ```
Deploy-before-migration is safe: /search returns a 503 hint, knowledge/scoreboard fall back to pre-3.8.0 behavior. Migration-before-deploy is also safe (v3.7.0 ignores the new tables). Just finish both.

---

## Credential Locations
- Cloudflare API token: Claude Code environment variable `CLOUDFLARE_API_TOKEN` (claude.ai/code → environment settings; wrangler picks it up — added 2026-07-24). Not committable: GitHub push protection rejects `cfat_` tokens.
- All Worker secrets: set via Cloudflare API (see fsc-credentials skill for values)
- Never ask Charlie for a GitHub PAT — use florence-crm-api /github-push endpoint
