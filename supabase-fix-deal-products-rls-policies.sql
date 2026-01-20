-- Fix RLS policies for CRMDealProduct table
-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public."CRMDealProduct";
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public."CRMDealProduct";
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public."CRMDealProduct";
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public."CRMDealProduct";

-- Create new policies that work better with current user verification

-- SELECT policy - allow users to see products they or their assignees have added
CREATE POLICY "Allow users to read their deal products" ON public."CRMDealProduct"
  FOR SELECT USING (
    auth.uid() = "createdByUserId"
  );

-- INSERT policy - allow any authenticated user to insert
CREATE POLICY "Allow authenticated users to insert deal products" ON public."CRMDealProduct"
  FOR INSERT WITH CHECK (
    auth.uid() = "createdByUserId"
  );

-- UPDATE policy - allow the creator to update
CREATE POLICY "Allow creators to update deal products" ON public."CRMDealProduct"
  FOR UPDATE USING (
    auth.uid() = "createdByUserId"
  );

-- DELETE policy - allow the creator to delete
CREATE POLICY "Allow creators to delete deal products" ON public."CRMDealProduct"
  FOR DELETE USING (
    auth.uid() = "createdByUserId"
  );
