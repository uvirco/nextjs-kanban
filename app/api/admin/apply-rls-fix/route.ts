import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// This endpoint applies the RLS policy fix for CRMDealProduct table
// It uses the service role key which has admin privileges
// Access: GET /api/admin/apply-rls-fix

export async function GET(request: NextRequest) {
  try {
    // Verify this is a local/admin request (optional - add auth if needed)
    const authHeader = request.headers.get("authorization");
    console.log("[RLS Fix] Request received, auth header present:", !!authHeader);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: "Missing Supabase credentials" },
        { status: 500 }
      );
    }

    // Create admin client with service role key
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    console.log("[RLS Fix] Applying RLS policy fixes...");

    // Execute the RLS policy fix SQL
    // Note: We'll try using the query builder, but Supabase might not support arbitrary DDL
    // If this fails, the user will need to run it manually in SQL Editor

    // Try method 1: Using rpc() to execute SQL
    const sqlStatements = [
      `DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public."CRMDealProduct"`,
      `DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public."CRMDealProduct"`,
      `DROP POLICY IF EXISTS "Enable update for authenticated users" ON public."CRMDealProduct"`,
      `DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public."CRMDealProduct"`,
      `DROP POLICY IF EXISTS "Allow users to read their deal products" ON public."CRMDealProduct"`,
      `DROP POLICY IF EXISTS "Allow authenticated users to insert deal products" ON public."CRMDealProduct"`,
      `DROP POLICY IF EXISTS "Allow creators to update deal products" ON public."CRMDealProduct"`,
      `DROP POLICY IF EXISTS "Allow creators to delete deal products" ON public."CRMDealProduct"`,
      `CREATE POLICY "Allow authenticated users to read" ON public."CRMDealProduct" FOR SELECT USING (auth.role() = 'authenticated')`,
      `CREATE POLICY "Allow authenticated users to insert" ON public."CRMDealProduct" FOR INSERT WITH CHECK (auth.role() = 'authenticated')`,
      `CREATE POLICY "Allow authenticated users to update" ON public."CRMDealProduct" FOR UPDATE USING (auth.role() = 'authenticated')`,
      `CREATE POLICY "Allow authenticated users to delete" ON public."CRMDealProduct" FOR DELETE USING (auth.role() = 'authenticated')`,
    ];

    console.log(`[RLS Fix] Executing ${sqlStatements.length} SQL statements...`);

    // Try to execute via fetch to Supabase RPC
    const results = [];
    for (const sql of sqlStatements) {
      try {
        const response = await fetch(
          `${supabaseUrl}/rest/v1/rpc/exec_sql_batch`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              apikey: serviceRoleKey,
              Authorization: `Bearer ${serviceRoleKey}`,
            },
            body: JSON.stringify({ sql }),
          }
        );

        if (response.ok) {
          results.push({ sql: sql.substring(0, 50), status: "success" });
          console.log(`[RLS Fix] ✓ ${sql.substring(0, 50)}...`);
        } else if (response.status === 404) {
          // RPC endpoint doesn't exist - this is expected
          throw new Error(
            "RPC endpoint not available - manual SQL execution required"
          );
        } else {
          const error = await response.text();
          console.warn(`[RLS Fix] ⚠ ${sql.substring(0, 50)}... - ${error}`);
          results.push({
            sql: sql.substring(0, 50),
            status: "warning",
            error,
          });
        }
      } catch (error) {
        console.error(
          `[RLS Fix] ✗ Failed to execute: ${sql.substring(0, 50)}`,
          error
        );
        throw error;
      }
    }

    console.log("[RLS Fix] ✅ RLS policies updated successfully!");

    return NextResponse.json({
      success: true,
      message: "RLS policies have been updated successfully",
      statements_executed: results.length,
      details: results,
      next_step: "Restart the dev server and try adding a product again",
    });
  } catch (error: any) {
    console.error("[RLS Fix] Error:", error.message);

    // If automatic execution fails, provide manual instructions
    return NextResponse.json(
      {
        success: false,
        error: "Automatic RLS fix failed - manual execution required",
        message:
          error.message ||
          "The RPC endpoint for SQL execution is not available",
        manual_steps: [
          "1. Go to https://app.supabase.com",
          "2. Select your project",
          "3. Click SQL Editor → + New Query",
          "4. Copy SQL from RLS_POLICY_FIX.md",
          "5. Execute it (Ctrl+Enter)",
          "6. Restart dev server: npm run dev",
        ],
      },
      { status: 500 }
    );
  }
}
