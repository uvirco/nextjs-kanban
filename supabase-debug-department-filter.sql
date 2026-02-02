-- Fix: Ensure tasks have departmentId assigned
-- This helps with department filtering

-- 1. Check current state of departmentId in tasks
SELECT 
  COUNT(*) as total_tasks,
  COUNT(CASE WHEN "departmentId" IS NULL THEN 1 END) as tasks_without_department,
  COUNT(CASE WHEN "departmentId" IS NOT NULL THEN 1 END) as tasks_with_department
FROM "Task";

-- 2. View tasks that might be missing department assignment
-- Check if epic/parent task has a department that should be inherited
SELECT 
  t.id,
  t.title,
  t."departmentId",
  parent.id as parent_id,
  parent.title as parent_title,
  parent."departmentId" as parent_department_id
FROM "Task" t
LEFT JOIN "Task" parent ON t."parentTaskId" = parent.id
WHERE t."departmentId" IS NULL 
AND parent."departmentId" IS NOT NULL
LIMIT 20;

-- 3. Optional: Inherit department from parent task for unassigned subtasks
-- Uncomment and run only if you want subtasks to inherit parent's department
/*
UPDATE "Task" t
SET "departmentId" = parent."departmentId"
FROM "Task" parent
WHERE t."parentTaskId" = parent.id
  AND t."departmentId" IS NULL
  AND parent."departmentId" IS NOT NULL;
*/

-- 4. Check for boards that have tasks but no clear department ownership
SELECT 
  b.id,
  b.title,
  COUNT(t.id) as task_count,
  COUNT(CASE WHEN t."departmentId" IS NOT NULL THEN 1 END) as tasks_with_dept,
  COUNT(DISTINCT t."departmentId") as dept_count
FROM "Board" b
LEFT JOIN "Column" c ON b.id = c."boardId"
LEFT JOIN "Task" t ON c.id = t."columnId"
WHERE t.id IS NOT NULL
GROUP BY b.id, b.title
HAVING COUNT(CASE WHEN t."departmentId" IS NOT NULL THEN 1 END) = 0
ORDER BY task_count DESC;

-- Notes for fixing department filter issues:
-- 1. If filtering returns empty: most likely tasks have NULL departmentId
-- 2. Solution A: Assign departmentId when creating tasks
-- 3. Solution B: Modify filter to include tasks with NULL departmentId
-- 4. Solution C: Run inheritance script above to inherit from parent epic
