-- Migration for worker v3.9.0 — intel supersede parity
-- Database: eaton-ehs-dashboard (62ce85d7-0cc1-4832-aa57-d5b09ceaa132)
--
-- HOW TO RUN: same rule as v3.8.0 — D1 wants ALTERs run individually:
--   npx wrangler d1 execute eaton-ehs-dashboard --remote -y --command "<one statement>"
-- (or --file this migration; if the batch errors on the ALTERs, run them one
-- at a time). The worker degrades gracefully until this runs.

ALTER TABLE people_intel ADD COLUMN superseded_by INTEGER;

ALTER TABLE people_intel ADD COLUMN confidence TEXT;
