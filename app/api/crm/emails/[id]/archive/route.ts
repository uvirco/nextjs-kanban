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

    const { status } = await request.json();

    // Validate status
    if (!["ACTIVE", "ARCHIVED", "DELETED"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("CRMEmail")
      .update({ status })
      .eq("id", id)
      .select();

    if (error) {
      console.error("Error updating email status:", error);
      return NextResponse.json(
        { error: "Failed to update email status", details: error.message },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      console.error("No email found with id:", id);
      return NextResponse.json({ error: "Email not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, email: data[0] });
  } catch (error) {
    console.error("Error in archive API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
