---
description: Process machine method-sheet floor-form output; cross-ref WSRA
---

Machine method sheet floor form.

## If Charlie types `/floorform` with no paste:
Tell him to open the floor form on his phone browser (hosted from the project — see `tool-floor-form.html`). Fill it out at the machine, tap "Finish — Copy & Share", then paste the output back here.

## If Charlie pastes floor form output:
1. Parse the structured text
2. Cross-reference with the machine's existing WSRA: `GET EATON_API/knowledge?q=<machine_name>` (use `EATON_TOKEN` from CLAUDE.md for auth)
3. Flag any new hazards not in the current WSRA
4. Identify tribal knowledge from employee interviews
5. Summarize findings by priority
6. Ask Charlie which items should become tasks in D1

## Rules
- Don't rebuild the form. Don't modify it. Just process the output.
- Double-dip strategy: method sheet data feeds both the 30-day deliverable AND WSRA reviews.
