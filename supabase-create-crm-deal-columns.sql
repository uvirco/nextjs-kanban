-- Create CRM Deal Columns table for dynamic pipeline management
CREATE TABLE IF NOT EXISTS "CRMDealColumn" (
  column_id SERIAL PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  stage VARCHAR(50) NOT NULL, -- Maps to CRMDealStage enum
  color VARCHAR(50) NOT NULL, -- Tailwind color class like 'bg-blue-500'
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for ordering
CREATE INDEX IF NOT EXISTS idx_crm_deal_column_order ON "CRMDealColumn"("order");

-- Seed default columns
INSERT INTO "CRMDealColumn" (title, stage, color, "order") VALUES
  ('Lead', 'PROSPECTING', 'bg-slate-500', 0),
  ('Contacted', 'QUALIFICATION', 'bg-blue-500', 1),
  ('Qualified', 'QUALIFICATION', 'bg-purple-500', 2),
  ('Proposal', 'PROPOSAL', 'bg-yellow-500', 3),
  ('Negotiation', 'NEGOTIATION', 'bg-orange-500', 4),
  ('Closed Won', 'CLOSED_WON', 'bg-green-500', 5),
  ('Closed Lost', 'CLOSED_LOST', 'bg-red-500', 6)
ON CONFLICT DO NOTHING;

-- Add comment
COMMENT ON TABLE "CRMDealColumn" IS 'Columns for CRM deal pipeline - allows dynamic customization of sales stages';
