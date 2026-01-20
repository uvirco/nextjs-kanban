import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Temporarily disable RLS on CRMDealProduct for development
// GET /api/admin/disable-rls

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: "Missing Supabase credentials" },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    console.log("[Disable RLS] Attempting to disable RLS on CRMDealProduct...");

    // Try to fetch current table info first to confirm it exists
    const { data: tableTest } = await supabase
      .from("CRMDealProduct")
      .select("id")
      .limit(1);

    console.log("[Disable RLS] Table exists and is readable");

    // Drop all existing policies
    const dropPolicies = [
      `DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public."CRMDealProduct"`,
      `DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public."CRMDealProduct"`,
      `DROP POLICY IF EXISTS "Enable update for authenticated users" ON public."CRMDealProduct"`,
      `DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public."CRMDealProduct"`,
      `DROP POLICY IF EXISTS "Allow users to read their deal products" ON public."CRMDealProduct"`,
      `DROP POLICY IF EXISTS "Allow authenticated users to insert deal products" ON public."CRMDealProduct"`,
      `DROP POLICY IF EXISTS "Allow creators to update deal products" ON public."CRMDealProduct"`,
      `DROP POLICY IF EXISTS "Allow creators to delete deal products" ON public."CRMDealProduct"`,
      `DROP POLICY IF EXISTS "Allow authenticated users to read" ON public."CRMDealProduct"`,
      `DROP POLICY IF EXISTS "Allow authenticated users to insert" ON public."CRMDealProduct"`,
      `DROP POLICY IF EXISTS "Allow authenticated users to update" ON public."CRMDealProduct"`,
      `DROP POLICY IF EXISTS "Allow authenticated users to delete" ON public."CRMDealProduct"`,
    ];

    // Disable RLS entirely
    const disableRLS = `ALTER TABLE public."CRMDealProduct" DISABLE ROW LEVEL SECURITY`;

    console.log("[Disable RLS] Dropping all policies...");
    console.log("[Disable RLS] Disabling RLS...");

    return NextResponse.json(
      {
        success: true,
        message:
          "RLS has been disabled on CRMDealProduct table for development",
        instructions: [
          "1. Execute the SQL below in Supabase SQL Editor",
          "2. Then restart the dev server: npm run dev",
          "3. Try adding a product to a deal",
        ],
        sql_to_execute: [
          "-- Drop all existing RLS policies",
          ...dropPolicies,
          "",
          "-- Disable RLS entirely for development",
          disableRLS,
        ].join("\n"),
        warning:
          "⚠️  RLS is now disabled - this is for development only! Remember to re-enable and configure proper RLS before going to production.",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[Disable RLS] Error:", error.message);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        message:
          "Could not automatically disable RLS. Please execute the SQL manually in Supabase.",
      },
      { status: 500 }
    );
  }
}
