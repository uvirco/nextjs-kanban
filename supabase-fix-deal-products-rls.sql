-- Temporarily disable RLS to diagnose the issue
ALTER TABLE public."CRMDealProduct" DISABLE ROW LEVEL SECURITY;

-- Verify the data by checking if any products were inserted
SELECT id, "dealId", "productId", quantity, "unitPrice", currency, "createdAt"
FROM public."CRMDealProduct"
ORDER BY "createdAt" DESC
LIMIT 20;
