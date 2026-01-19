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

    const { data: activities, error } = await supabaseAdmin
      .from("CRMActivity")
      .select(
        `
        id,
        type,
        content,
        dealId,
        createdAt,
        createdByUserId,
        createdByUser:createdByUserId(id, name, email)
      `
      )
      .eq("dealId", parseInt(id))
      .order("createdAt", { ascending: false });

    if (error) {
      console.error("Error fetching deal activities:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ activities: activities || [] });
  } catch (error) {
    console.error("Error in deal activities API:", error);
    return NextResponse.json(
      { error: "Failed to fetch activities" },
      { status: 500 }
    );
  }
}
