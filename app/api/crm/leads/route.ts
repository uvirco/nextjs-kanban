import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { CRMLead } from "@/types/crm";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!session || !userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Validate UUID format
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const validUserId = uuidRegex.test(userId) ? userId : null;

    const { data: lead, error } = await supabaseAdmin
      .from("CRMLead")
      .insert({
        ...body,
        createdByUserId: validUserId,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating CRM lead:", error);
      return NextResponse.json(
        { error: "Failed to create lead" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      lead: lead as CRMLead,
    });
  } catch (error) {
    console.error("Error in CRM lead creation API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: leads, error } = await supabaseAdmin
      .from("CRMLead")
      .select(
        `
        *,
        contact:CRMContact(*),
        assignedUser:assignedUserId(id, name, email)
      `
      )
      .eq("createdByUserId", userId)
      .order("order", { ascending: true });

    if (error) {
      console.error("Error fetching CRM leads:", error);
      return NextResponse.json(
        { error: "Failed to fetch leads" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      leads: leads as CRMLead[],
    });
  } catch (error) {
    console.error("Error in CRM leads API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
