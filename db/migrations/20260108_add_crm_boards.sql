-- Create CRM Deals Board with full pipeline (Lead → Closed)
-- Run this after the main CRM tables migration

-- Create single CRM Deals Board
INSERT INTO public."Board" (id, title, "backgroundUrl", "createdAt", "updatedAt")
VALUES 
  ('crm-deals-board-00000000-0000-0000-0000', 'CRM Pipeline', NULL, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Create Deals Board Columns (covers entire pipeline from lead to close)
INSERT INTO public."Column" (id, title, "order", "boardId", "createdAt", "updatedAt")
VALUES 
  ('crm-deal-col-lead-0000-0000-0000-000000', 'Lead', 0, 'crm-deals-board-00000000-0000-0000-0000', NOW(), NOW()),
  ('crm-deal-col-contacted-0000-0000-00000', 'Contacted', 1, 'crm-deals-board-00000000-0000-0000-0000', NOW(), NOW()),
  ('crm-deal-col-qualified-0000-0000-00000', 'Qualified', 2, 'crm-deals-board-00000000-0000-0000-0000', NOW(), NOW()),
  ('crm-deal-col-proposal-0000-0000-000000', 'Proposal', 3, 'crm-deals-board-00000000-0000-0000-0000', NOW(), NOW()),
  ('crm-deal-col-negotiation-0000-0000-000', 'Negotiation', 4, 'crm-deals-board-00000000-0000-0000-0000', NOW(), NOW()),
  ('crm-deal-col-won-00000-0000-0000-000000', 'Closed Won', 5, 'crm-deals-board-00000000-0000-0000-0000', NOW(), NOW()),
  ('crm-deal-col-lost-0000-0000-0000-000000', 'Closed Lost', 6, 'crm-deals-board-00000000-0000-0000-0000', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

COMMIT;
