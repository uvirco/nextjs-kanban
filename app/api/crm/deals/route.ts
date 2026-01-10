import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { CRMDeal } from "@/types/crm";

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

    const { data: deal, error } = await supabaseAdmin
      .from("CRMDeal")
      .insert({
        ...body,
        createdByUserId: validUserId,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating CRM deal:", error);
      return NextResponse.json(
        { error: "Failed to create deal" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      deal: deal as CRMDeal,
    });
  } catch (error) {
    console.error("Error in CRM deal creation API:", error);
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

    // Validate UUID format
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const validUserId = uuidRegex.test(userId) ? userId : null;

    const { data: deals, error } = await supabaseAdmin
      .from("CRMDeal")
      .select(
        `
        *,
        contact:contactId(*)
      `
      )
      .order("order", { ascending: true });

    if (error) {
      console.error("Error fetching CRM deals:", error);
      return NextResponse.json(
        { error: "Failed to fetch deals", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      deals: deals as CRMDeal[],
    });
  } catch (error) {
    console.error("Error in CRM deals API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
