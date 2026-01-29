-- Create StrategicGoal table for company-level strategic objectives
CREATE TABLE public."StrategicGoal" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  fiscal_year TEXT,
  target_date DATE,
  status TEXT NOT NULL CHECK (status IN ('active', 'achieved', 'on_hold', 'abandoned')) DEFAULT 'active',
  progress INTEGER CHECK (progress >= 0 AND progress <= 100) DEFAULT 0,
  created_by TEXT REFERENCES "User"(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_strategic_goal_status ON public."StrategicGoal"(status);
CREATE INDEX idx_strategic_goal_fiscal_year ON public."StrategicGoal"(fiscal_year);
CREATE INDEX idx_strategic_goal_created_by ON public."StrategicGoal"(created_by);
CREATE INDEX idx_strategic_goal_target_date ON public."StrategicGoal"(target_date);

-- Enable RLS
ALTER TABLE public."StrategicGoal" ENABLE ROW LEVEL SECURITY;

-- RLS Policies for StrategicGoal table (permissive for all authenticated users)
CREATE POLICY "Enable read access" ON public."StrategicGoal"
  FOR SELECT
  USING (true);

CREATE POLICY "Enable insert access" ON public."StrategicGoal"
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Enable update access" ON public."StrategicGoal"
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable delete access" ON public."StrategicGoal"
  FOR DELETE
  USING (true);
