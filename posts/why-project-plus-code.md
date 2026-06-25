# I added Claude Code to my 3-layer system. Here's what changed.

Two weeks ago I posted about a [3-layer system I'd built in Claude Projects](https://www.reddit.com/r/claude/comments/1tf2lf5/i_built_a_3layer_system_in_claude_projects_that/) to run my EHS manager job. `.md` files for stable knowledge. Cloudflare D1 + Worker for live state. Skill files as commands. Cadence held it together.

It worked. For about three more weeks. Then I hit walls.

This post is what I added, why, and what auditing my own system taught me.

---

## What broke

A few things, all at once.

I tried to edit `/morning` and realized I couldn't. Project doesn't let you edit files in place — you delete, re-upload, and end up with `skill-morning-1-1-1.md` cluttering the Files panel. Skill iteration got painful enough that I stopped iterating.

The `.md` layer was drifting. When I audited it I found five reference files that had quietly gone stale — old snapshots of knowledge that D1 had long since outgrown, a context file duplicating my Project Instructions, an index describing a naming convention I'd abandoned. Same fact in three or four places, and I couldn't tell which copy was true.

My morning brief was getting expensive. `/morning` was pulling the full body of `/knowledge`, `/intel`, and `/people` every single time — about 180KB of payload just to count things `/stats` already had.

And when the Worker itself broke one day, I was stuck. From Project, the only option was paste-and-pray on curl commands. No file edits, no debugger, no `wrangler deploy`.

The 3-layer system wasn't wrong. It just couldn't operate on itself.

---

## What I added

Claude Code. Not as a replacement — as the second half.

Code is a desktop CLI. It runs bash. It edits files in place with precise diffs. It deploys Workers. The execution half I didn't have.

The 3-layer architecture didn't change. What changed is where each layer lives:

- **Layer 1** (the `.md` rules layer) now lives canonically in Code as `CLAUDE.md`. Project's Instructions field mirrors it.
- **Layer 2** (D1 + Worker) is unchanged. Both environments hit the same Worker URL.
- **Layer 3** (skills) exists in both, in two flavors. Code uses bash (`eaton /stats | jq .`). Project uses natural-language fetch instructions. Same logic, different syntax.

Plus one new piece: a `chat-sync/` folder in Code that holds Project-formatted versions of every skill. When I change a skill in Code, I regenerate `chat-sync/` and drag the changed files into Project's Files panel. Code is the source of truth. Project is the mirror. One-way sync, no merge nightmare.

That's it. Same architecture, two surfaces, one bridge.

---

## The rule that killed drift

The most important thing I learned auditing my own system:

**If a number can change, it doesn't go in the rules layer.**

My old `CLAUDE.md` had lines like "TRIR currently ~0.2 (1 recordable YTD)" and "21 WSRAs assigned, 6 complete." Three weeks later those numbers were wrong, and Claude was reading them as gospel.

Stripping snapshots out of the rules felt subtractive. It wasn't. It just stopped Claude from confidently repeating yesterday's numbers as today's.

Now: stable rules (role, targets, communication style, key people) stay in the `.md` layer. Live data (current TRIR, today's overdue count, observation counts) lives in D1, fetched at runtime via a new `/scoreboard` endpoint. I update the scoreboard once a week during Friday close — one PATCH, 30 seconds. The morning brief reads it.

---

## How the audit caught the rest

A `/audit` slash command runs every 21–30 days. It's the only command allowed to pull full bodies of `/knowledge` and `/intel`. Everything else uses filters.

The first run found contradictions in knowledge entries (same subject, conflicting detail — newer wins), name-variant duplicates (the same person stored under both a first name and a full name), tasks waiting on people who weren't in the directory, skill files referencing endpoints that no longer existed, and the bearer token hardcoded across eight files (rotation was a grep-and-replace nightmare).

Three fixes, in order of payoff:

1. Moved the token to one file — `infra/env.sh` — referenced by every skill. Rotation now takes 30 seconds.
2. Added `?since=`, `?fields=`, `?completed_since=`, and `?limit=` filters to every GET endpoint. The morning brief dropped from ~180KB to ~10KB.
3. Built the audit cadence loop — `/weekly` checks when `/audit` last ran. If it's been 21+ days, it nags me.

That second one is the unlock. Cheap incremental fetches mean skills can run frequently without burning context. Real-time becomes affordable.

---

## What real-time means here

Not push notifications and websockets. Information that matches reality, arriving when I need it, without me having to ask.

What's live: filter-driven skills that pull deltas instead of full bodies, a scoreboard endpoint feeding live safety metrics into every brief, an audit cadence that flags drift before it accumulates.

What's coming: a daily cron at 6:45 AM ET that emails the morning brief to my phone before I leave the house, a 5-second GEMBA observation log from a phone bookmark, a dashboard ticker showing the last 10 changes across all tables.

None of it requires changing the architecture. New endpoints plug into the same Worker and become available in both environments at once.

---

## When to use which

If I'm capturing — observation mid-shift, transcript paste, quick `/tribal` between meetings — I reach for Project. Mobile, fast, no laptop required.

If I'm operating on the system itself — editing a skill, deploying the Worker, rotating a token, running the weekly audit, adding an endpoint — I reach for Code. Bash, files, parallelism.

The friction of being in the wrong tool is the signal. If I find myself pasting curl commands into Project, that's Code's job. If I'm trying to type a `/tribal` from my laptop while standing at a press brake, that's Project's job.

---

## What I'd tell someone reading the original post

Three things I wish I'd known.

Don't migrate to Code — add Code. The 3-layer system in Project is right; Code is the execution half, not a replacement. Project stays the capture surface, Code becomes the editing and deploying surface, and the same D1 backbone sits behind both.

Build the bridge before you have content in two places. A `chat-sync/` folder (or your equivalent) needs to exist from day one. If you wait until skills already exist in both environments, you'll spend a Saturday untangling them.

Strip snapshots from the rules layer immediately. "TRIR is 0.2" doesn't belong in your `.md` layer — it belongs in `/scoreboard`. Targets stay; current state moves to the database. Otherwise the rules layer rots, and Claude reads stale numbers as gospel.

---

## What it costs

Two surfaces to keep in sync isn't free. Every change in Code means ~2 minutes regenerating `chat-sync/` and re-uploading to Project. Token rotation is one file in Code but two places to update overall (env.sh and Project Instructions). Project can't execute bash, so skills there are 90% as good as Code, not 100% — good enough for mobile capture, not for deep analysis.

---

## TL;DR

The 3-layer system from the original post is still the foundation. I added Code as an execution surface and a `chat-sync/` folder as the bridge. Same architecture, two surfaces.

The hard part wasn't the tools. It was the discipline — one source of truth per layer, audit on a cadence, never let snapshots live in the rules. Once that's in place, the AI stops being a chat partner you have to remind. It becomes a system you can lean on.

Repo with genericized templates, updated to reflect the Code addition: [github.com/ballyhofam-bot/claude-project-os](https://github.com/ballyhofam-bot/claude-project-os)
