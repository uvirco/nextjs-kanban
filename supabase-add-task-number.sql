-- Migration: Add task_number field to Task table
-- This adds a human-readable sequential task number for email integration and user references

-- Add the task_number column (4-byte integer)
ALTER TABLE "Task" 
ADD COLUMN "task_number" INTEGER;

-- Create a sequence for auto-incrementing task numbers
CREATE SEQUENCE task_number_seq START 1;

-- Set task_number for existing tasks (backfill with sequential numbers)
UPDATE "Task" 
SET "task_number" = nextval('task_number_seq')
WHERE "task_number" IS NULL;

-- Make task_number NOT NULL and UNIQUE after backfill
ALTER TABLE "Task" 
ALTER COLUMN "task_number" SET NOT NULL,
ADD CONSTRAINT task_number_unique UNIQUE ("task_number");

-- Set default value for new tasks to use the sequence
ALTER TABLE "Task" 
ALTER COLUMN "task_number" SET DEFAULT nextval('task_number_seq');

-- Create an index for fast lookups by task_number
CREATE INDEX idx_task_number ON "Task" ("task_number");

-- Optional: Create a function to format task number as "TASK-123"
CREATE OR REPLACE FUNCTION get_task_reference(task_num INTEGER)
RETURNS TEXT AS $$
BEGIN
  RETURN 'TASK-' || task_num;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON COLUMN "Task"."task_number" IS 'Human-readable sequential task number for email references and user display';
