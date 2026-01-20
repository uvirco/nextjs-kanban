import { NextRequest, NextResponse } from "next/server";

// This endpoint returns the SQL needed to fix the RLS policies
// Usage: GET /api/admin/rls-fix-sql

export async function GET(request: NextRequest) {
  const sql = `-- Drop existing restrictive policies
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
  FOR DELETE USING (auth.role() = 'authenticated');`;

  // Return as plain text for easy copying
  const acceptHeader = request.headers.get("accept") || "";

  if (acceptHeader.includes("application/json")) {
    return NextResponse.json({ sql });
  } else {
    return new NextResponse(sql, {
      headers: { "Content-Type": "text/plain" },
    });
  }
}
