# Eaton setup hardening — 2026-06-29

Status of the work from the chat + desktop session.

## Done & verified
- ✅ **Token rotated.** Live secret is the Secrets Store value bound as `AUTH_TOKEN`
  (`EATON_TOKEN`, store `80c48360a0e54dd69425da2dfbde21ad`). Old token → 401, new → 200.
- ✅ **`#389` fixed** (`investigation` → `wip`), and the v3.7.0 enum guard now rejects
  invalid status/priority/ownership/target_period with a 400.
- ✅ **Worker v3.7.0 deployed.** `/brief` + `/pulse` composite endpoints, `/intel`
  person_id resolution, scoreboard age/stale, `/health` git_sha. Verified live.
- ✅ **Dashboard moved to Cloudflare Pages + Access.** `https://eaton-ehs-cmd.pages.dev`,
  gated by the `eaton cmd` policy (email allow-list). No token in the served HTML —
  it prompts once and stores in the browser. Verified: unauthenticated request → 302 to
  Access login.

## Remaining
- [ ] **Re-upload `chat-sync/` to the Claude.ai project** — `project-instructions.md`,
  `skill-morning.md`, `skill-status.md` (rotated token note + `/brief`/`/pulse`). Web UI only.
- [ ] **Decommission the old Netlify site** `eaton-ehs-cmd.netlify.app` (optional — harmless
  now, no token, but stale).

## Optional / nice-to-have
- [ ] `infra/env.sh` → set `EATON_TOKEN` to the rotated value (only if you run skills via CLI).
- [ ] Redeploy to populate `git_sha` (cosmetic — drift check). Two-line form:
  `GIT_SHA=$(git rev-parse --short HEAD)` then `npx wrangler deploy --var GIT_SHA:"$GIT_SHA"`.
