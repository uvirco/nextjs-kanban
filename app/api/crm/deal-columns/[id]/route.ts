import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase";

// PUT /api/crm/deal-columns/[id] - Update a column
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, stage, color, order } = body;

    const updateData: any = {
      updatedAt: new Date().toISOString(),
    };

    if (title !== undefined) updateData.title = title;
    if (stage !== undefined) updateData.stage = stage;
    if (color !== undefined) updateData.color = color;
    if (order !== undefined) updateData.order = order;

    const { data: column, error } = await supabaseAdmin
      .from("CRMColumn")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating CRM column:", error);
      return NextResponse.json(
        { error: "Failed to update column", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ column });
  } catch (error) {
    console.error("Error in CRM column PUT API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/crm/deal-columns/[id] - Delete a column
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if there are deals in this column
    const { data: deals } = await supabaseAdmin
      .from("CRMDeal")
      .select("id")
      .eq("stage", id)
      .limit(1);

    if (deals && deals.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete column with existing deals" },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from("CRMColumn")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting CRM column:", error);
      return NextResponse.json(
        { error: "Failed to delete column", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in CRM column DELETE API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
