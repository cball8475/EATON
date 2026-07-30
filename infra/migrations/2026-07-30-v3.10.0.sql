-- v3.10.0 — automated weekly reflections with loud gap detection
--
-- The reflection was only ever written by Step 7b of the manual /weekly
-- command. Miss a Friday and nothing anywhere noticed: 1 row total, last one
-- 2026-07-01, ~8 weeks absent — and it is the influence-vs-execution record
-- Laura tracks for succession, so it is the worst artifact to lose silently.
--
-- `status` distinguishes a cron-generated draft from one Charlie has reviewed:
--   'auto-draft' — written by the Friday cron from that week's real signals,
--                  awaiting revision. Its existence guarantees the record is
--                  never silently missing; it does NOT count as reviewed.
--   'confirmed'  — Charlie has revised or authored it.
--
-- Existing rows are back-labelled 'confirmed' because every one of them was
-- authored through /weekly with Charlie in the loop. Nothing is invented here:
-- the missing weeks stay missing and are reported by /reflections/health.
--
-- Run each statement individually — D1 rejects batched ALTER TABLE.

ALTER TABLE weekly_reflections ADD COLUMN status TEXT DEFAULT 'confirmed';

UPDATE weekly_reflections SET status = 'confirmed' WHERE status IS NULL;

CREATE INDEX IF NOT EXISTS idx_reflections_week_of ON weekly_reflections(week_of);
