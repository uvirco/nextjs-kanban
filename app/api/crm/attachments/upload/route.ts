import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase";

// POST /api/crm/attachments/upload (for file uploads that are already in storage)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { filename, storagePath, size, mimeType, dealId, contactId, leadId } =
      body;

    if (!filename || !storagePath) {
      return NextResponse.json(
        { error: "Filename and storage path are required" },
        { status: 400 },
      );
    }

    // Determine parent type and ID
    const parentType = dealId
      ? "crm_deal"
      : contactId
        ? "crm_contact"
        : leadId
          ? "crm_lead"
          : null;
    const parentId = dealId || contactId || leadId;

    if (!parentType || !parentId) {
      return NextResponse.json(
        { error: "Must specify dealId, contactId, or leadId" },
        { status: 400 },
      );
    }

    // Get user ID from session
    const { data: user } = await supabaseAdmin
      .from("User")
      .select("id")
      .eq("email", session.user.email)
      .single();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { data: attachment, error } = await supabaseAdmin
      .from("Attachment")
      .insert({
        filename,
        storage_path: storagePath,
        url: null, // Will be generated on demand
        size: size || null,
        mimeType: mimeType || null,
        parent_type: parentType,
        parent_id: String(parentId),
        uploadedBy: user.id,
      })
      .select(
        `
        *,
        uploadedByUser:User!Attachment_uploadedBy_fkey(name, email)
      `,
      )
      .single();

    if (error) {
      console.error("Error creating attachment:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(attachment, { status: 201 });
  } catch (error) {
    console.error("Error in attachments upload API:", error);
    return NextResponse.json(
      { error: "Failed to create attachment" },
      { status: 500 },
    );
  }
}
