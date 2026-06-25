# Eaton EHS — Claude Code Migration

## What This Is

Complete migration of your Claude.ai Eaton EHS project to Claude Code. Everything that was in the Claude.ai project — instructions, memories, skills, reference files — is here, reorganized for Claude Code's architecture.

## Directory Layout

```
eaton-ehs/
├── CLAUDE.md                    ← The big one. Replaces project instructions + memories.
│                                  Claude reads this at the start of every session.
├── .claude/
│   └── commands/                ← Your slash commands (same names, same behavior)
│       ├── morning.md           ← /morning
│       ├── debrief.md           ← /debrief [optional: name, "yesterday"]
│       ├── close.md             ← /close
│       ├── status.md            ← /status
│       ├── kate-prep.md         ← /kate-prep
│       ├── tribal.md            ← /tribal [paste notes]
│       ├── floorform.md         ← /floorform
│       └── weekly.md            ← /weekly
├── ref/                         ← Reference docs Claude can read
│   ├── context.md               ← Session briefing (who Charlie is, cadence, trajectory)
│   ├── eaton-stable.md          ← Stable Eaton reference (PPE, shifts, environmental, LSW)
│   ├── project-instructions.md  ← Original project instructions (infrastructure, people)
│   ├── debrief-protocol.md      ← Original debrief protocol
│   └── original-index.md        ← Original file index from Claude.ai project
├── infra/                       ← Infrastructure code
│   ├── worker-api.mjs           ← Live Cloudflare Worker source (deploy from here)
│   └── deploy-notes.md          ← Deploy patterns and gotchas
├── tools/                       ← Interactive tools
│   ├── floor-form.jsx           ← Machine method sheet (React artifact)
│   ├── floor-form.html          ← Same form as standalone HTML (use on phone)
│   └── 1on1-coach.jsx           ← 1-on-1 meeting prep coach
├── kb/                          ← Knowledge base
│   ├── lessons.md               ← Dead ends and mistakes (force-read at morning)
│   ├── tribal-knowledge-snapshot.md  ← Legacy snapshot (live data is in D1)
│   └── people-intel-snapshot.md      ← Legacy snapshot (live data is in D1)
├── setup.sh                     ← Bootstrap script with instructions
└── README.md                    ← This file
```

## Setup Steps

### 1. Install Claude Code
```bash
npm install -g @anthropic-ai/claude-code
```

Requires Node.js 18+. First run will prompt browser authentication.

### 2. Put This Directory Somewhere
```bash
# Example
mv eaton-ehs ~/projects/eaton-ehs
cd ~/projects/eaton-ehs
```

### 3. First Run
```bash
claude
```

Claude will read CLAUDE.md automatically. All your slash commands will be available immediately. Type `/morning` to test.

### 4. Add MCP Servers (Optional)

If you want Otter.ai, Cloudflare, etc. connected:
```bash
# Otter.ai (meeting transcripts)
claude mcp add --transport sse otter https://mcp.otter.ai/mcp

# Cloudflare (D1 database direct access)
claude mcp add --transport sse cloudflare https://bindings.mcp.cloudflare.com/mcp
```

Note: These may require OAuth authentication that differs from Claude.ai. The Worker API curl commands in CLAUDE.md and the slash commands work without MCP — they hit your API directly from the terminal. MCP is a nice-to-have, not a requirement.

### 5. Session Workflow

```bash
# Start fresh session
claude

# Resume last session
claude -c

# Start with an initial prompt
claude "run /morning"

# Use a specific model
claude --model claude-opus-4-6
```

## What Changed vs. Claude.ai

| Feature | Claude.ai | Claude Code |
|---------|-----------|-------------|
| Memory system | Auto-updating memories across sessions | CLAUDE.md (you update manually or ask Claude to) |
| Slash commands | Skill files in project | `.claude/commands/*.md` (same behavior) |
| Artifacts (React) | Rendered inline in chat | Local files — open in browser |
| MCP integrations | Connected via UI OAuth | `claude mcp add` (may need re-auth) |
| File editing | Claude edits project files in-chat | Claude edits files directly on disk |
| Deploys | Via MCP tools in chat | Via CLI (curl, wrangler, netlify) directly |
| D1 access | Via Worker API (curl) | Same — or direct via Cloudflare MCP |
| Web search | Built-in | Available but different |
| Session continuity | New context each chat | `claude -c` resumes last session |

## Key Differences to Know

1. **No auto-memory.** CLAUDE.md is your memory. If something important changes (WSRA count, new people, worker version), tell Claude to update CLAUDE.md or do it yourself.

2. **Slash commands use `$ARGUMENTS`.** `/debrief Kate` works — the word "Kate" gets passed as `$ARGUMENTS` in the command file.

3. **Claude can edit files directly.** It has full read/write access to this directory. It can `curl` your Worker API, run `wrangler` commands, deploy to Netlify — all from the terminal.

4. **No artifact rendering.** The floor form and 1-on-1 coach JSX files are here as reference. Open the HTML version of the floor form in your phone browser. The JSX files could be served from a local dev server if you want.

5. **You can run both.** Claude.ai project and Claude Code can coexist. D1 is the shared source of truth. Use whichever fits the moment — Claude.ai for mobile/quick checks, Claude Code for heavy lifting and deploys.
