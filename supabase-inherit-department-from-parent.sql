-- Migration: Inherit departmentId from parent tasks to subtasks
-- This ensures all tasks in a hierarchy have the same department assignment
-- Run this once to backfill departmentId values

BEGIN;

-- 1. Update subtasks to inherit department from their parent epic/task
UPDATE "Task" t
SET "departmentId" = parent."departmentId",
    "updatedAt" = NOW()
FROM "Task" parent
WHERE t."parentTaskId" = parent.id
  AND t."departmentId" IS NULL
  AND parent."departmentId" IS NOT NULL;

-- 2. Log what was updated (view the changes)
SELECT 
  COUNT(*) as updated_subtasks,
  COUNT(DISTINCT parent_id) as parent_tasks_involved
FROM (
  SELECT DISTINCT parent."id" as parent_id
  FROM "Task" t
  INNER JOIN "Task" parent ON t."parentTaskId" = parent.id
  WHERE parent."departmentId" IS NOT NULL
) sub;

-- 3. Check for any remaining NULL departmentId values
SELECT 
  COUNT(*) as tasks_still_without_department,
  COUNT(CASE WHEN "parentTaskId" IS NOT NULL THEN 1 END) as subtasks_without_dept,
  COUNT(CASE WHEN "parentTaskId" IS NULL THEN 1 END) as root_tasks_without_dept
FROM "Task"
WHERE "departmentId" IS NULL;

-- 4. Optional: For root tasks (no parent) without department, assign based on board owner
-- This is more complex and would require checking board ownership
-- Uncomment if needed:
/*
UPDATE "Task" t
SET "departmentId" = (
  SELECT "departmentId" 
  FROM "User" 
  WHERE id = (
    SELECT "createdBy" 
    FROM "Board" 
    WHERE id = (
      SELECT "boardId" 
      FROM "Column" 
      WHERE id = t."columnId"
    )
  )
  LIMIT 1
)
WHERE t."departmentId" IS NULL 
  AND t."parentTaskId" IS NULL;
*/

COMMIT;

-- Verify the results
SELECT 
  'Total tasks' as metric,
  COUNT(*) as value
FROM "Task"
UNION ALL
SELECT 
  'Tasks with department',
  COUNT(*) 
FROM "Task" 
WHERE "departmentId" IS NOT NULL
UNION ALL
SELECT 
  'Tasks without department',
  COUNT(*) 
FROM "Task" 
WHERE "departmentId" IS NULL
UNION ALL
SELECT 
  'Parent tasks (epics)',
  COUNT(*) 
FROM "Task" 
WHERE "parentTaskId" IS NULL
UNION ALL
SELECT 
  'Subtasks',
  COUNT(*) 
FROM "Task" 
WHERE "parentTaskId" IS NOT NULL;
