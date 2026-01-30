-- Enhance risks table with additional fields for comprehensive risk management

-- Add new columns to risks table
ALTER TABLE public.risks ADD COLUMN IF NOT EXISTS risk_owner TEXT;
ALTER TABLE public.risks ADD COLUMN IF NOT EXISTS risk_category TEXT DEFAULT 'Operational'::text;
ALTER TABLE public.risks ADD COLUMN IF NOT EXISTS likelihood_score INT DEFAULT 2 CHECK (likelihood_score >= 1 AND likelihood_score <= 5);
ALTER TABLE public.risks ADD COLUMN IF NOT EXISTS impact_score INT DEFAULT 2 CHECK (impact_score >= 1 AND impact_score <= 5);
ALTER TABLE public.risks ADD COLUMN IF NOT EXISTS risk_score INT GENERATED ALWAYS AS (likelihood_score * impact_score) STORED;
ALTER TABLE public.risks ADD COLUMN IF NOT EXISTS residual_risk_score INT DEFAULT NULL CHECK (residual_risk_score >= 1 AND residual_risk_score <= 25);
ALTER TABLE public.risks ADD COLUMN IF NOT EXISTS owner_responsible_for_mitigation TEXT;
ALTER TABLE public.risks ADD COLUMN IF NOT EXISTS mitigation_due_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.risks ADD COLUMN IF NOT EXISTS mitigation_status TEXT DEFAULT 'Not Started'::text CHECK (
  mitigation_status = ANY (array['Not Started'::text, 'In Progress'::text, 'Complete'::text, 'On Hold'::text])
);
ALTER TABLE public.risks ADD COLUMN IF NOT EXISTS key_risk_indicator TEXT;
ALTER TABLE public.risks ADD COLUMN IF NOT EXISTS deal_id UUID;
ALTER TABLE public.risks ADD COLUMN IF NOT EXISTS next_review_date TIMESTAMP WITH TIME ZONE;

-- Add foreign key constraint for deal_id (uncomment if Deal table exists)
-- ALTER TABLE public.risks ADD CONSTRAINT risks_deal_id_fkey 
--   FOREIGN KEY (deal_id) REFERENCES "Deal" (id) ON DELETE CASCADE;

-- Add constraint for risk_category
ALTER TABLE public.risks ADD CONSTRAINT risks_category_check CHECK (
  risk_category = ANY (array['Strategic'::text, 'Operational'::text, 'Financial'::text, 'Compliance'::text, 'Market'::text, 'Other'::text])
);

-- Create index for common queries
CREATE INDEX IF NOT EXISTS idx_risks_status ON public.risks(status);
CREATE INDEX IF NOT EXISTS idx_risks_category ON public.risks(risk_category);
CREATE INDEX IF NOT EXISTS idx_risks_owner ON public.risks(risk_owner);
CREATE INDEX IF NOT EXISTS idx_risks_risk_score ON public.risks(risk_score);
CREATE INDEX IF NOT EXISTS idx_risks_epic_id ON public.risks(epic_id);
CREATE INDEX IF NOT EXISTS idx_risks_deal_id ON public.risks(deal_id);

-- Update existing records to have default values for new fields
UPDATE public.risks 
SET 
  risk_category = 'Operational',
  likelihood_score = CASE 
    WHEN probability = 'Low' THEN 1
    WHEN probability = 'Medium' THEN 3
    WHEN probability = 'High' THEN 5
    ELSE 2
  END,
  impact_score = CASE 
    WHEN impact = 'Low' THEN 1
    WHEN impact = 'Medium' THEN 3
    WHEN impact = 'High' THEN 5
    ELSE 2
  END,
  mitigation_status = 'Not Started',
  next_review_date = NOW() + INTERVAL '30 days'
WHERE likelihood_score IS NULL OR impact_score IS NULL;
