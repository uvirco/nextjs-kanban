import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { storage } from "@/lib/storage-service";

// DELETE /api/crm/attachments/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Get attachment to check if we need to delete from storage
    const { data: attachment } = await supabaseAdmin
      .from("Attachment")
      .select("storage_path")
      .eq("id", id)
      .single();

    // Delete from storage if storage_path exists
    if (attachment?.storage_path) {
      try {
        await storage.delete([attachment.storage_path]);
      } catch (err) {
        console.error("Error deleting file from storage:", err);
      }
    }

    // Delete from database
    const { error } = await supabaseAdmin
      .from("Attachment")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting attachment:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in attachment DELETE API:", error);
    return NextResponse.json(
      { error: "Failed to delete attachment" },
      { status: 500 }
    );
  }
}
