-- Create CRMProduct table for managing products in CRM

CREATE TABLE IF NOT EXISTS "CRMProduct" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "name" TEXT NOT NULL,
  "productCode" TEXT NOT NULL UNIQUE,
  "active" BOOLEAN DEFAULT true,
  "category" TEXT,
  "description" TEXT,
  "unitPrice" NUMERIC(12, 2),
  "billingCycle" TEXT,
  "productType" TEXT,
  "currency" TEXT DEFAULT 'EUR',
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "createdByUserId" TEXT REFERENCES "User"("id") ON DELETE SET NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS "CRMProduct_active_idx" ON "CRMProduct"("active");
CREATE INDEX IF NOT EXISTS "CRMProduct_category_idx" ON "CRMProduct"("category");
CREATE INDEX IF NOT EXISTS "CRMProduct_productCode_idx" ON "CRMProduct"("productCode");
CREATE INDEX IF NOT EXISTS "CRMProduct_name_idx" ON "CRMProduct"("name");

COMMENT ON TABLE "CRMProduct" IS 'Products catalog for CRM - stores product information with pricing and billing details';

-- Insert sample data (based on user requirements)
INSERT INTO "CRMProduct" ("name", "productCode", "active", "category", "unitPrice", "billingCycle", "productType", "currency")
VALUES 
  ('CoroCAM 6D - Discontinued', 'C6000', true, 'Camera Handheld', 34000, '', 'CC6', 'EUR'),
  ('CoroCAM 7HD', 'C7000', true, 'Camera Handheld', 46000, '', 'CC7', 'EUR'),
  ('Corocam 7 Core', 'C7000Core', true, 'Core', 43000, '', 'CC7', 'EUR'),
  ('Corocam 8', 'C8000', true, 'Camera Handheld', 64200, '', 'CC8', 'EUR'),
  ('CoroCAM 6HD', 'C6000HD', true, 'Camera Handheld', 41000, '', 'CC6', 'EUR')
ON CONFLICT ("productCode") DO NOTHING;

-- Display inserted products
SELECT "id", "name", "productCode", "active", "category", "unitPrice", "billingCycle", "productType" FROM "CRMProduct" ORDER BY "name";
