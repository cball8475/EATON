# Migrating Eaton EHS Command Center to Claude Code

This repo is the Claude.ai project rebuilt for Claude Code. Everything that lived in Project
Instructions, the skill files, and the reference docs is here, converted to Claude Code's mechanics.

## What maps to what

| Claude.ai project thing            | Claude Code equivalent                          |
|------------------------------------|-------------------------------------------------|
| Project Instructions (work)        | `CLAUDE.md` (repo root — auto-loaded)           |
| User Preferences (personal/family) | `~/.claude/CLAUDE.md` (user scope — see note)   |
| `skill-*.md` (slash-invoked)       | `.claude/commands/*.md` → `/name`               |
| `_grill-me` (auto-trigger)         | `.claude/skills/grill-me/SKILL.md`              |
| Token in Project Instructions      | `.claude/eaton.env` (gitignored, one place)     |
| MCP connectors                     | `.mcp.json` (Cloudflare, Otter, Netlify)        |
| Dashboard / Worker / form artifacts| `tools/`, `worker/`                             |
| Reference + lessons                | `reference/`                                    |

## Command inventory (11 slash + 1 skill)

`/morning /status /capture /tribal /debrief /floorform /forklift /kate-prep /weekly /close /audit`
plus the auto-triggered **grill-me** skill. Each file already uses `$ARGUMENTS` where relevant, so
they work as native Claude Code commands with no rewrite. During conversion, every
"Project Instructions" reference inside the command bodies was rewritten to "CLAUDE.md."

## Setup (once)

```bash
# 1. Put the repo somewhere and open it in Claude Code
cd eaton-ehs-cmd
claude

# 2. Confirm the token file is present and gitignored
cat .claude/eaton.env        # should show EATON_TOKEN
git status                   # eaton.env should NOT appear

# 3. Connect the remote MCP servers (OAuth — opens a browser on first use)
#    They're declared in .mcp.json; approve them when Claude Code prompts,
#    or add manually:
claude mcp add --transport http cloudflare https://bindings.mcp.cloudflare.com/mcp
claude mcp add --transport http otter      https://mcp.otter.ai/mcp
claude mcp add --transport http netlify    https://netlify-mcp.netlify.app/mcp

# 4. Smoke test
/status        # should hit /pulse and print counts
```

## Security note (one deliberate change)

In the old project the bearer token sat in plaintext Project Instructions. Here it moved to
`.claude/eaton.env`, which `.gitignore` excludes. That keeps the "one place to rotate" rule while
keeping the token out of any commit. If you push this repo to GitHub, the token stays local.
Rotate in that file and nowhere else.

## Things to check / decide (naming + scope drift found during conversion)

- **Floor form filename:** `.claude/commands/floorform.md` refers to `tool-floor-form.html`, but the
  actual file shipped as `tools/machine-method-sheet-form.html`. Either rename the file or update the
  one reference in `floorform.md`.
- **Two identical infra notes:** `deploy-notes.md` and `infra-deploy-notes.md` were byte-identical;
  only the reference copy is kept. The Netlify site (`eaton-ehs-cmd.netlify.app`) and the Pages
  dashboard (`eaton-ehs-cmd.pages.dev`) are both live — confirm which one you're standardizing on.
- **Personal preferences:** your family/calendar/job-search/Florence-SC content is *not* in this
  work repo. Put it at user scope in `~/.claude/CLAUDE.md` so it applies across all your Claude Code
  projects, not just Eaton. Keeping it out of this repo also keeps it out of any shared push.
- **Florence skills stay separate:** `fsctodo` and `fsc-credentials` are user-level skills tied to
  Florence SC Services, not Eaton. Leave them at `~/.claude/skills/`, not here.
- **Worker deploy:** `worker/worker-api.mjs` is the source (header says v3.4.0, but `GET /health` is
  the real deployed version). To redeploy you'll need `wrangler` + a `wrangler.toml` binding DB →
  `62ce85d7-0cc1-4832-aa57-d5b09ceaa132` and the secrets `API_TOKEN`, `ANTHROPIC_API_KEY`. Not
  included here — add if you plan to deploy from this repo.

## Behavioral differences to expect

- Claude Code executes shell directly — the `curl … "$EATON_API/..."` calls in the commands run
  natively instead of through the artifact sandbox. Faster, but the `User-Agent: curl/8.4.0` header
  is still mandatory (Cloudflare WAF).
- Otter over MCP still has the same reliability quirks (empty returns, wrong names, offset
  timestamps). Manual paste remains the fallback, exactly as `/debrief` already says.
- `/close` and `/morning` read `reference/kb-lessons.md` from disk — no upload step needed anymore.
