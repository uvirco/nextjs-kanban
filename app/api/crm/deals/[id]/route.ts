import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { CRMDeal } from "@/types/crm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!session || !userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const { data: deal, error } = await supabaseAdmin
      .from("CRMDeal")
      .select(
        `
        *,
        contact:CRMContact(*),
        assignedUser:assignedUserId(id, name, email)
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching CRM deal:", error);
      return NextResponse.json(
        { error: "Failed to fetch deal" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      deal: deal as CRMDeal,
    });
  } catch (error) {
    console.error("Error in CRM deal API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!session || !userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const { data: deal, error } = await supabaseAdmin
      .from("CRMDeal")
      .update({
        ...body,
        updatedAt: new Date().toISOString(),
      })
      .eq("id", id)
      .select(
        `
        *,
        contact:contactId(*)
      `
      )
      .single();

    if (error) {
      console.error("Error updating CRM deal:", error);
      return NextResponse.json(
        { error: "Failed to update deal", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      deal: deal as CRMDeal,
    });
  } catch (error) {
    console.error("Error in CRM deal update API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!session || !userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const { error } = await supabaseAdmin.from("CRMDeal").delete().eq("id", id);

    if (error) {
      console.error("Error deleting CRM deal:", error);
      return NextResponse.json(
        { error: "Failed to delete deal" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Error in CRM deal deletion API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
