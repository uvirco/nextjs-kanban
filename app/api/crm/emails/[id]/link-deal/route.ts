import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    const { id } = await params;

    if (!session || !userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { dealId } = await request.json();

    const { error } = await supabaseAdmin
      .from("CRMEmail")
      .update({ dealId: dealId || null })
      .eq("id", id);

    if (error) {
      console.error("Error linking email to deal:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in link-deal API:", error);
    return NextResponse.json(
      { error: "Failed to link email to deal" },
      { status: 500 }
    );
  }
}
