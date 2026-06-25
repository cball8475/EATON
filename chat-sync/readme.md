# Claude Chat Sync — May 27 update

Apply the 12 improvements from this morning's session to your Claude Chat project. Estimated time: 10 min of clicking.

## Step 1: Open your Eaton EHS project in Claude Chat

claude.ai → Projects → Eaton EHS Command Center

## Step 2: Delete stale files

In the project Files panel, **delete** these (they're either duplicates of Project Instructions or pre-D1 snapshots):

- `ref-context.md` (or `context.md` — any naming variant)
- `ref-project-instructions.md`
- `original-index.md` / `00-index.md` / `file-index.md`
- `kb-tribal-knowledge.md`
- `kb-people-intel.md`

If any of those names don't exist, skip them — they may already be gone.

## Step 3: Replace Project Instructions

Open project settings → Project Instructions. **Replace the entire content** with the contents of [`project-instructions.md`](project-instructions.md) in this folder. Save.

The new instructions:
- Reference the bearer token by name (`EATON_TOKEN`) instead of inline literals
- Document the v3.4.0 filter params (`?since=`, `?completed_since=`, `?fields=`, `?limit=`)
- Strip drift-prone numbers (TRIR current, WSRA completion count)
- Add the Memory Architecture rule (D1 is authoritative, Project Instructions for stable rules, kb/lessons.md for failures)

## Step 4: Replace skill files

Upload these files from this folder to your Chat project Files panel. If a same-name file exists, replace it. The Chat versions use natural-language fetch instructions instead of bash — they work with Chat's built-in HTTP fetch.

| Upload | Replaces |
|---|---|
| `skill-morning.md` | `skill-morning-1.md` / `skill-morning.md` |
| `skill-weekly.md` | `skill-weekly.md` |
| `skill-audit.md` | **new file** — the full-body audit, split out of weekly |
| `skill-kate-prep.md` | `skill-kate-prep.md` |
| `skill-close.md` | `skill-close.md` |
| `skill-status.md` | `skill-status.md` |
| `skill-tribal.md` | `skill-tribal.md` |
| `skill-debrief.md` | `skill-debrief.md` |
| `skill-floorform.md` | `skill-floorform.md` |

## Step 5 (optional): Upload Worker routes index

If you ever ask Chat to edit the Worker code, upload `infra-worker-routes.md` so it can navigate the 38K file by line range instead of dumping the whole thing into context.

## What's covered

| # | Item | How it's applied |
|---|---|---|
| 1 | Ref docs duplicates | Step 2 — delete stale files |
| 2 | `/morning` over-fetching | Step 4 — new skill-morning.md |
| 3 | `/weekly` over-fetching | Step 4 — new skill-weekly.md + new skill-audit.md |
| 4 | `/kate-prep` over-fetching | Step 4 — new skill-kate-prep.md |
| 5 | Bearer token centralized | Step 3 — Project Instructions references EATON_TOKEN by name |
| 6 | Stale kb snapshots | Step 2 — delete |
| 7 | CLAUDE.md drifting numbers | Step 3 — Project Instructions strips them |
| 8 | API filters (since/fields/limit/completed_since) | Already live in Worker v3.4.0; Project Instructions documents them |
| 9 | Composite `/brief` endpoint | Deferred — no action |
| 10 | Worker routes index | Step 5 — optional upload |
| 11 | `settings.local.json` | N/A — Claude Code only, no Chat equivalent |
| 12 | `/close` graceful degradation | Step 4 — new skill-close.md uses D1 deltas first, conversation second |

## Verification

After applying, type `/morning` in your Chat project. You should see:
- Brief composed from `/stats` + filtered task queries (not full bodies)
- New `🕓 AUDIT CADENCE` line in `/weekly` output
- `/close` referencing D1 deltas before conversation scan

## Re-sync going forward

When you make changes in Claude Code that should reach Chat, regenerate this folder:
1. Update the source files in `.claude/commands/`, `CLAUDE.md`, etc.
2. Ask Claude Code to refresh `chat-sync/` with the updated content
3. Re-upload to Chat
