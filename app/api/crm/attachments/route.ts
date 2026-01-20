import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { storage } from "@/lib/storage-service";

// GET /api/crm/attachments?dealId=123&type=crm_deal
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const parentId =
      searchParams.get("dealId") ||
      searchParams.get("contactId") ||
      searchParams.get("leadId");
    const parentType = searchParams.get("dealId")
      ? "crm_deal"
      : searchParams.get("contactId")
        ? "crm_contact"
        : searchParams.get("leadId")
          ? "crm_lead"
          : null;

    if (!parentId || !parentType) {
      return NextResponse.json(
        { error: "Parent ID and type are required" },
        { status: 400 },
      );
    }

    const { data: attachments, error } = await supabaseAdmin
      .from("Attachment")
      .select(
        `
        *,
        uploadedByUser:User!Attachment_uploadedBy_fkey(name, email)
      `,
      )
      .eq("parent_type", parentType)
      .eq("parent_id", parentId)
      .order("createdAt", { ascending: false });

    if (error) {
      console.error("Error fetching attachments:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // For uploaded files, generate signed URLs if needed
    const attachmentsWithUrls = await Promise.all(
      (attachments || []).map(async (attachment: any) => {
        // If storage_path exists and url is empty, generate URL
        if (attachment.storage_path && !attachment.url) {
          try {
            const publicUrl = storage.getPublicUrl(attachment.storage_path);

            return {
              ...attachment,
              url: publicUrl,
            };
          } catch (err) {
            console.error("Error getting file URL:", err);
            return attachment;
          }
        }
        return attachment;
      }),
    );

    return NextResponse.json({ attachments: attachmentsWithUrls });
  } catch (error) {
    console.error("Error in attachments GET API:", error);
    return NextResponse.json(
      { error: "Failed to fetch attachments" },
      { status: 500 },
    );
  }
}

// POST /api/crm/attachments (for link attachments)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { filename, url, dealId, contactId, leadId } = body;

    if (!filename || !url) {
      return NextResponse.json(
        { error: "Filename and URL are required" },
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
        url,
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

    // Create activity entry for link attachment (only for deals)
    if (dealId) {
      await supabaseAdmin.from("CRMActivity").insert({
        type: "FILE_ATTACHED",
        content: `Added link: ${filename}`,
        dealId: String(dealId),
        createdByUserId: user.id,
      });
    }

    return NextResponse.json(attachment, { status: 201 });
  } catch (error) {
    console.error("Error in attachments POST API:", error);
    return NextResponse.json(
      { error: "Failed to create attachment" },
      { status: 500 },
    );
  }
}
