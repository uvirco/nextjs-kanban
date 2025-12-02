-- Migration: Add Department table and update Task table
-- Created: 2025-12-01
-- Description: Replace department string field with proper Department table for better data integrity

-- Create Department table
CREATE TABLE "Department" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "name" TEXT NOT NULL UNIQUE,
  "description" TEXT,
  "managerId" TEXT REFERENCES "User"("id"),
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add departmentId column to Task table
ALTER TABLE "Task" ADD COLUMN "departmentId" TEXT REFERENCES "Department"("id");

-- Create index for performance
CREATE INDEX "Task_departmentId_idx" ON "Task"("departmentId");
CREATE INDEX "Department_managerId_idx" ON "Department"("managerId");

-- Add comments for documentation
COMMENT ON TABLE "Department" IS 'Organizational departments for better task categorization';
COMMENT ON COLUMN "Task"."departmentId" IS 'Reference to the department this task belongs to';

-- Insert some common departments (optional - can be customized)
INSERT INTO "Department" ("name", "description") VALUES
  ('Properties', 'Property management and real estate'),
  ('Operations', 'Core business operations'),
  ('Operations/Shea', 'Operations - Shea division'),
  ('Operations/Accreditations', 'Operations - Accreditation management'),
  ('Operations/Production', 'Operations - Production division'),
  ('R&D', 'Research and Development'),
  ('R&D Projects', 'R&D project management'),
  ('R&D Software', 'R&D software development'),
  ('Strategic Projects', 'Strategic initiative management'),
  ('HR', 'Human Resources'),
  ('HR Training', 'HR training and development')
ON CONFLICT ("name") DO NOTHING;

-- Optional: Migrate existing department string values to new Department table
-- This will only work if the existing department values match the inserted department names
DO $$
DECLARE
    dept_record RECORD;
BEGIN
    FOR dept_record IN
        SELECT DISTINCT "department" FROM "Task"
        WHERE "department" IS NOT NULL AND "department" != ''
    LOOP
        -- Update tasks to reference the department by ID
        UPDATE "Task"
        SET "departmentId" = (SELECT "id" FROM "Department" WHERE "name" = dept_record."department" LIMIT 1)
        WHERE "department" = dept_record."department";
    END LOOP;
END $$;

-- Drop the old department string column (after migration)
-- Note: Keep this commented until you're sure the migration worked
-- ALTER TABLE "Task" DROP COLUMN "department";