# Fix UUID/Numeric ID Mismatch in CRMDeal and CRMDealProduct

## Problem

The database has a schema mismatch:
- **CRMDeal** table only has `deal_id` (INTEGER PRIMARY KEY)
- **CRMDealProduct** table expects `dealId` to be UUID type
- This causes error: "invalid input syntax for type uuid: '7'" when trying to add products to deals

## Solution

Add a UUID `id` column to CRMDeal table that references from CRMDealProduct.

## Manual Steps

1. Go to your Supabase console: https://app.supabase.com
2. Navigate to your project's **SQL Editor**
3. Click **+ New Query**
4. Copy and paste the SQL from `supabase-add-uuid-to-deal.sql`:

```sql
-- Add UUID column to CRMDeal table for product relationships
ALTER TABLE "CRMDeal" ADD COLUMN IF NOT EXISTS "id" UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL;

-- Create index on the new UUID id column
CREATE INDEX IF NOT EXISTS idx_crm_deal_id ON "CRMDeal"("id");
```

5. Click **Execute** (Cmd+Enter or Ctrl+Enter)
6. Verify the migration completed successfully

## Verification

After running the migration, restart the dev server:

```bash
npm run dev
```

Then try adding a product to a deal. The error should be resolved.

## What This Does

- Adds a UUID `id` column to CRMDeal with default random UUID value
- Ensures this column is unique
- Creates an index for performance
- Existing and new deals will automatically get UUIDs
- CRMDealProduct can now properly reference this UUID
