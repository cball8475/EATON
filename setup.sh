#!/bin/bash
# Eaton EHS — Claude Code Project Bootstrap
# Run this from the directory where you want the project to live.
#
# Prerequisites:
#   - Node.js 18+ installed
#   - Claude Code installed: npm install -g @anthropic-ai/claude-code
#   - Authenticated: run `claude` once and follow the browser auth flow
#
# Usage:
#   cd ~/projects
#   bash setup.sh

set -e

PROJECT_DIR="eaton-ehs"

echo "=== Setting up Eaton EHS Claude Code project ==="

# Create directory structure
mkdir -p "$PROJECT_DIR"/{ref,infra,tools,kb,.claude/commands}

echo "✓ Directory structure created"

# If project files exist in current dir (from download), move them
# Otherwise, user needs to copy from Claude.ai project manually

# Check if CLAUDE.md exists (shipped with this package)
if [ -f "CLAUDE.md" ]; then
  cp CLAUDE.md "$PROJECT_DIR/"
  echo "✓ CLAUDE.md copied"
fi

# Copy command files if they exist
if [ -d ".claude/commands" ]; then
  cp .claude/commands/*.md "$PROJECT_DIR/.claude/commands/"
  echo "✓ Slash commands copied"
fi

echo ""
echo "=== MANUAL STEPS ==="
echo ""
echo "1. COPY PROJECT FILES from Claude.ai"
echo "   Download or copy these files into the project:"
echo ""
echo "   ref/"
echo "     ref-context-2.md        → ref/context.md"
echo "     ref-eaton-stable.md     → ref/eaton-stable.md"
echo "     eaton-project-instructions-v2.md → ref/project-instructions.md"
echo "     post-meeting-debrief.md → ref/debrief-protocol.md"
echo ""
echo "   infra/"
echo "     infra-worker-api.mjs    → infra/worker-api.mjs"
echo "     infra-deploy-notes.md   → infra/deploy-notes.md"
echo ""
echo "   tools/"
echo "     machine-method-sheet-form.jsx → tools/floor-form.jsx"
echo "     machine-method-sheet-form.html → tools/floor-form.html"
echo "     one-on-one-coach.jsx    → tools/1on1-coach.jsx"
echo ""
echo "   kb/"
echo "     kb-lessons.md           → kb/lessons.md"
echo "     kb-tribal-knowledge-1.md → kb/tribal-knowledge-snapshot.md"
echo "     kb-people-intel-1.md    → kb/people-intel-snapshot.md"
echo ""
echo "2. INSTALL CLAUDE CODE (if not already)"
echo "   npm install -g @anthropic-ai/claude-code"
echo "   claude  # first run — authenticate in browser"
echo ""
echo "3. ADD MCP SERVERS (optional — enhances capabilities)"
echo "   cd $PROJECT_DIR"
echo ""
echo "   # Otter.ai (for meeting transcripts)"
echo "   claude mcp add --transport sse otter https://mcp.otter.ai/mcp"
echo ""
echo "   # Cloudflare (for D1 queries and Worker deploys)"
echo "   claude mcp add --transport sse cloudflare https://bindings.mcp.cloudflare.com/mcp"
echo ""
echo "   # Note: Gmail, Google Calendar, Google Drive MCPs require OAuth."
echo "   # These work best in Claude.ai. From Claude Code, use curl/CLI instead:"
echo "   #   - Outlook is the work calendar (paste/screenshot)"
echo "   #   - Google Calendar is personal/family only"
echo "   #   - For Gmail, use the gmail MCP if auth works, otherwise curl"
echo ""
echo "4. START A SESSION"
echo "   cd $PROJECT_DIR"
echo "   claude"
echo ""
echo "   # Resume last session:"
echo "   claude -c"
echo ""
echo "   # Available commands:"
echo "   #   /morning    — morning brief"
echo "   #   /debrief    — post-meeting debrief"
echo "   #   /debrief Kate — debrief specific meeting"
echo "   #   /close      — session close"
echo "   #   /status     — quick status pulse"
echo "   #   /kate-prep  — Kate 1-on-1 prep"
echo "   #   /tribal     — quick knowledge capture"
echo "   #   /floorform  — floor form workflow"
echo "   #   /weekly     — Friday review"
echo ""
echo "=== Setup complete ==="
