-- Add multi-board support for CRM pipelines
-- This allows multiple deal pipelines (e.g., Sales, Partnerships, Recruiting)

-- 1. Create CRMBoard table
CREATE TABLE IF NOT EXISTS "CRMBoard" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "title" TEXT NOT NULL,
  "type" TEXT NOT NULL DEFAULT 'deals',
  "description" TEXT,
  "backgroundUrl" TEXT,
  "isDefault" BOOLEAN DEFAULT false,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "createdByUserId" TEXT REFERENCES "User"("id")
);

-- 2. Add boardId to CRMDeal table
ALTER TABLE "CRMDeal" 
ADD COLUMN IF NOT EXISTS "boardId" TEXT REFERENCES "CRMBoard"("id");

-- 3. Add boardId to CRMColumn table (note: using CRMColumn, not CRMDealColumn)
ALTER TABLE "CRMColumn" 
ADD COLUMN IF NOT EXISTS "boardId" TEXT REFERENCES "CRMBoard"("id");

-- 4. Create a default board for existing deals
INSERT INTO "CRMBoard" ("id", "title", "type", "description", "isDefault", "createdAt", "updatedAt")
VALUES ('default-sales-pipeline', 'Sales Pipeline', 'deals', 'Default sales pipeline', true, NOW(), NOW())
ON CONFLICT ("id") DO NOTHING;

-- 5. Update existing deals to use the default board
UPDATE "CRMDeal" 
SET "boardId" = 'default-sales-pipeline' 
WHERE "boardId" IS NULL OR "boardId" = 'crm-deals-board';

-- 6. Update existing columns to use the default board
UPDATE "CRMColumn" 
SET "boardId" = 'default-sales-pipeline' 
WHERE "boardId" IS NULL OR "boardId" = 'deals' OR "boardId" = 'crm-deals-board';

-- 7. Create indexes for performance
CREATE INDEX IF NOT EXISTS "CRMBoard_type_idx" ON "CRMBoard"("type");
CREATE INDEX IF NOT EXISTS "CRMBoard_isDefault_idx" ON "CRMBoard"("isDefault");
CREATE INDEX IF NOT EXISTS "CRMDeal_boardId_idx" ON "CRMDeal"("boardId");
CREATE INDEX IF NOT EXISTS "CRMColumn_boardId_idx" ON "CRMColumn"("boardId");

-- 8. Add comments
COMMENT ON TABLE "CRMBoard" IS 'CRM boards/pipelines for deals';
COMMENT ON COLUMN "CRMDeal"."boardId" IS 'Reference to the board/pipeline this deal belongs to';
COMMENT ON COLUMN "CRMColumn"."boardId" IS 'Reference to the board/pipeline this column belongs to';
