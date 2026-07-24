#!/usr/bin/env bash
# Eaton EHS Worker — single source of truth for token + URL.
# Source this in skills: `source ~/projects/eaton-ehs-project/infra/env.sh`
# On token rotation: the Worker checks the Secrets Store secret EATON_TOKEN
# (bound as AUTH_TOKEN), NOT the per-Worker API_TOKEN var. Update BOTH the
# Secrets Store value AND this file to the same string.

export EATON_TOKEN='Karwji0lZdieLGNIMXfyIuwjBwBa'
export EATON_API='https://eaton-ehs-api.cball8475.workers.dev'

# Cloudflare — wrangler auth for deploys + worker secret puts.
# CLOUDFLARE_API_TOKEN is NOT stored here: GitHub push protection rejects commits
# containing cfat_ tokens. It lives in the Claude Code environment variables
# (claude.ai/code → environment settings), which every session exports automatically.
# Locally it's in Charlie's wrangler config. Account ID is not a secret:
export CLOUDFLARE_ACCOUNT_ID='37821191a8c1419e055c2c0a30546589'

# Usage examples:
#   eaton /stats | jq .
#   eaton "/tasks?status=todo&ownership=mine" | jq .
#   eaton /tasks -X POST -H 'Content-Type: application/json' -d '{"title":"..."}'
eaton() {
  local path="$1"; shift
  curl -s -H "Authorization: Bearer $EATON_TOKEN" "$EATON_API$path" "$@"
}
