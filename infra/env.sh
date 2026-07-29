#!/usr/bin/env bash
# Eaton EHS Worker — token + URL for local shells and Claude sessions.
#
# Source of truth for the bearer: Cloudflare Secrets Store secret EATON_TOKEN
# (bound into the worker as AUTH_TOKEN). Rotate it ONLY with the
# "Rotate EATON API token" GitHub Actions workflow (.github/workflows/
# rotate-token.yml) — it updates Secrets Store, the API_TOKEN fallback, and the
# D1 self-serve copy together, then verifies the old value is dead.
#
# Resolution order here (first hit wins):
#   1. EATON_TOKEN already exported in the environment
#   2. ~/.fsc/eaton.token — gitignored cache file, mode 600
#   3. Fetched from D1 app_config over the Cloudflare API, when
#      CLOUDFLARE_API_TOKEN is set (Charlie's local shells) — then cached to (2)
#
# Claude cloud sessions have NO CLOUDFLARE_API_TOKEN (confirmed 2026-07-25 —
# fsc-credentials registry §6), so (3) can't run there. Bootstrap instead with
# the Cloudflare MCP connector every session already has:
#   d1_database_query on db 62ce85d7-0cc1-4832-aa57-d5b09ceaa132:
#     SELECT value FROM app_config WHERE key='EATON_TOKEN';
#   write the value to ~/.fsc/eaton.token (chmod 600), then source this file.
#
# After a rotation, a cached token starts returning 401 — run
# eaton_refresh_token to drop the cache and re-resolve.

export EATON_API='https://eaton-ehs-api.cball8475.workers.dev'
export CLOUDFLARE_ACCOUNT_ID='37821191a8c1419e055c2c0a30546589'
EATON_D1_ID='62ce85d7-0cc1-4832-aa57-d5b09ceaa132'

# Pull the single value out of the D1 query response without depending on any
# one JSON tool being installed (jq → python3 → grep -oP).
_eaton_json_extract_value() {
  if command -v jq >/dev/null 2>&1; then
    jq -r '.result[0].results[0].value // empty' 2>/dev/null
  elif command -v python3 >/dev/null 2>&1; then
    python3 -c 'import sys,json
try:
  print(json.load(sys.stdin)["result"][0]["results"][0]["value"])
except Exception:
  pass' 2>/dev/null
  else
    grep -oP '"value":"\K[^"]+' 2>/dev/null | head -1
  fi
}

# (3) — local shells only; cloud sessions lack CLOUDFLARE_API_TOKEN.
_eaton_fetch_token_from_d1() {
  [ -n "${CLOUDFLARE_API_TOKEN:-}" ] || return 1
  local tok
  tok=$(curl -s -m 15 -X POST \
    -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
    -H 'Content-Type: application/json' \
    -d "{\"sql\":\"SELECT value FROM app_config WHERE key='EATON_TOKEN'\"}" \
    "https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/d1/database/$EATON_D1_ID/query" \
    | _eaton_json_extract_value)
  [ -n "$tok" ] || return 1
  mkdir -p "$HOME/.fsc" && chmod 700 "$HOME/.fsc"
  printf '%s' "$tok" > "$HOME/.fsc/eaton.token" && chmod 600 "$HOME/.fsc/eaton.token"
  EATON_TOKEN="$tok"
  export EATON_TOKEN
}

_eaton_resolve_token() {
  if [ -z "${EATON_TOKEN:-}" ] && [ -r "$HOME/.fsc/eaton.token" ]; then
    EATON_TOKEN="$(tr -d '[:space:]' < "$HOME/.fsc/eaton.token")"
    export EATON_TOKEN
  fi
  if [ -z "${EATON_TOKEN:-}" ]; then
    _eaton_fetch_token_from_d1 || true
  fi
  if [ -z "${EATON_TOKEN:-}" ]; then
    {
      echo "env.sh: EATON_TOKEN could not be resolved (no env var, no ~/.fsc/eaton.token,"
      echo "        no CLOUDFLARE_API_TOKEN to fetch it with)."
      echo "  Claude session fix — self-serve, do not ask Charlie to paste anything:"
      echo "    1. Cloudflare MCP d1_database_query, db 62ce85d7-0cc1-4832-aa57-d5b09ceaa132:"
      echo "       SELECT value FROM app_config WHERE key='EATON_TOKEN';"
      echo "    2. write the value to ~/.fsc/eaton.token (chmod 600)"
      echo "    3. source infra/env.sh again"
    } >&2
    return 1
  fi
}

# After a rotation: drop the stale cache and re-resolve from D1.
eaton_refresh_token() {
  rm -f "$HOME/.fsc/eaton.token"
  unset EATON_TOKEN
  _eaton_resolve_token
}

_eaton_resolve_token || true

# Usage examples:
#   eaton /stats | jq .
#   eaton "/tasks?status=todo&ownership=mine" | jq .
#   eaton /tasks -X POST -H 'Content-Type: application/json' -d '{"title":"..."}'
eaton() {
  local path="$1"; shift
  if [ -z "${EATON_TOKEN:-}" ]; then
    echo "eaton: no token — see the bootstrap steps env.sh printed above" >&2
    return 1
  fi
  curl -s -H "Authorization: Bearer $EATON_TOKEN" "$EATON_API$path" "$@"
}
