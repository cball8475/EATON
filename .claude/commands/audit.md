---
description: On-demand semantic audit (~monthly) — contradictions, drift, duplicates, orphans, cold relationships.
---

Full semantic audit + drift scan. Heavy data fetch — only run on demand, not weekly. Target cadence: every 21–30 days, or when something feels off.

## Step 0: Drift guard — is the deployed Worker the code in this repo?
```bash
source infra/env.sh   # EATON_API + EATON_TOKEN + `eaton` helper
eaton /health | jq .
git log --oneline -1 -- infra/worker-api.mjs
```
Compare `/health.git_sha` against repo history: `git branch -a --contains <git_sha>`.
- sha in current branch history and worker file unchanged since → ✓ in sync.
- sha unknown to the repo, or worker file has newer commits than the deployed sha → 🔴 DRIFT. The live worker and `infra/worker-api.mjs` have diverged — exactly what burned an hour on 2026-07-10 (kb/lessons.md). Flag it; reconcile before anyone edits or deploys the worker file.

## Step 0b: Backup verification (Monday cron, `0 12 * * 1`)
```bash
git fetch origin main -q && git log origin/main --oneline -3 -- infra/backups/auto/
```
A dated `d1-export-*.json.gz` should exist from the most recent Monday. Missing two Mondays running → 🔴 the backup cron or `GITHUB_BACKUP_TOKEN` is broken; verify with `eaton /backup/run -X POST`.

## Step 1: Pull full bodies (only here, not in /morning or /weekly)
```bash
eaton "/knowledge?include_superseded=1" | jq .
eaton /intel | jq .
eaton "/people?fields=id,name,department,area" | jq .
eaton "/tasks?waiting_on=any" | jq .
eaton "/tasks?status=todo" | jq .
```
This is the ONLY command that should ever fetch `/knowledge` and `/intel` full bodies. Everything else uses `?since=` + `?fields=`. Note `include_superseded=1` — the audit needs to see retired entries to verify supersede chains; normal reads never should.

## Step 2: Semantic checks
**Knowledge contradictions** — same `subject`, conflicting `detail`, where NEITHER row is superseded. Newer presumed correct; propose marking the older `superseded_by = <newer id>` (PATCH — keeps the chain auditable instead of deleting). Rows already superseded are resolved, not contradictions. Note: since v3.8.0 `POST /knowledge` returns same-subject conflicts at write time, so anything surfacing here leaked past a capture — check whether the capturing skill ignored the `conflicts` field.
**Intel conflicts** — same `person_name`, conflicting entries within the same `intel_type`, neither superseded. Newer wins — propose `superseded_by` PATCH on the older (v3.9.0+; same pattern as knowledge). POST /intel flags these at write time now, so anything here leaked past a capture. Audit pulls use `?include_superseded=1` to verify chains.
**Orphaned references** — for every open task with `waiting_on` set, check the name appears in the people list. Also flag tasks with `ai_extracted=true` that have **both** null `source_meeting_id` **and** null `source_label` (truly untraceable). Do NOT flag a task with a `source_label` but null `source_meeting_id` — Otter routinely returns empty meeting IDs, the label preserves provenance.
**Duplicates** — same `subject`+`area` in knowledge with overlapping `detail`. Same person under multiple name variants ("Gloria" vs "Gloria Carter").

## Step 3: Drift checks
**Stale knowledge** — entries older than 30 days with no newer entry on the same subject.
**Cold relationships** — key people (Kate, Laura, Gloria, all shift supervisors) with no intel entry in 21+ days.
**Skill drift** — scan `.claude/commands/*.md` and `chat-sync/skill-*.md` for references to deleted files, removed endpoints, stale field names. Flag any found.

## Step 4: Output — severity tagged
```
AUDIT — [Date]

🔧 INFRA:
  → Worker: [✓ in sync @ sha | 🔴 DRIFT — live sha X vs repo Y]
  → Backup: [✓ last Monday present | 🔴 missing since date]

🔴 CONTRADICTIONS / CONFLICTS:
  → [knowledge or intel that disagree — both, with IDs and dates]

🟡 STALE / DRIFT:
  → [stale knowledge, cold key relationships, command-file references to dead things]

🔵 CLEANUP:
  → [duplicates, name variants, orphaned references, ai_extracted with no source_meeting_id AND no source_label]

✓ HEALTHY:
  → [one-liner counts: knowledge OK / intel OK / orphans 0 / etc.]
```
Wait for Charlie's review before acting on any finding. Don't auto-delete or auto-merge.

## Step 5: Record the audit baseline
After Charlie reviews (regardless of whether findings are acted on):
```bash
eaton /knowledge -X POST -H 'Content-Type: application/json' -d '{
  "category":"metric","area":"workflow",
  "subject":"audit-baseline-YYYY-MM-DD",
  "detail":"[N] contradictions, [N] drift, [N] cleanup. Acted: [summary]",
  "source_label":"/audit run YYYY-MM-DD"
}' | jq .
```
This is what `/weekly` checks to decide whether to nag.

## Rules
- Never auto-act on findings. Always present, wait for approval, then push fixes.
- The audit-baseline entry MUST be written even if nothing changed — it's the cadence marker.
- If run twice in the same week, fine — most recent baseline wins.
- Findings reference IDs (`knowledge #142`, `intel #67`, `task #289`) so Charlie can act precisely.
