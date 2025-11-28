-- Supabase Migration: Convert Prisma Schema to SQL
-- Run this in Supabase SQL Editor to create all tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enums
CREATE TYPE "Role" AS ENUM ('member', 'owner');
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'MANAGER', 'MEMBER');
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE "RiskLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH');
CREATE TYPE "ActivityType" AS ENUM (
  'TASK_CREATED', 'TASK_UPDATED', 'TASK_MOVED', 'TASK_DELETED',
  'COMMENT_ADDED', 'BOARD_UPDATED', 'START_DATE_ADDED', 'START_DATE_UPDATED',
  'START_DATE_REMOVED', 'DUE_DATE_ADDED', 'DUE_DATE_UPDATED', 'DUE_DATE_REMOVED',
  'TASK_ASSIGNED', 'TASK_UNASSIGNED'
);

-- Create tables
CREATE TABLE "Account" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "providerAccountId" TEXT NOT NULL,
  "refresh_token" TEXT,
  "access_token" TEXT,
  "expires_at" INTEGER,
  "token_type" TEXT,
  "scope" TEXT,
  "id_token" TEXT,
  "session_state" TEXT,
  UNIQUE("provider", "providerAccountId")
);

CREATE TABLE "Session" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "sessionToken" TEXT UNIQUE NOT NULL,
  "userId" TEXT NOT NULL,
  "expires" TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE "User" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "name" TEXT,
  "email" TEXT UNIQUE,
  "emailVerified" TIMESTAMP WITH TIME ZONE,
  "image" TEXT,
  "password" TEXT,
  "role" "UserRole" DEFAULT 'MEMBER',
  "isActive" BOOLEAN DEFAULT true,
  "createdBy" TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE "VerificationToken" (
  "identifier" TEXT NOT NULL,
  "token" TEXT UNIQUE NOT NULL,
  "expires" TIMESTAMP WITH TIME ZONE NOT NULL,
  UNIQUE("identifier", "token")
);

CREATE TABLE "BoardMember" (
  "userId" TEXT NOT NULL,
  "boardId" TEXT NOT NULL,
  "role" "Role" NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY ("userId", "boardId")
);

CREATE TABLE "Board" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "title" TEXT NOT NULL,
  "backgroundUrl" TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE "BoardSettings" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "boardId" TEXT UNIQUE NOT NULL,
  "enablePriority" BOOLEAN DEFAULT true,
  "enableBusinessValue" BOOLEAN DEFAULT false,
  "enableEstimatedEffort" BOOLEAN DEFAULT false,
  "enableDependencies" BOOLEAN DEFAULT false,
  "enableBudgetEstimate" BOOLEAN DEFAULT false,
  "enableRiskLevel" BOOLEAN DEFAULT false,
  "enableStrategicAlignment" BOOLEAN DEFAULT false,
  "enableRoiEstimate" BOOLEAN DEFAULT false,
  "enableStageGate" BOOLEAN DEFAULT false,
  "enableTimeSpent" BOOLEAN DEFAULT false,
  "enableStoryPoints" BOOLEAN DEFAULT false,
  "enableWatchers" BOOLEAN DEFAULT false,
  "enableAttachments" BOOLEAN DEFAULT false,
  "enableSubtasks" BOOLEAN DEFAULT false,
  "defaultPriority" "Priority" DEFAULT 'MEDIUM',
  "defaultRiskLevel" "RiskLevel" DEFAULT 'LOW'
);

CREATE TABLE "Column" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "title" TEXT NOT NULL,
  "boardId" TEXT NOT NULL,
  "order" INTEGER NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE "Task" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "dueDate" TIMESTAMP WITH TIME ZONE,
  "startDate" TIMESTAMP WITH TIME ZONE,
  "coverImage" TEXT,
  "columnId" TEXT NOT NULL,
  "order" INTEGER NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "createdByUserId" TEXT NOT NULL,
  "priority" "Priority" DEFAULT 'MEDIUM',
  "businessValue" TEXT,
  "estimatedEffort" REAL,
  "budgetEstimate" REAL,
  "riskLevel" "RiskLevel" DEFAULT 'LOW',
  "strategicAlignment" TEXT,
  "roiEstimate" REAL,
  "stageGate" TEXT,
  "timeSpent" REAL DEFAULT 0,
  "storyPoints" INTEGER,
  "department" TEXT,
  "parentTaskId" TEXT
);

CREATE TABLE "TaskAssignment" (
  "userId" TEXT NOT NULL,
  "taskId" TEXT NOT NULL,
  PRIMARY KEY ("userId", "taskId")
);

CREATE TABLE "Invitation" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "boardId" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "token" TEXT UNIQUE NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "inviterId" TEXT NOT NULL,
  UNIQUE("boardId", "email")
);

CREATE TABLE "Label" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "title" TEXT,
  "color" TEXT NOT NULL,
  "isDefault" BOOLEAN DEFAULT false,
  "userId" TEXT NOT NULL,
  "boardId" TEXT NOT NULL
);

CREATE TABLE "Checklist" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "title" TEXT,
  "taskId" TEXT NOT NULL
);

CREATE TABLE "ChecklistItem" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "content" TEXT NOT NULL,
  "isChecked" BOOLEAN DEFAULT false,
  "checklistId" TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE "Attachment" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "filename" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "size" INTEGER,
  "mimeType" TEXT,
  "taskId" TEXT NOT NULL,
  "uploadedBy" TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE "TaskWatcher" (
  "userId" TEXT NOT NULL,
  "taskId" TEXT NOT NULL,
  PRIMARY KEY ("userId", "taskId")
);

CREATE TABLE "TaskDependency" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "taskId" TEXT NOT NULL,
  "dependsOnTaskId" TEXT NOT NULL,
  UNIQUE("taskId", "dependsOnTaskId")
);

CREATE TABLE "Activity" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "type" "ActivityType" NOT NULL,
  "content" TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "startDate" TIMESTAMP WITH TIME ZONE,
  "dueDate" TIMESTAMP WITH TIME ZONE,
  "userId" TEXT NOT NULL,
  "taskId" TEXT,
  "boardId" TEXT,
  "oldColumnId" TEXT,
  "newColumnId" TEXT,
  "originalColumnId" TEXT,
  "targetUserId" TEXT
);

-- Create foreign key constraints
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;
ALTER TABLE "BoardMember" ADD CONSTRAINT "BoardMember_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "Board"("id") ON DELETE CASCADE;
ALTER TABLE "BoardMember" ADD CONSTRAINT "BoardMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;
ALTER TABLE "BoardSettings" ADD CONSTRAINT "BoardSettings_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "Board"("id") ON DELETE CASCADE;
ALTER TABLE "Column" ADD CONSTRAINT "Column_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "Board"("id") ON DELETE CASCADE;
ALTER TABLE "Task" ADD CONSTRAINT "Task_columnId_fkey" FOREIGN KEY ("columnId") REFERENCES "Column"("id") ON DELETE CASCADE;
ALTER TABLE "Task" ADD CONSTRAINT "Task_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE CASCADE;
ALTER TABLE "Task" ADD CONSTRAINT "Task_parentTaskId_fkey" FOREIGN KEY ("parentTaskId") REFERENCES "Task"("id");
ALTER TABLE "TaskAssignment" ADD CONSTRAINT "TaskAssignment_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE;
ALTER TABLE "TaskAssignment" ADD CONSTRAINT "TaskAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "Board"("id") ON DELETE CASCADE;
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_inviterId_fkey" FOREIGN KEY ("inviterId") REFERENCES "User"("id") ON DELETE CASCADE;
ALTER TABLE "Label" ADD CONSTRAINT "Label_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "Board"("id") ON DELETE CASCADE;
ALTER TABLE "Label" ADD CONSTRAINT "Label_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;
ALTER TABLE "Checklist" ADD CONSTRAINT "Checklist_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE;
ALTER TABLE "ChecklistItem" ADD CONSTRAINT "ChecklistItem_checklistId_fkey" FOREIGN KEY ("checklistId") REFERENCES "Checklist"("id") ON DELETE CASCADE;
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE;
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "User"("id");
ALTER TABLE "TaskWatcher" ADD CONSTRAINT "TaskWatcher_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE;
ALTER TABLE "TaskWatcher" ADD CONSTRAINT "TaskWatcher_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;
ALTER TABLE "TaskDependency" ADD CONSTRAINT "TaskDependency_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE;
ALTER TABLE "TaskDependency" ADD CONSTRAINT "TaskDependency_dependsOnTaskId_fkey" FOREIGN KEY ("dependsOnTaskId") REFERENCES "Task"("id") ON DELETE CASCADE;
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "Board"("id") ON DELETE CASCADE;
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_newColumnId_fkey" FOREIGN KEY ("newColumnId") REFERENCES "Column"("id");
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_oldColumnId_fkey" FOREIGN KEY ("oldColumnId") REFERENCES "Column"("id");
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_originalColumnId_fkey" FOREIGN KEY ("originalColumnId") REFERENCES "Column"("id");
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_targetUserId_fkey" FOREIGN KEY ("targetUserId") REFERENCES "User"("id");
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE;
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;

-- Create junction table for favorites (many-to-many relationship)
CREATE TABLE "_favorites" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- Create indexes for favorites junction table
CREATE UNIQUE INDEX "_favorites_AB_unique" ON "_favorites"("A", "B");
CREATE INDEX "_favorites_B_index" ON "_favorites"("B");

-- Add foreign key constraints for favorites
ALTER TABLE "_favorites" ADD CONSTRAINT "_favorites_A_fkey" FOREIGN KEY ("A") REFERENCES "Board"("id") ON DELETE CASCADE;
ALTER TABLE "_favorites" ADD CONSTRAINT "_favorites_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE;

-- Create junction table for labels on tasks (many-to-many relationship)
CREATE TABLE "_LabelToTask" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- Create indexes for label to task junction table
CREATE UNIQUE INDEX "_LabelToTask_AB_unique" ON "_LabelToTask"("A", "B");
CREATE INDEX "_LabelToTask_B_index" ON "_LabelToTask"("B");

-- Add foreign key constraints for label to task
ALTER TABLE "_LabelToTask" ADD CONSTRAINT "_LabelToTask_A_fkey" FOREIGN KEY ("A") REFERENCES "Label"("id") ON DELETE CASCADE;
ALTER TABLE "_LabelToTask" ADD CONSTRAINT "_LabelToTask_B_fkey" FOREIGN KEY ("B") REFERENCES "Task"("id") ON DELETE CASCADE;

-- Enable Row Level Security (RLS) for internal access
-- Note: For internal system, you may not need strict RLS policies
-- Uncomment and customize as needed

-- ALTER TABLE "Board" ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE "Task" ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;

-- Example RLS policies (customize for your needs):
-- CREATE POLICY "Users can view boards they are members of" ON "Board"
--   FOR SELECT USING (
--     auth.uid()::text IN (
--       SELECT "userId" FROM "BoardMember" WHERE "boardId" = "Board"."id"
--     )
--   );