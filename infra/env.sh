#!/usr/bin/env bash
# Eaton EHS Worker — token + URL for local use.
# Source this in skills: `source ~/projects/eaton-ehs-project/infra/env.sh`
#
# The Worker validates against the Secrets Store secret EATON_TOKEN (bound as
# AUTH_TOKEN), which is the single source of truth. This file no longer stores
# the token value — it reads it from your environment or from a gitignored
# secret file, so the bearer never lives in a tracked file again.
#
# Set the value once, in whichever you prefer:
#   export EATON_TOKEN=...                 # in your shell profile, OR
#   echo 'the-token' > ~/.fsc/eaton.token  # gitignored, mode 600
#
# On rotation, update the Secrets Store value and that one local location — not
# this file.

if [ -z "${EATON_TOKEN:-}" ] && [ -r "$HOME/.fsc/eaton.token" ]; then
  EATON_TOKEN="$(tr -d '[:space:]' < "$HOME/.fsc/eaton.token")"
  export EATON_TOKEN
fi

if [ -z "${EATON_TOKEN:-}" ]; then
  echo "env.sh: EATON_TOKEN is not set. Export it or put it in ~/.fsc/eaton.token" >&2
  echo "        (the Worker's source of truth is the Secrets Store secret EATON_TOKEN)." >&2
fi

export EATON_API='https://eaton-ehs-api.cball8475.workers.dev'

# Cloudflare — wrangler auth for deploys + worker secret puts.
# CLOUDFLARE_API_TOKEN is NOT stored here (GitHub push protection rejects cfat_
# tokens). Set it in your environment. Account ID is not a secret:
export CLOUDFLARE_ACCOUNT_ID='37821191a8c1419e055c2c0a30546589'

# Usage examples:
#   eaton /stats | jq .
#   eaton "/tasks?status=todo&ownership=mine" | jq .
#   eaton /tasks -X POST -H 'Content-Type: application/json' -d '{"title":"..."}'
eaton() {
  local path="$1"; shift
  curl -s -H "Authorization: Bearer $EATON_TOKEN" "$EATON_API$path" "$@"
}
