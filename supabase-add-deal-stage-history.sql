-- Create table to track deal stage changes
CREATE TABLE IF NOT EXISTS "CRMDealStageHistory" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "dealId" INTEGER NOT NULL REFERENCES "CRMDeal"("deal_id") ON DELETE CASCADE,
  "fromStage" TEXT,
  "toStage" TEXT NOT NULL,
  "changedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "changedByUserId" TEXT REFERENCES "User"("id"),
  "notes" TEXT
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_deal_stage_history_deal_id ON "CRMDealStageHistory"("dealId");
CREATE INDEX IF NOT EXISTS idx_deal_stage_history_changed_at ON "CRMDealStageHistory"("changedAt" DESC);

-- Add comment
COMMENT ON TABLE "CRMDealStageHistory" IS 'Tracks all stage changes for deals with timestamps';
