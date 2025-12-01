import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string; role: string }> }
) {
  try {
    const { id: epicId, userId, role } = await params;

    const { error } = await supabaseAdmin
      .from("RACIMatrix")
      .delete()
      .eq("epicId", epicId)
      .eq("userId", userId)
      .eq("role", role);

    if (error) {
      console.error("Error deleting RACI entry:", error);
      return NextResponse.json(
        { error: "Failed to delete RACI entry" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(
      "Error in DELETE /api/epics/[id]/raci/[userId]/[role]:",
      error
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
