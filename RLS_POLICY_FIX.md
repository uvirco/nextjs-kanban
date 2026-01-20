# ⚠️ Row-Level Security (RLS) Policy Blocking Insert

## The Issue

The insert is being blocked by restrictive RLS policies on the CRMDealProduct table:
```
Error code 42501: new row violates row-level security policy for table "CRMDealProduct"
```

The current policies require `createdByUserId` to match the authenticated user, but since `createdByUserId` is NULL (due to "admin-user-id" not being a valid UUID), the check fails.

## Quick Fix (2 Steps)

### Step 1: Update RLS Policies in Supabase

1. Go to: https://app.supabase.com
2. Select your project
3. Click **SQL Editor** in left sidebar
4. Click **+ New Query**
5. **Paste this entire SQL block**:

```sql
-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public."CRMDealProduct";
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public."CRMDealProduct";
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public."CRMDealProduct";
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public."CRMDealProduct";
DROP POLICY IF EXISTS "Allow users to read their deal products" ON public."CRMDealProduct";
DROP POLICY IF EXISTS "Allow authenticated users to insert deal products" ON public."CRMDealProduct";
DROP POLICY IF EXISTS "Allow creators to update deal products" ON public."CRMDealProduct";
DROP POLICY IF EXISTS "Allow creators to delete deal products" ON public."CRMDealProduct";

-- Create permissive policies for authenticated users
CREATE POLICY "Allow authenticated users to read" ON public."CRMDealProduct"
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert" ON public."CRMDealProduct"
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update" ON public."CRMDealProduct"
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete" ON public."CRMDealProduct"
  FOR DELETE USING (auth.role() = 'authenticated');
```

6. Click **Execute** (Ctrl+Enter or Cmd+Enter)
7. Wait for "Query Executed Successfully"

### Step 2: Restart Dev Server

```bash
npm run dev
```

## Test It

Now try adding a product to a deal. It should work!

## What This Does

- **Removes** the old restrictive policies that checked `createdByUserId`
- **Adds** simple policies that just check if the user is authenticated
- **Allows** development/testing without UUID user ID issues

⚠️ **Note for Production**: These permissive policies are for development. For production, implement proper role-based access control that validates the user's relationship to the deal.

## Reference

- Full SQL is in: [supabase-fix-rls-dev-mode.sql](supabase-fix-rls-dev-mode.sql)
