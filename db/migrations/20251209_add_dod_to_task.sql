-- Add Definition of Done fields to Task table
-- Run this against your Supabase/Postgres database.

ALTER TABLE public."Task"
  ADD COLUMN IF NOT EXISTS "dodText" text NULL,
  ADD COLUMN IF NOT EXISTS "dodChecklist" jsonb NULL;

-- Optional: add indexes if you will query dodChecklist
-- CREATE INDEX IF NOT EXISTS idx_task_dodChecklist ON public."Task" USING gin("dodChecklist");

-- Backfill example (optional): copy acceptanceCriteria text into dodText for epics
-- UPDATE public."Task" SET "dodText" = "acceptanceCriteria" WHERE "taskType" = 'EPIC' AND "dodText" IS NULL AND "acceptanceCriteria" IS NOT NULL;

COMMIT;