---
description: Process phone floor-form output — cross-check the machine's WSRA, flag new hazards, propose tasks.
---

Machine method sheet floor form. Arguments: $ARGUMENTS

## Setup
```bash
source infra/env.sh   # EATON_API + EATON_TOKEN + `eaton` helper (used in Step 2)
```

## If Charlie types `/floorform` with no paste:
Tell him to open the floor form on his phone browser (hosted from the project — see `tools/` floor form html). Fill it out at the machine, tap "Finish — Copy & Share", then paste the output back here.

## If Charlie pastes floor form output:
1. Parse the structured text
2. Cross-reference with the machine's existing WSRA:
   ```bash
   eaton "/knowledge?q=<machine_name>" | jq .
   ```
3. Flag any new hazards not in the current WSRA
4. Identify tribal knowledge from employee interviews
5. Summarize findings by priority
6. Ask Charlie which items should become tasks in D1

## Rules
- Don't rebuild the form. Don't modify it. Just process the output.
- Double-dip strategy: method sheet data feeds both the 30-day deliverable AND WSRA reviews.
