-- Complete CRM setup: Won deals, references, and stage fixes
-- Run this ONE migration in Supabase SQL Editor to enable all features

-- 1. Fix stage column to TEXT (allow any stage names)
ALTER TABLE "CRMDeal" ALTER COLUMN "stage" TYPE TEXT;

-- 2. Fix column stages to use proper slugs
UPDATE "CRMColumn" SET "stage" = 'won' WHERE "stage" ILIKE '%won%' AND "stage" NOT ILIKE '%lost%';
UPDATE "CRMColumn" SET "stage" = 'lost' WHERE "stage" ILIKE '%lost%';
UPDATE "CRMColumn" SET "stage" = 'prospecting' WHERE "stage" ILIKE 'Prospecting%';
UPDATE "CRMColumn" SET "stage" = 'qualification' WHERE "stage" ILIKE 'Qualification%' OR "stage" ILIKE 'Qualified%';
UPDATE "CRMColumn" SET "stage" = 'proposal' WHERE "stage" ILIKE 'Proposal%';
UPDATE "CRMColumn" SET "stage" = 'negotiation' WHERE "stage" ILIKE 'Negotiation%';
UPDATE "CRMColumn" SET "stage" = 'closed_won' WHERE "stage" ILIKE 'Closed Won%';
UPDATE "CRMColumn" SET "stage" = 'closed_lost' WHERE "stage" ILIKE 'Closed Lost%';

-- 3. Fix deal stages to match columns
UPDATE "CRMDeal" SET "stage" = 'won' WHERE "stage" ILIKE '%won%' AND "stage" NOT ILIKE '%lost%';
UPDATE "CRMDeal" SET "stage" = 'lost' WHERE "stage" ILIKE '%lost%';
UPDATE "CRMDeal" SET "stage" = 'prospecting' WHERE "stage" ILIKE 'Prospecting%';
UPDATE "CRMDeal" SET "stage" = 'qualification' WHERE "stage" ILIKE 'Qualification%' OR "stage" ILIKE 'Qualified%';
UPDATE "CRMDeal" SET "stage" = 'proposal' WHERE "stage" ILIKE 'Proposal%';
UPDATE "CRMDeal" SET "stage" = 'negotiation' WHERE "stage" ILIKE 'Negotiation%';
UPDATE "CRMDeal" SET "stage" = 'closed_won' WHERE "stage" ILIKE 'Closed Won%';
UPDATE "CRMDeal" SET "stage" = 'closed_lost' WHERE "stage" ILIKE 'Closed Lost%';

-- 4. Add outcome field
ALTER TABLE "CRMDeal" ADD COLUMN IF NOT EXISTS "outcome" TEXT 
CHECK ("outcome" IN ('won', 'lost', 'open')) DEFAULT 'open';
CREATE INDEX IF NOT EXISTS "CRMDeal_outcome_idx" ON "CRMDeal"("outcome");

-- 5. Add new activity types
ALTER TYPE "CRMActivityType" ADD VALUE IF NOT EXISTS 'FILE_ATTACHED';
ALTER TYPE "CRMActivityType" ADD VALUE IF NOT EXISTS 'DEAL_WON';

-- 6. Create reference cards table
CREATE TABLE IF NOT EXISTS "CRMDealReference" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "dealId" INTEGER NOT NULL REFERENCES "CRMDeal"("deal_id") ON DELETE CASCADE,
  "boardId" TEXT NOT NULL REFERENCES "CRMBoard"("id") ON DELETE CASCADE,
  "stage" TEXT NOT NULL,
  "note" TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "CRMDealReference_dealId_idx" ON "CRMDealReference"("dealId");
CREATE INDEX IF NOT EXISTS "CRMDealReference_boardId_stage_idx" ON "CRMDealReference"("boardId", "stage");

COMMENT ON TABLE "CRMDealReference" IS 'Ghost/reference cards showing where won deals originated from';

-- 7. Create stage history table
CREATE TABLE IF NOT EXISTS "CRMDealStageHistory" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "dealId" INTEGER NOT NULL REFERENCES "CRMDeal"("deal_id") ON DELETE CASCADE,
  "fromStage" TEXT,
  "toStage" TEXT NOT NULL,
  "changedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "changedByUserId" TEXT REFERENCES "User"("id"),
  "notes" TEXT
);

CREATE INDEX IF NOT EXISTS idx_deal_stage_history_deal_id ON "CRMDealStageHistory"("dealId");
CREATE INDEX IF NOT EXISTS idx_deal_stage_history_changed_at ON "CRMDealStageHistory"("changedAt" DESC);

COMMENT ON TABLE "CRMDealStageHistory" IS 'Tracks all stage changes for deals with timestamps';

-- Done! Show current columns
SELECT "id", "title", "stage", "boardId" FROM "CRMColumn" ORDER BY "boardId", "order";
