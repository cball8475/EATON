# Claude Chat Sync — DORMANT (no Chat project exists)

> **2026-07-23:** Charlie confirmed there is no Claude.ai Eaton EHS Chat project.
> This folder is kept as a template for if/when one is created — the files below
> are current as of worker v3.9.0. Do NOT spend session time refreshing this
> folder unless a Chat project actually exists.

# Claude Chat Sync — July 23 update (v3.9.0 + token rotation)

Apply the v3.8.0→v3.9.0 memory-system upgrade to the Claude Chat project. **Do Step 1 first — the Chat project is broken until the token updates.** Estimated time: 5 min.

## Step 1: Replace Project Instructions (URGENT — carries the rotated token)

The API bearer token was rotated on 2026-07-23 (it had been leaking from the public dashboard). The Chat project's old instructions carry a dead token — every API call 401s until this is replaced.

Open project settings → Project Instructions → **replace the entire content** with [`project-instructions.md`](project-instructions.md) from this folder. Save.

What changed besides the token:
- Endpoint list now includes `/search` (fts/semantic/hybrid), `/trends`, `/brief`, `/pulse`, `/reflections`, `/knowledge/:id/related`, `/backup/run`
- Recall rule: "what do we know about X" → `/search?mode=hybrid` first
- Conflict + supersede rules for knowledge AND intel
- Worker version is read from `/health`, never hardcoded

## Step 2: Replace updated skill files

| Upload | What changed |
|---|---|
| `skill-close.md` | Handles `conflicts`/`has_conflicts` on knowledge + intel POSTs |
| `skill-tribal.md` | Same conflict flow — supersede the loser, never leave two live entries disagreeing |
| `skill-weekly.md` | Pulls `/trends?weeks=12` for goal trajectory |
| `skill-audit.md` | Step 0 version/backup check; `include_superseded=1` pulls; supersede-not-delete resolution |

Unchanged (no re-upload needed): `skill-morning.md`, `skill-status.md`, `skill-kate-prep.md`, `skill-debrief.md`, `skill-floorform.md`.

## Step 3: Verify

In the Chat project:
1. Ask "what do we know about Gloria?" — should hit `/search`, not full `/intel` dumps.
2. `/weekly` — output should include trajectory lines from `/trends`.
3. `/tribal` a test note with a subject that already exists — should surface the conflict and offer supersede.

## Re-sync going forward

When Claude Code changes the memory system, regenerate this folder:
1. Update the source files (`.claude/commands/`, `claude.md`, worker)
2. Ask Claude Code to refresh `chat-sync/` with the updated content
3. Re-upload to Chat per this readme
