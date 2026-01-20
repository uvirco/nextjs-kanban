-- Check CRMDealProduct table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'CRMDealProduct' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'CRMDealProduct' AND schemaname = 'public';

-- Check current policies
SELECT tablename, policyname, permissive, roles, qual, with_check
FROM pg_policies
WHERE tablename = 'CRMDealProduct' AND schemaname = 'public';

-- Try a manual insert to test
INSERT INTO public."CRMDealProduct" ("dealId", "productId", quantity, "unitPrice", currency, "createdByUserId")
VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  '00000000-0000-0000-0000-000000000001'::uuid,
  1,
  10.00,
  'EUR',
  '00000000-0000-0000-0000-000000000001'::uuid
)
RETURNING *;
