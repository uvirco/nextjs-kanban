import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase";

// GET /api/crm/boards/[id] - Fetch a single board
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const { data, error } = await supabaseAdmin
      .from("CRMBoard")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching board:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: "Board not found" }, { status: 404 });
    }

    return NextResponse.json({ board: data });
  } catch (error: any) {
    console.error("Error in GET /api/crm/boards/[id]:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/crm/boards/[id] - Update a board
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { title, description, backgroundUrl, isDefault } = body;

    // Get current board to check type
    const { data: currentBoard } = await supabaseAdmin
      .from("CRMBoard")
      .select("type")
      .eq("id", id)
      .single();

    if (!currentBoard) {
      return NextResponse.json({ error: "Board not found" }, { status: 404 });
    }

    // If this is set as default, unset other defaults
    if (isDefault) {
      await supabaseAdmin
        .from("CRMBoard")
        .update({ isDefault: false })
        .eq("type", currentBoard.type)
        .neq("id", id);
    }

    const updateData: any = {
      updatedAt: new Date().toISOString(),
    };

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (backgroundUrl !== undefined) updateData.backgroundUrl = backgroundUrl;
    if (isDefault !== undefined) updateData.isDefault = isDefault;

    const { data, error } = await supabaseAdmin
      .from("CRMBoard")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating board:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ board: data });
  } catch (error: any) {
    console.error("Error in PUT /api/crm/boards/[id]:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/crm/boards/[id] - Delete a board
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check if this is the default board
    const { data: board } = await supabaseAdmin
      .from("CRMBoard")
      .select("isDefault, title")
      .eq("id", id)
      .single();

    if (board?.isDefault) {
      return NextResponse.json(
        {
          error:
            "Cannot delete the default board. Set another board as default first.",
        },
        { status: 400 }
      );
    }

    // Check if there are any deals on this board
    const { data: deals, error: dealsError } = await supabaseAdmin
      .from("CRMDeal")
      .select("deal_id")
      .eq("boardId", id)
      .limit(1);

    if (dealsError) {
      console.error("Error checking deals:", dealsError);
      return NextResponse.json(
        { error: "Error checking board usage" },
        { status: 500 }
      );
    }

    if (deals && deals.length > 0) {
      return NextResponse.json(
        {
          error:
            "Cannot delete board with existing deals. Move or delete deals first.",
        },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from("CRMBoard")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting board:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error in DELETE /api/crm/boards/[id]:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
