import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ id: string; userId: string }> }
) {
  const params = await props.params;
  try {
    const { error } = await supabaseAdmin
      .from("EpicMember")
      .delete()
      .eq("epicId", params.id)
      .eq("userId", params.userId);

    if (error) {
      console.error("Error removing epic member:", error);
      return NextResponse.json(
        { error: "Failed to remove team member from epic" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/epics/[id]/members/[userId]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
