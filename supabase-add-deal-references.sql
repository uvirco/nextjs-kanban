-- Create table for deal reference cards (ghost cards shown in other columns)
-- When a deal transitions to another pipeline, a reference card stays in the original column

CREATE TABLE IF NOT EXISTS "CRMDealReference" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "dealId" INTEGER NOT NULL REFERENCES "CRMDeal"("deal_id") ON DELETE CASCADE,
  "boardId" TEXT NOT NULL REFERENCES "CRMBoard"("id") ON DELETE CASCADE,
  "stage" TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "note" TEXT -- e.g., "Deal won on 2026-01-19"
);

CREATE INDEX "CRMDealReference_dealId_idx" ON "CRMDealReference"("dealId");
CREATE INDEX "CRMDealReference_boardId_stage_idx" ON "CRMDealReference"("boardId", "stage");

COMMENT ON TABLE "CRMDealReference" IS 'Reference cards that show in columns even after deal moved to another pipeline';
COMMENT ON COLUMN "CRMDealReference"."note" IS 'Display note like "Won on Jan 19, 2026 - Now in Delivery"';
