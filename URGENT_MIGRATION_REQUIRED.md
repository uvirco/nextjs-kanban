# ⚠️ URGENT: Database Migration Required to Fix Product Addition

## Problem Summary

The "Add Product to Deal" feature is failing with error:
```
invalid input syntax for type uuid: "7"
```

This is caused by a **schema mismatch** in your Supabase database:
- `CRMDeal` table has only `deal_id` (INTEGER)
- `CRMDealProduct` expects `dealId` (UUID)

## Solution Required

You must add a UUID column to the CRMDeal table. **This cannot be done automatically via API** - it requires manual execution in Supabase SQL Editor.

## Step-by-Step Instructions

### 1. Open Supabase SQL Editor

- Go to: https://app.supabase.com
- Select your project from the list
- In the left sidebar, click **SQL Editor**
- Click **+ New Query**

### 2. Copy and Execute the Migration SQL

Copy this SQL exactly as shown:

```sql
-- Add UUID id column to CRMDeal table
ALTER TABLE "CRMDeal" ADD COLUMN IF NOT EXISTS "id" UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_crm_deal_id ON "CRMDeal"("id");
```

### 3. Execute

- Paste the SQL into the query editor
- Press `Cmd+Enter` (Mac) or `Ctrl+Enter` (Windows)
- Wait for "Query Executed Successfully"

### 4. Verify the Migration

Execute this verification query:

```sql
SELECT deal_id, id, title FROM "CRMDeal" LIMIT 1;
```

You should see:
- `deal_id`: numeric value like `7`
- `id`: UUID value like `f47ac10b-58cc-4372-a567-0e02b2c3d479`
- `title`: deal name

## After Migration

Once you've completed the SQL migration in Supabase:

1. **Restart the dev server**:
   ```bash
   npm run dev
   ```

2. **Try adding a product again** to a deal in the CRM interface

3. **The feature should now work!**

## Technical Details

- The new `id` column uses `gen_random_uuid()` to automatically generate UUIDs for existing and new records
- The UNIQUE constraint prevents duplicate IDs
- The index improves query performance for foreign key lookups
- The column is NOT NULL to ensure data integrity

## Questions?

- Check the `supabase-add-uuid-to-deal.sql` file for the exact SQL being applied
- View the dev server logs when adding a product to see detailed debugging information
- Check the browser's Network tab to see the API response if the feature still doesn't work

