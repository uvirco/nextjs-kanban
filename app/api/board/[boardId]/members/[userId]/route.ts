import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{
    boardId: string;
    userId: string;
  }>;
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { boardId, userId: targetUserId } = await params;
    const session = await auth();
    const currentUserId = session?.user?.id;

    if (!currentUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if current user is a board member with owner role
    const { data: boardMembership, error: membershipError } =
      await supabaseAdmin
        .from("BoardMember")
        .select("*")
        .eq("userId", currentUserId)
        .eq("boardId", boardId)
        .eq("role", "owner")
        .single();

    if (membershipError || !boardMembership) {
      return NextResponse.json(
        { error: "Forbidden - Only board owners can manage members" },
        { status: 403 }
      );
    }

    // Prevent removing yourself if you're the only owner
    if (targetUserId === currentUserId) {
      const { count: ownerCount, error: countError } = await supabaseAdmin
        .from("BoardMember")
        .select("*", { count: "exact", head: true })
        .eq("boardId", boardId)
        .eq("role", "owner");

      if (countError) {
        console.error("Error counting owners:", countError);
        return NextResponse.json(
          { error: "Internal server error" },
          { status: 500 }
        );
      }

      if (ownerCount && ownerCount <= 1) {
        return NextResponse.json(
          { error: "Cannot remove the last owner from the board" },
          { status: 400 }
        );
      }
    }

    // Check if target user is a board member
    const { data: targetMembership, error: targetError } = await supabaseAdmin
      .from("BoardMember")
      .select("*")
      .eq("userId", targetUserId)
      .eq("boardId", boardId)
      .single();

    if (targetError || !targetMembership) {
      return NextResponse.json(
        { error: "User is not a board member" },
        { status: 400 }
      );
    }

    // Remove user from board
    const { error: deleteError } = await supabaseAdmin
      .from("BoardMember")
      .delete()
      .eq("userId", targetUserId)
      .eq("boardId", boardId);

    if (deleteError) {
      console.error("Error removing board member:", deleteError);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing board member:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
