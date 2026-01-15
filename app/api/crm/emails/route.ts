import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!session || !userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");
    const direction = searchParams.get("direction"); // 'inbound', 'outbound', or null for all

    let query = supabaseAdmin
      .from("CRMEmail")
      .select(`
        id,
        subject,
        body,
        fromEmail,
        toEmail,
        ccEmails,
        sentAt,
        receivedAt,
        direction,
        threadId,
        createdAt,
        contactId,
        dealId,
        leadId
      `)
      .order("receivedAt", { ascending: false, nullsFirst: false })
      .order("sentAt", { ascending: false, nullsFirst: false })
      .range(offset, offset + limit - 1);

    if (direction) {
      query = query.eq("direction", direction.toUpperCase());
    }

    const { data: emails, error } = await query;

    if (error) {
      console.error("Error fetching CRM emails:", error);
      return NextResponse.json(
        { error: "Failed to fetch emails" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      emails: emails || [],
    });
  } catch (error) {
    console.error("Error in CRM emails API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!session || !userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const emailData = await request.json();

    const { data: email, error } = await supabaseAdmin
      .from("CRMEmail")
      .insert({
        ...emailData,
        userId: userId,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating CRM email:", error);
      return NextResponse.json(
        { error: "Failed to create email" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      email: email,
    });
  } catch (error) {
    console.error("Error in CRM email creation API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}