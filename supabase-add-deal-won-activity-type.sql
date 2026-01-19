-- Add DEAL_WON to CRMActivityType enum
-- This tracks when deals are won, independent of column/stage names

ALTER TYPE "CRMActivityType" ADD VALUE IF NOT EXISTS 'DEAL_WON';

-- The CRMActivity table already exists and will now support DEAL_WON activities
-- This makes it easy to query all won deals without text matching on stage names

-- Example queries:
-- Get all won deals with dates:
-- SELECT d.*, a."createdAt" as won_date
-- FROM "CRMDeal" d
-- JOIN "CRMActivity" a ON a."dealId" = d.deal_id
-- WHERE a.type = 'DEAL_WON'
-- ORDER BY a."createdAt" DESC;
