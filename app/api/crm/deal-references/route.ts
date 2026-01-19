import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase";

// GET /api/crm/deal-references?boardId=xxx
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const boardId = searchParams.get("boardId");

    if (!boardId) {
      return NextResponse.json(
        { error: "boardId is required" },
        { status: 400 }
      );
    }

    // Fetch reference cards with joined deal data
    const { data: references, error } = await supabaseAdmin
      .from("CRMDealReference")
      .select(`
        *,
        deal:CRMDeal!CRMDealReference_dealId_fkey(
          deal_id,
          title,
          value,
          stage,
          boardId
        )
      `)
      .eq("boardId", boardId)
      .order("createdAt", { ascending: false });

    if (error) {
      console.error("Error fetching deal references:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ references: references || [] });
  } catch (error) {
    console.error("Error in deal references API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
