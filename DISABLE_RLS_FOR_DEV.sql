-- Drop all existing RLS policies on CRMDealProduct
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public."CRMDealProduct";
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public."CRMDealProduct";
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public."CRMDealProduct";
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public."CRMDealProduct";
DROP POLICY IF EXISTS "Allow users to read their deal products" ON public."CRMDealProduct";
DROP POLICY IF EXISTS "Allow authenticated users to insert deal products" ON public."CRMDealProduct";
DROP POLICY IF EXISTS "Allow creators to update deal products" ON public."CRMDealProduct";
DROP POLICY IF EXISTS "Allow creators to delete deal products" ON public."CRMDealProduct";
DROP POLICY IF EXISTS "Allow authenticated users to read" ON public."CRMDealProduct";
DROP POLICY IF EXISTS "Allow authenticated users to insert" ON public."CRMDealProduct";
DROP POLICY IF EXISTS "Allow authenticated users to update" ON public."CRMDealProduct";
DROP POLICY IF EXISTS "Allow authenticated users to delete" ON public."CRMDealProduct";

-- Disable RLS entirely for development
ALTER TABLE public."CRMDealProduct" DISABLE ROW LEVEL SECURITY;
