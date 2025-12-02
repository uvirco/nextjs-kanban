-- Create Epics Board for Epic Portfolio
-- Run this in Supabase SQL Editor to create the Epics board

-- Create the Epics board
INSERT INTO "Board" ("id", "title", "createdAt", "updatedAt")
VALUES ('epics-board-id', 'Epics', NOW(), NOW())
ON CONFLICT ("id") DO NOTHING;

-- Create columns for the Epics board
INSERT INTO "Column" ("id", "title", "boardId", "order", "createdAt", "updatedAt") VALUES
('epics-backlog-column', 'Backlog', 'epics-board-id', 0, NOW(), NOW()),
('epics-todo-column', 'To Do', 'epics-board-id', 1, NOW(), NOW()),
('epics-inprogress-column', 'In Progress', 'epics-board-id', 2, NOW(), NOW()),
('epics-review-column', 'Review', 'epics-board-id', 3, NOW(), NOW()),
('epics-done-column', 'Done', 'epics-board-id', 4, NOW(), NOW())
ON CONFLICT ("id") DO NOTHING;

-- Add admin user as owner of the Epics board
INSERT INTO "BoardMember" ("userId", "boardId", "role", "createdAt") VALUES
('admin-user-id', 'epics-board-id', 'owner', NOW())
ON CONFLICT ("userId", "boardId") DO NOTHING;

-- Create board settings for the Epics board
INSERT INTO "BoardSettings" ("id", "boardId", "enablePriority", "enableBusinessValue", "enableEstimatedEffort", "enableDependencies", "enableBudgetEstimate", "enableRiskLevel", "enableStrategicAlignment", "enableRoiEstimate", "enableStageGate", "enableTimeSpent", "enableStoryPoints", "enableWatchers", "enableAttachments", "enableSubtasks", "defaultPriority", "defaultRiskLevel") VALUES
('epics-board-settings', 'epics-board-id', true, true, true, true, true, true, true, true, true, true, true, true, true, true, 'MEDIUM', 'LOW')
ON CONFLICT ("boardId") DO NOTHING;