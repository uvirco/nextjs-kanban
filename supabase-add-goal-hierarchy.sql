-- Add parent_goal_id to enable hierarchical goals (goals can have parent goals)
ALTER TABLE public."StrategicGoal"
ADD COLUMN parent_goal_id UUID REFERENCES public."StrategicGoal"(id) ON DELETE CASCADE;

-- Create index for faster queries on parent goals
CREATE INDEX idx_strategic_goal_parent_id ON public."StrategicGoal"(parent_goal_id);
