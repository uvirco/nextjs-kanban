import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  return NextResponse.json(
    {
      status: "RLS_POLICY_FIX_REQUIRED",
      message:
        "The CRMDealProduct table RLS policies need to be updated to allow product creation",
      reason: "RLS policies are too restrictive and cannot be modified via API for security reasons",
      solution: "Execute SQL in Supabase console",
      steps: [
        {
          step: 1,
          title: "Open Supabase Console",
          url: "https://app.supabase.com",
          instructions: ["Select your project", "Click 'SQL Editor' in sidebar"],
        },
        {
          step: 2,
          title: "Create New Query",
          instructions: ["Click '+ New Query' button"],
        },
        {
          step: 3,
          title: "Paste SQL",
          instructions: [
            "Copy all the SQL from /api/admin/rls-fix-sql",
            "Paste into the editor",
          ],
        },
        {
          step: 4,
          title: "Execute",
          instructions: [
            "Press Ctrl+Enter (Windows) or Cmd+Enter (Mac)",
            "Wait for 'Query Executed Successfully'",
          ],
        },
        {
          step: 5,
          title: "Restart Dev Server",
          instructions: ["Press Ctrl+C to stop server", "Run: npm run dev"],
        },
        {
          step: 6,
          title: "Test",
          instructions: [
            "Try adding a product to a deal",
            "It should now work!",
          ],
        },
      ],
      sql_endpoint: "/api/admin/rls-fix-sql",
      documentation: "/RLS_POLICY_FIX.md",
    },
    { status: 200 }
  );
}
