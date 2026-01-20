-- Add UUID column to CRMDeal table for product relationships
-- This fixes the schema mismatch where CRMDealProduct.dealId is UUID but CRMDeal.deal_id is INTEGER

-- 1. Add id column to CRMDeal if it doesn't exist
ALTER TABLE "CRMDeal" ADD COLUMN IF NOT EXISTS "id" UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL;

-- 2. Create index on the new UUID id column
CREATE INDEX IF NOT EXISTS idx_crm_deal_id ON "CRMDeal"("id");

-- 3. Update CRMDealProduct dealId foreign key if not already set
-- First, we need to update existing records (if any) to use the UUID from CRMDeal
-- This query maps numeric deal_id to the UUID id
UPDATE "CRMDealProduct" cdp
SET "dealId" = cd."id"
FROM "CRMDeal" cd
WHERE cd."deal_id"::text = cdp."dealId"::text
  AND cdp."dealId" NOT LIKE '%-%'; -- Only update if dealId looks like numeric, not UUID

-- 4. Optional: Add foreign key constraint after data is migrated
-- ALTER TABLE "CRMDealProduct" 
-- ADD CONSTRAINT fk_crm_deal_product_deal_id 
-- FOREIGN KEY ("dealId") REFERENCES "CRMDeal"("id");
