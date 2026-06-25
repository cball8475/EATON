#!/usr/bin/env bash
# Eaton EHS Worker — URL + token loader for CLI use.
# The token is NOT stored in this file (it used to be, and got committed to a
# public repo + shipped in the page source — see git history; that token has
# been rotated and is dead). Keep your live token OUT of version control.
#
# Put your current token in ~/.eaton_token (and chmod 600 it):
#     echo 'YOUR_NEW_TOKEN' > ~/.eaton_token && chmod 600 ~/.eaton_token
# Then: source this file.

export EATON_API='https://eaton-ehs-api.cball8475.workers.dev'
export EATON_TOKEN="${EATON_TOKEN:-$(cat ~/.eaton_token 2>/dev/null)}"

if [ -z "$EATON_TOKEN" ]; then
  echo "⚠ EATON_TOKEN is empty. Put your token in ~/.eaton_token (chmod 600)." >&2
fi

# Usage examples:
#   eaton /stats | jq .
#   eaton "/tasks?status=todo&ownership=mine" | jq .
#   eaton /tasks -X POST -H 'Content-Type: application/json' -d '{"title":"..."}'
eaton() {
  local path="$1"; shift
  curl -s -H "Authorization: Bearer $EATON_TOKEN" "$EATON_API$path" "$@"
}
