-- Re-enable RLS on CRMDealProduct with simple authenticated-only policies
-- This adds back basic security without UUID user ID requirements

ALTER TABLE public."CRMDealProduct" ENABLE ROW LEVEL SECURITY;

-- Simple policy: Allow any authenticated user to read
CREATE POLICY "Allow authenticated users to read" ON public."CRMDealProduct"
  FOR SELECT USING (auth.role() = 'authenticated');

-- Simple policy: Allow any authenticated user to insert
CREATE POLICY "Allow authenticated users to insert" ON public."CRMDealProduct"
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Simple policy: Allow any authenticated user to update
CREATE POLICY "Allow authenticated users to update" ON public."CRMDealProduct"
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Simple policy: Allow any authenticated user to delete
CREATE POLICY "Allow authenticated users to delete" ON public."CRMDealProduct"
  FOR DELETE USING (auth.role() = 'authenticated');
