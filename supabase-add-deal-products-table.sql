-- Create deal_products table for many-to-many relationship between deals and products
-- Note: Foreign key constraints commented out temporarily - will add after verifying table structure
CREATE TABLE IF NOT EXISTS "CRMDealProduct" (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "dealId" UUID NOT NULL,
  "productId" UUID NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  "unitPrice" DECIMAL(10,2) NOT NULL CHECK ("unitPrice" >= 0),
  currency VARCHAR(3) DEFAULT 'EUR',
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "createdByUserId" UUID REFERENCES auth.users(id),

  -- Ensure unique combination of deal and product
  UNIQUE("dealId", "productId")
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_crm_deal_product_deal_id ON "CRMDealProduct"("dealId");
CREATE INDEX IF NOT EXISTS idx_crm_deal_product_product_id ON "CRMDealProduct"("productId");

-- Add RLS policies
ALTER TABLE "CRMDealProduct" ENABLE ROW LEVEL SECURITY;

-- Basic RLS policy - allow authenticated users to access their data
-- Full access control policies will be added after verifying CRMDeal/CRMProduct structure
CREATE POLICY "Enable read access for authenticated users" ON "CRMDealProduct"
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON "CRMDealProduct"
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON "CRMDealProduct"
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users" ON "CRMDealProduct"
  FOR DELETE USING (auth.role() = 'authenticated');

-- Insert some sample deal products (commented out - verify tables first)
-- INSERT INTO "CRMDealProduct" ("dealId", "productId", quantity, "unitPrice", currency)
-- SELECT
--   d.id as "dealId",
--   p.id as "productId",
--   1 as quantity,
--   p."unitPrice" as "unitPrice",
--   COALESCE(p.currency, 'EUR') as currency
-- FROM "CRMDeal" d
-- CROSS JOIN "CRMProduct" p
-- WHERE p.active = true
-- LIMIT 5;