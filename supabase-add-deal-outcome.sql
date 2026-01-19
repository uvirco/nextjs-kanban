-- Add outcome field to track won/lost/open status
-- Used for automatic pipeline transitions and reporting
-- Date tracked via CRMActivity DEAL_WON records

ALTER TABLE "CRMDeal" 
ADD COLUMN IF NOT EXISTS "outcome" TEXT 
CHECK ("outcome" IN ('won', 'lost', 'open')) 
DEFAULT 'open';

CREATE INDEX IF NOT EXISTS "CRMDeal_outcome_idx" ON "CRMDeal"("outcome");

COMMENT ON COLUMN "CRMDeal"."outcome" IS 'Deal outcome: won, lost, or open. Date tracked via CRMActivity DEAL_WON records';
