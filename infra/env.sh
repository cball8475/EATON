#!/usr/bin/env bash
# Eaton EHS Worker — single source of truth for token + URL.
# Source this in skills: `source ~/projects/eaton-ehs-project/infra/env.sh`
# On token rotation: the Worker checks the Secrets Store secret EATON_TOKEN
# (bound as AUTH_TOKEN), NOT the per-Worker API_TOKEN var. Update BOTH the
# Secrets Store value AND this file to the same string.

export EATON_TOKEN='eatonehs7k3mq9vt2rxdw8fp'
export EATON_API='https://eaton-ehs-api.cball8475.workers.dev'

# Usage examples:
#   eaton /stats | jq .
#   eaton "/tasks?status=todo&ownership=mine" | jq .
#   eaton /tasks -X POST -H 'Content-Type: application/json' -d '{"title":"..."}'
eaton() {
  local path="$1"; shift
  curl -s -H "Authorization: Bearer $EATON_TOKEN" "$EATON_API$path" "$@"
}
