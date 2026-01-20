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

    let isRead = true;
    try {
      const body = await request.json();
      isRead = body.isRead !== undefined ? body.isRead : true;
    } catch {
      // No body provided, default to marking as read
      isRead = true;
    }

    const { error } = await supabaseAdmin
      .from("CRMEmail")
      .update({ isRead })
      .eq("id", id)
      .eq("userId", userId); // Ensure user can only update their own emails

    if (error) {
      console.error("Error marking email as read:", error);
      return NextResponse.json(
        { error: "Failed to mark email as read" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in mark as read API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
