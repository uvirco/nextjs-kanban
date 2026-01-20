-- Add stage and color columns to existing CRMColumn table
ALTER TABLE public."CRMColumn"
ADD COLUMN IF NOT EXISTS stage VARCHAR(50),
ADD COLUMN IF NOT EXISTS color VARCHAR(50);

-- Seed default columns for CRM deals board (using a fixed boardId or create one)
-- First, let's insert columns for the deals board
INSERT INTO public."CRMColumn" (id, title, "boardId", "order", stage, color, "createdAt", "updatedAt")
VALUES
  (gen_random_uuid()::text, 'Prospecting', 'crm-deals-board', 0, 'PROSPECTING', 'bg-slate-500', NOW(), NOW()),
  (gen_random_uuid()::text, 'Qualification', 'crm-deals-board', 1, 'QUALIFICATION', 'bg-blue-500', NOW(), NOW()),
  (gen_random_uuid()::text, 'Proposal', 'crm-deals-board', 2, 'PROPOSAL', 'bg-yellow-500', NOW(), NOW()),
  (gen_random_uuid()::text, 'Negotiation', 'crm-deals-board', 3, 'NEGOTIATION', 'bg-orange-500', NOW(), NOW()),
  (gen_random_uuid()::text, 'Closed Won', 'crm-deals-board', 4, 'CLOSED_WON', 'bg-green-500', NOW(), NOW()),
  (gen_random_uuid()::text, 'Closed Lost', 'crm-deals-board', 5, 'CLOSED_LOST', 'bg-red-500', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Add comment
COMMENT ON COLUMN public."CRMColumn".stage IS 'Maps to CRMDealStage enum for deals pipeline';
COMMENT ON COLUMN public."CRMColumn".color IS 'Tailwind color class like bg-blue-500';
