#!/usr/bin/env bash
# Eaton EHS Worker — single source of truth for token + URL.
# Source this in skills: `source ~/projects/eaton-ehs-project/infra/env.sh`
# On token rotation, update ONLY this file.

export EATON_TOKEN='9Cls9a9wbMexRkwkvy0dpmxPfS4zLM7OFepPYCu-VDA'
export EATON_API='https://eaton-ehs-api.cball8475.workers.dev'

# Usage examples:
#   eaton /stats | jq .
#   eaton "/tasks?status=todo&ownership=mine" | jq .
#   eaton /tasks -X POST -H 'Content-Type: application/json' -d '{"title":"..."}'
eaton() {
  local path="$1"; shift
  curl -s -H "Authorization: Bearer $EATON_TOKEN" "$EATON_API$path" "$@"
}
