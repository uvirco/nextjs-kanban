-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "budgetEstimate" DOUBLE PRECISION,
ADD COLUMN     "businessValue" TEXT,
ADD COLUMN     "estimatedEffort" DOUBLE PRECISION,
ADD COLUMN     "parentTaskId" TEXT,
ADD COLUMN     "priority" "Priority" DEFAULT 'MEDIUM',
ADD COLUMN     "riskLevel" "RiskLevel" DEFAULT 'LOW',
ADD COLUMN     "roiEstimate" DOUBLE PRECISION,
ADD COLUMN     "stageGate" TEXT,
ADD COLUMN     "storyPoints" INTEGER,
ADD COLUMN     "strategicAlignment" TEXT,
ADD COLUMN     "timeSpent" DOUBLE PRECISION DEFAULT 0;

-- CreateTable
CREATE TABLE "BoardSettings" (
    "id" TEXT NOT NULL,
    "boardId" TEXT NOT NULL,
    "enablePriority" BOOLEAN NOT NULL DEFAULT true,
    "enableBusinessValue" BOOLEAN NOT NULL DEFAULT false,
    "enableEstimatedEffort" BOOLEAN NOT NULL DEFAULT false,
    "enableDependencies" BOOLEAN NOT NULL DEFAULT false,
    "enableBudgetEstimate" BOOLEAN NOT NULL DEFAULT false,
    "enableRiskLevel" BOOLEAN NOT NULL DEFAULT false,
    "enableStrategicAlignment" BOOLEAN NOT NULL DEFAULT false,
    "enableRoiEstimate" BOOLEAN NOT NULL DEFAULT false,
    "enableStageGate" BOOLEAN NOT NULL DEFAULT false,
    "enableTimeSpent" BOOLEAN NOT NULL DEFAULT false,
    "enableStoryPoints" BOOLEAN NOT NULL DEFAULT false,
    "enableWatchers" BOOLEAN NOT NULL DEFAULT false,
    "enableAttachments" BOOLEAN NOT NULL DEFAULT false,
    "enableSubtasks" BOOLEAN NOT NULL DEFAULT false,
    "defaultPriority" "Priority" DEFAULT 'MEDIUM',
    "defaultRiskLevel" "RiskLevel" DEFAULT 'LOW',

    CONSTRAINT "BoardSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attachment" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "size" INTEGER,
    "mimeType" TEXT,
    "taskId" TEXT NOT NULL,
    "uploadedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Attachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskWatcher" (
    "userId" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,

    CONSTRAINT "TaskWatcher_pkey" PRIMARY KEY ("userId","taskId")
);

-- CreateTable
CREATE TABLE "TaskDependency" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "dependsOnTaskId" TEXT NOT NULL,

    CONSTRAINT "TaskDependency_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BoardSettings_boardId_key" ON "BoardSettings"("boardId");

-- CreateIndex
CREATE UNIQUE INDEX "TaskDependency_taskId_dependsOnTaskId_key" ON "TaskDependency"("taskId", "dependsOnTaskId");

-- AddForeignKey
ALTER TABLE "BoardSettings" ADD CONSTRAINT "BoardSettings_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "Board"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_parentTaskId_fkey" FOREIGN KEY ("parentTaskId") REFERENCES "Task"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskWatcher" ADD CONSTRAINT "TaskWatcher_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskWatcher" ADD CONSTRAINT "TaskWatcher_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskDependency" ADD CONSTRAINT "TaskDependency_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskDependency" ADD CONSTRAINT "TaskDependency_dependsOnTaskId_fkey" FOREIGN KEY ("dependsOnTaskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;
