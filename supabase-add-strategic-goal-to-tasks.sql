-- Add strategic_goal_id foreign key to Task table for linking projects to strategic goals
ALTER TABLE public."Task" 
ADD COLUMN strategic_goal_id UUID REFERENCES public."StrategicGoal"(id) ON DELETE SET NULL;

-- Create index for faster queries
CREATE INDEX idx_task_strategic_goal_id ON public."Task"(strategic_goal_id);
