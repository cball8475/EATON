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
npx wrangler deploy
```
Reads `infra/wrangler.toml` (D1 binding + cron). Secrets stay intact. Verify with `curl https://eaton-ehs-api.cball8475.workers.dev/health` — version should match the header in `worker-api.mjs`.

### Deploy pattern (fallback: curl PUT to Cloudflare API)
Uses multipart form data:
- metadata JSON (main_module, bindings, compatibility_date)
- worker.mjs file content

Use only if wrangler auth is broken. **PUT-based deploys WIPE secrets** — re-set them after.

### Secrets (must be re-set after PUT-based redeployments only — wrangler preserves them)
- `API_TOKEN` — bearer token for auth
- `ANTHROPIC_API_KEY` — for Otter transcript extraction
- `RESEND_API_KEY` — for weekly digest emails (v3.6.0+; replaced SendGrid). Sends from `digest@florencescservices.com` (FSC Resend account / verified domain). Set via `npx wrangler secret put RESEND_API_KEY`.

### Cron
- `0 14 * * 5` — Friday 14:00 UTC (10:00 AM ET during EDT)
- Builds and emails weekly digest

---

## Credential Locations
- Cloudflare API token: fsc-credentials skill
- All Worker secrets: set via Cloudflare API (see fsc-credentials skill for values)
- Never ask Charlie for a GitHub PAT — use florence-crm-api /github-push endpoint
