import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { auth } from "@/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const { data: history, error } = await supabaseAdmin
      .from("CRMDealStageHistory")
      .select(`
        id,
        dealId,
        fromStage,
        toStage,
        changedAt,
        notes,
        changedByUserId,
        changedByUser:changedByUserId(id, name, email)
      `)
      .eq("dealId", parseInt(id))
      .order("changedAt", { ascending: false });

    if (error) {
      console.error("Error fetching deal stage history:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ history: history || [] });
  } catch (error) {
    console.error("Error in deal stage history API:", error);
    return NextResponse.json(
      { error: "Failed to fetch stage history" },
      { status: 500 }
    );
  }
}
