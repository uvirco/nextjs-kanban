-- Add strategic goal to project goal linking system
-- Enables hierarchical progress tracking: Tasks → Project Goals → Strategic Goals

-- 1. Add columns to Task table to support Project Goal designation and progress calculation
ALTER TABLE "Task" 
ADD COLUMN IF NOT EXISTS is_project_goal BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS progress_source VARCHAR(50) DEFAULT 'manual'; -- 'manual' | 'from_subtasks'

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_task_is_project_goal ON "Task"(is_project_goal);
CREATE INDEX IF NOT EXISTS idx_task_progress_source ON "Task"(progress_source);

-- 2. Create linking table between Strategic Goals and Project Goals (Tasks)
CREATE TABLE IF NOT EXISTS strategic_goal_project_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  strategic_goal_id UUID NOT NULL REFERENCES "StrategicGoal"(id) ON DELETE CASCADE,
  project_goal_id TEXT NOT NULL REFERENCES "Task"(id) ON DELETE CASCADE,
  importance_weight INT DEFAULT 100 CHECK (importance_weight >= 1 AND importance_weight <= 100),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(strategic_goal_id, project_goal_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_sgpl_strategic_goal_id ON strategic_goal_project_links(strategic_goal_id);
CREATE INDEX IF NOT EXISTS idx_sgpl_project_goal_id ON strategic_goal_project_links(project_goal_id);

-- 3. Add trigger to update strategic_goal_project_links.updated_at
CREATE OR REPLACE FUNCTION update_strategic_goal_project_links_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_strategic_goal_project_links_updated_at ON strategic_goal_project_links;
CREATE TRIGGER trigger_update_strategic_goal_project_links_updated_at
  BEFORE UPDATE ON strategic_goal_project_links
  FOR EACH ROW
  EXECUTE FUNCTION update_strategic_goal_project_links_updated_at();

-- 4. Create view for easy access to progress calculation
CREATE OR REPLACE VIEW vw_project_goal_progress AS
SELECT 
  t.id,
  t.title,
  t.progress as manual_progress,
  t.progress_source,
  CASE 
    WHEN t.progress_source = 'from_subtasks' AND st.task_count > 0 THEN 
      ROUND(COALESCE(st.avg_progress, 0)::numeric, 2)::int
    ELSE t.progress
  END as calculated_progress,
  st.task_count as linked_tasks_count,
  st.completed_tasks_count,
  t.is_project_goal
FROM "Task" t
LEFT JOIN (
  SELECT 
    "parentTaskId",
    COUNT(*) as task_count,
    COUNT(CASE WHEN progress >= 100 THEN 1 END) as completed_tasks_count,
    AVG(progress) as avg_progress
  FROM "Task"
  WHERE deleted = false
  GROUP BY "parentTaskId"
) st ON t.id = st."parentTaskId";

-- 5. Create view for Strategic Goal progress calculation
CREATE OR REPLACE VIEW vw_strategic_goal_progress AS
SELECT 
  sg.id,
  sg.title,
  sg.progress as manual_progress,
  COUNT(DISTINCT sgpl.project_goal_id) as linked_project_goals_count,
  ROUND(
    COALESCE(
      SUM(COALESCE(pgp.calculated_progress, 0) * sgpl.importance_weight) / 
      NULLIF(SUM(sgpl.importance_weight), 0),
      0
    )::numeric,
    2
  )::int as calculated_progress
FROM "StrategicGoal" sg
LEFT JOIN strategic_goal_project_links sgpl ON sg.id = sgpl.strategic_goal_id
LEFT JOIN vw_project_goal_progress pgp ON sgpl.project_goal_id = pgp.id
GROUP BY sg.id, sg.title, sg.progress;

-- 6. Add comment for documentation
COMMENT ON TABLE strategic_goal_project_links IS 
'Links Strategic Goals to Project Goals (Tasks). Enables hierarchical progress tracking.
importance_weight: 1-100 scale for weighted progress calculation.
Example: Strategic Goal "Increase Revenue" linked to Project Goal "Close Enterprise Deals" (weight: 60%)';

COMMENT ON COLUMN strategic_goal_project_links.importance_weight IS 
'Weight for progress calculation (1-100). Higher weight = more impact on strategic goal progress.
Used in weighted average: strategic_goal_progress = Σ(project_goal_progress × weight) / Σ(weight)';

COMMENT ON COLUMN "Task".is_project_goal IS 
'Marks this Task as a Project Goal (top-level goal for a project). Used to filter project goals in UI.';

COMMENT ON COLUMN "Task".progress_source IS 
'Determines how progress is calculated: 
- manual: User sets progress directly
- from_subtasks: Progress auto-calculated from linked subtasks';

-- 7. RLS Policies (if RLS is enabled)
-- Allow users to view links for strategic goals they can access
ALTER TABLE strategic_goal_project_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view strategic goal project links"
  ON strategic_goal_project_links
  FOR SELECT
  USING (true);  -- Adjust based on your auth model

CREATE POLICY "Users can manage strategic goal project links"
  ON strategic_goal_project_links
  FOR INSERT
  WITH CHECK (true);  -- Adjust based on your auth model

CREATE POLICY "Users can update strategic goal project links"
  ON strategic_goal_project_links
  FOR UPDATE
  USING (true);  -- Adjust based on your auth model

CREATE POLICY "Users can delete strategic goal project links"
  ON strategic_goal_project_links
  FOR DELETE
  USING (true);  -- Adjust based on your auth model
