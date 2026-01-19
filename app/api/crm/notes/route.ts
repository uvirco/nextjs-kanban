import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase";

// GET /api/crm/notes?dealId=123
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const dealId = searchParams.get("dealId");
    const contactId = searchParams.get("contactId");
    const leadId = searchParams.get("leadId");

    let query = supabaseAdmin
      .from("CRMNote")
      .select(`
        *,
        createdByUser:User!CRMNote_createdByUserId_fkey(name, email)
      `)
      .order("isPinned", { ascending: false })
      .order("createdAt", { ascending: false });

    if (dealId) {
      query = query.eq("dealId", parseInt(dealId));
    }
    if (contactId) {
      query = query.eq("contactId", contactId);
    }
    if (leadId) {
      query = query.eq("leadId", leadId);
    }

    const { data: notes, error } = await query;

    if (error) {
      console.error("Error fetching notes:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ notes: notes || [] });
  } catch (error) {
    console.error("Error in notes GET API:", error);
    return NextResponse.json(
      { error: "Failed to fetch notes" },
      { status: 500 }
    );
  }
}

// POST /api/crm/notes
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { content, dealId, contactId, leadId, isPinned } = body;

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
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

    const { data: note, error } = await supabaseAdmin
      .from("CRMNote")
      .insert({
        content,
        dealId: dealId ? parseInt(dealId) : null,
        contactId: contactId || null,
        leadId: leadId || null,
        createdByUserId: user.id,
        isPinned: isPinned || false,
      })
      .select(`
        *,
        createdByUser:User!CRMNote_createdByUserId_fkey(name, email)
      `)
      .single();

    if (error) {
      console.error("Error creating note:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Create activity entry for deals
    if (dealId) {
      // Trim content to 200 characters for preview
      const notePreview =
        content.length > 200
          ? content.substring(0, 200) + "..."
          : content;
      
      await supabaseAdmin.from("CRMActivity").insert({
        type: "NOTE",
        content: `Added a note: ${notePreview}`,
        dealId: parseInt(dealId),
        createdByUserId: user.id,
      });
    }

    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    console.error("Error in notes POST API:", error);
    return NextResponse.json(
      { error: "Failed to create note" },
      { status: 500 }
    );
  }
}
