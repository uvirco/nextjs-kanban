-- Migration: Add RACI Matrix and Stakeholder tables
-- Created: 2025-12-01
-- SAFE TO RUN MULTIPLE TIMES: Will drop and recreate existing objects

-- Drop existing types if they exist (safe to run multiple times)
DROP TYPE IF EXISTS "RACIRole" CASCADE;
DROP TYPE IF EXISTS "StakeholderType" CASCADE;
DROP TYPE IF EXISTS "NotificationPreference" CASCADE;
DROP TYPE IF EXISTS "TaskType" CASCADE;

-- Create enum for RACI roles
CREATE TYPE "RACIRole" AS ENUM ('RESPONSIBLE', 'ACCOUNTABLE', 'CONSULTED', 'INFORMED');

-- Create enum for Stakeholder types
CREATE TYPE "StakeholderType" AS ENUM ('SPONSOR', 'APPROVER', 'INFORMED', 'CONSULTED', 'EXECUTIVE');

-- Create enum for Notification preferences
CREATE TYPE "NotificationPreference" AS ENUM ('ALL', 'MAJOR', 'CRITICAL', 'NONE');

-- Create enum for Task types
CREATE TYPE "TaskType" AS ENUM ('EPIC', 'STORY', 'TASK', 'SUBTASK', 'BUG');

-- Add taskType to Task table (only if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Task' AND column_name = 'taskType') THEN
        ALTER TABLE "Task" ADD COLUMN "taskType" "TaskType" DEFAULT 'TASK';
    END IF;
END $$;

-- Make columnId nullable for epics (epics don't belong to columns)
ALTER TABLE "Task" ALTER COLUMN "columnId" DROP NOT NULL;

-- Drop existing tables if they exist (safe to run multiple times)
DROP TABLE IF EXISTS "RACIMatrix" CASCADE;
DROP TABLE IF EXISTS "Stakeholder" CASCADE;
DROP TABLE IF EXISTS "EpicMember" CASCADE;

-- Create RACI Matrix table for epics
CREATE TABLE "RACIMatrix" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "epicId" TEXT NOT NULL REFERENCES "Task"("id") ON DELETE CASCADE,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "role" "RACIRole" NOT NULL,
  "notes" TEXT,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE("epicId", "userId", "role")
);

-- Create Stakeholder table
CREATE TABLE "Stakeholder" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "taskId" TEXT NOT NULL REFERENCES "Task"("id") ON DELETE CASCADE,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "stakeholderType" "StakeholderType" NOT NULL,
  "notificationPreference" "NotificationPreference" DEFAULT 'ALL',
  "notes" TEXT,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE("taskId", "userId")
);

-- Create EpicMember table for epic team management
CREATE TABLE "EpicMember" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "epicId" TEXT NOT NULL REFERENCES "Task"("id") ON DELETE CASCADE,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "role" TEXT NOT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE("epicId", "userId")
);

-- Create indexes for performance
CREATE INDEX "RACIMatrix_epicId_idx" ON "RACIMatrix"("epicId");
CREATE INDEX "RACIMatrix_userId_idx" ON "RACIMatrix"("userId");
CREATE INDEX "RACIMatrix_role_idx" ON "RACIMatrix"("role");

CREATE INDEX "Stakeholder_taskId_idx" ON "Stakeholder"("taskId");
CREATE INDEX "Stakeholder_userId_idx" ON "Stakeholder"("userId");
CREATE INDEX "Stakeholder_stakeholderType_idx" ON "Stakeholder"("stakeholderType");

CREATE INDEX "EpicMember_epicId_idx" ON "EpicMember"("epicId");
CREATE INDEX "EpicMember_userId_idx" ON "EpicMember"("userId");

-- Add comments for documentation
COMMENT ON TABLE "RACIMatrix" IS 'Defines RACI (Responsible, Accountable, Consulted, Informed) roles for epic team members';
COMMENT ON TABLE "Stakeholder" IS 'Tracks stakeholders who need to be informed about task progress';
COMMENT ON TABLE "EpicMember" IS 'Manages team members assigned to epics with functional roles';
COMMENT ON COLUMN "Task"."taskType" IS 'Type of task: EPIC (large work), STORY (user story), TASK (standard), SUBTASK (child task), BUG (defect)';

-- Create dedicated Epics board and columns (only if they don't exist)
DO $$
DECLARE
    epics_board_id TEXT;
    current_user_id TEXT;
BEGIN
    -- Check if Epics board already exists
    SELECT id INTO epics_board_id FROM "Board" WHERE title = 'Epics' LIMIT 1;

    -- Create Epics board if it doesn't exist
    IF epics_board_id IS NULL THEN
        INSERT INTO "Board" (id, title, "backgroundUrl", "createdAt", "updatedAt")
        VALUES (gen_random_uuid()::text, 'Epics', 'https://images.unsplash.com/photo-1557683316-973673baf926?w=800&h=600&fit=crop', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING id INTO epics_board_id;

        -- Create columns for Epics board
        INSERT INTO "Column" (id, title, "boardId", "order", "createdAt", "updatedAt")
        VALUES
            (gen_random_uuid()::text, '📋 Backlog', epics_board_id, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
            (gen_random_uuid()::text, '🚀 Active', epics_board_id, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
            (gen_random_uuid()::text, '✅ Completed', epics_board_id, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
    END IF;

    -- Add all existing users as members of the Epics board (if not already members)
    FOR current_user_id IN SELECT id FROM "User" LOOP
        IF NOT EXISTS (SELECT 1 FROM "BoardMember" WHERE "boardId" = epics_board_id AND "userId" = current_user_id) THEN
            INSERT INTO "BoardMember" ("userId", "boardId", "role", "createdAt")
            VALUES (current_user_id, epics_board_id, 'member', CURRENT_TIMESTAMP);
        END IF;
    END LOOP;
END $$;
