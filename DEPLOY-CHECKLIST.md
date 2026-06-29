# Tonight's deploy checklist — from the 2026-06-29 chat session

You're on Claude Code at the desktop. These are the items that needed a machine/credentials
the chat surface couldn't reach. Branch: `claude/eaton-setup-improvements-wvi10n`.

## Already done (verified — no action)
- ✅ **Token rotated.** The live secret is the Secrets Store value bound as `AUTH_TOKEN`
  (Secrets Store secret `EATON_TOKEN`). Old token now returns 401, rotated token returns 200.
- ✅ **`#389` fixed.** "Build storeroom spool WSRA" status `investigation` → `wip`, applied
  directly to D1. Whole tasks table scanned — no other invalid enum values.

## To do tonight
1. **Deploy Worker v3.7.0**
   ```bash
   cd infra
   export XDG_CONFIG_HOME="$HOME/.wrangler-config"
   GIT_SHA=$(git rev-parse --short HEAD) npx wrangler deploy --var GIT_SHA:"$GIT_SHA"
   curl -s https://eaton-ehs-api.cball8475.workers.dev/health   # expect version 3.7.0 + git_sha
   ```
   ⚠ Before/after: confirm the **`AUTH_TOKEN` Secrets Store binding survives the deploy**
   (worker → Bindings tab). If wrangler drops it, auth falls back to the `API_TOKEN` secret —
   which you also set to the rotated value, so it still works, but fill in `store_id` +
   `secret_name` in `infra/wrangler.toml` to keep the binding explicit.

2. **Update local `infra/env.sh`** → set `EATON_TOKEN` to the rotated token (the value you
   saved in Cloudflare / Project Instructions today). The file is gitignored; don't commit it.

3. **Stand up the dashboard on Cloudflare Pages + Access** — steps in `infra/deploy-notes.md`.
   The dashboard no longer hardcodes a token (it prompts once and stores in localStorage), so
   there's nothing secret to paste. Then decommission the public Netlify site.

4. **Re-upload `chat-sync/` to the Claude.ai project** — `project-instructions.md`,
   `skill-morning.md`, `skill-status.md` (now on `/brief` + `/pulse`). Drag-and-drop in the web UI.

## Verify after deploy
- `/status` and `/morning` in chat should use the single `/brief` / `/pulse` calls (no 404 fallback).
- Old token stays dead: `curl -H "Authorization: Bearer <old>" .../stats` → 401.

Delete this file once it's all done.
