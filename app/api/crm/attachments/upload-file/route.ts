import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { storage } from "@/lib/storage-service";

// POST /api/crm/attachments/upload-file (for complete file upload: storage + database)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const dealId = formData.get("dealId") as string;
    const contactId = formData.get("contactId") as string;
    const leadId = formData.get("leadId") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
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
        { status: 400 }
      );
    }

    // Upload to storage
    const attachmentId = crypto.randomUUID();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const storagePath = `crm/${parentType.replace("crm_", "")}s/${parentId}/${attachmentId}-${safeName}`;

    const buffer = Buffer.from(await file.arrayBuffer());
    const { error: uploadError } = await storage.upload(storagePath, buffer, {
      contentType: file.type,
    });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload file to storage" },
        { status: 500 }
      );
    }

    // Get user ID from session
    const { data: user } = await supabaseAdmin
      .from("User")
      .select("id")
      .eq("email", session.user.email)
      .single();

    if (!user) {
      // Clean up storage if user not found
      await storage.delete([storagePath]);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Save to database
    const { data: attachment, error } = await supabaseAdmin
      .from("Attachment")
      .insert({
        filename: file.name,
        storage_path: storagePath,
        url: null,
        size: file.size,
        mimeType: file.type,
        parent_type: parentType,
        parent_id: String(parentId),
        uploadedBy: user.id,
      })
      .select(`
        *,
        uploadedByUser:User!Attachment_uploadedBy_fkey(name, email)
      `)
      .single();

    if (error) {
      console.error("Error creating attachment:", error);
      // Clean up storage on database error
      await storage.delete([storagePath]);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Create activity entry for file attachment (only for deals)
    if (dealId) {
      const fileSize = file.size
        ? ` (${(file.size / 1024).toFixed(0)} KB)`
        : "";
      await supabaseAdmin.from("CRMActivity").insert({
        type: "FILE_ATTACHED",
        content: `Attached file: ${file.name}${fileSize}`,
        dealId: String(dealId),
        createdByUserId: user.id,
      });
    }

    return NextResponse.json(attachment, { status: 201 });
  } catch (error) {
    console.error("Error in file upload API:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
