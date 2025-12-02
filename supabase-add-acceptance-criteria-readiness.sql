-- Migration: Add Acceptance Criteria and Readiness Score to Task table
-- Created: 2025-12-02
-- Description: Adds acceptanceCriteria (TEXT) and readinessScore (INTEGER 0-100) columns

-- Add acceptanceCriteria column (stores markdown or JSON array of criteria)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'Task' AND column_name = 'acceptanceCriteria') THEN
        ALTER TABLE "Task" ADD COLUMN "acceptanceCriteria" TEXT;
    END IF;
END $$;

-- Add readinessScore column (0-100 percentage)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'Task' AND column_name = 'readinessScore') THEN
        ALTER TABLE "Task" 
        ADD COLUMN "readinessScore" INTEGER DEFAULT 0 
        CHECK ("readinessScore" >= 0 AND "readinessScore" <= 100);
    END IF;
END $$;

-- Add index for filtering by readiness score
CREATE INDEX IF NOT EXISTS "Task_readinessScore_idx" ON "Task"("readinessScore");

-- Add comments for documentation
COMMENT ON COLUMN "Task"."acceptanceCriteria" IS 'Acceptance criteria for the task/epic (markdown or JSON format)';
COMMENT ON COLUMN "Task"."readinessScore" IS 'Calculated readiness score (0-100%) based on completeness of required fields';

-- Create function to calculate readiness score
CREATE OR REPLACE FUNCTION calculate_readiness_score(task_record "Task")
RETURNS INTEGER AS $$
DECLARE
    score INTEGER := 0;
BEGIN
    -- Title (10 points - always present due to NOT NULL)
    IF task_record.title IS NOT NULL AND task_record.title != '' THEN
        score := score + 10;
    END IF;
    
    -- Description (15 points)
    IF task_record.description IS NOT NULL AND task_record.description != '' THEN
        score := score + 15;
    END IF;
    
    -- Department (10 points)
    IF task_record.department IS NOT NULL AND task_record.department != '' THEN
        score := score + 10;
    END IF;
    
    -- Priority (15 points)
    IF task_record.priority IS NOT NULL THEN
        score := score + 15;
    END IF;
    
    -- Business Value (15 points)
    IF task_record."businessValue" IS NOT NULL AND task_record."businessValue" != '' THEN
        score := score + 15;
    END IF;
    
    -- Estimated Effort (10 points)
    IF task_record."estimatedEffort" IS NOT NULL AND task_record."estimatedEffort" > 0 THEN
        score := score + 10;
    END IF;
    
    -- Budget Estimate (10 points)
    IF task_record."budgetEstimate" IS NOT NULL AND task_record."budgetEstimate" > 0 THEN
        score := score + 10;
    END IF;
    
    -- Acceptance Criteria (10 points)
    IF task_record."acceptanceCriteria" IS NOT NULL AND task_record."acceptanceCriteria" != '' THEN
        score := score + 10;
    END IF;
    
    -- Due Date (5 points)
    IF task_record."dueDate" IS NOT NULL THEN
        score := score + 5;
    END IF;
    
    -- Start Date (5 points)
    IF task_record."startDate" IS NOT NULL THEN
        score := score + 5;
    END IF;
    
    RETURN score;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create trigger to automatically update readiness score
CREATE OR REPLACE FUNCTION update_readiness_score()
RETURNS TRIGGER AS $$
BEGIN
    NEW."readinessScore" := calculate_readiness_score(NEW);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if it exists, then create it
DROP TRIGGER IF EXISTS task_readiness_score_trigger ON "Task";
CREATE TRIGGER task_readiness_score_trigger
    BEFORE INSERT OR UPDATE ON "Task"
    FOR EACH ROW
    EXECUTE FUNCTION update_readiness_score();

-- Update existing tasks to calculate their readiness scores
UPDATE "Task" SET "readinessScore" = calculate_readiness_score("Task".*);