-- Fix RLS policies for CRMDealProduct table - Development Mode
-- These policies are more permissive to allow development/testing
-- In production, you'd want stricter policies

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public."CRMDealProduct";
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public."CRMDealProduct";
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public."CRMDealProduct";
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public."CRMDealProduct";
DROP POLICY IF EXISTS "Allow users to read their deal products" ON public."CRMDealProduct";
DROP POLICY IF EXISTS "Allow authenticated users to insert deal products" ON public."CRMDealProduct";
DROP POLICY IF EXISTS "Allow creators to update deal products" ON public."CRMDealProduct";
DROP POLICY IF EXISTS "Allow creators to delete deal products" ON public."CRMDealProduct";

-- Create permissive policies for development
-- These allow any authenticated user full access while in development mode
-- In production, replace these with role-based access control

CREATE POLICY "Allow authenticated users to read" ON public."CRMDealProduct"
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert" ON public."CRMDealProduct"
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update" ON public."CRMDealProduct"
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete" ON public."CRMDealProduct"
  FOR DELETE USING (auth.role() = 'authenticated');
