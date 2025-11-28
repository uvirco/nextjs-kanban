import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{
    boardId: string;
  }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { boardId } = await params;
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if current user is a board member with owner role
    const { data: boardMembership, error: membershipError } =
      await supabaseAdmin
        .from("BoardMember")
        .select("*")
        .eq("userId", userId)
        .eq("boardId", boardId)
        .eq("role", "owner")
        .single();

    if (membershipError || !boardMembership) {
      return NextResponse.json(
        { error: "Forbidden - Only board owners can manage members" },
        { status: 403 }
      );
    }

    const { userId: targetUserId } = await request.json();

    if (!targetUserId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Check if target user exists and is not admin
    const { data: targetUser, error: userError } = await supabaseAdmin
      .from("User")
      .select("*")
      .eq("id", targetUserId)
      .single();

    if (userError || !targetUser || targetUser.role === "ADMIN") {
      return NextResponse.json({ error: "Invalid user" }, { status: 400 });
    }

    // Check if user is already a member
    const { data: existingMembership, error: existingError } =
      await supabaseAdmin
        .from("BoardMember")
        .select("*")
        .eq("userId", targetUserId)
        .eq("boardId", boardId)
        .single();

    if (existingMembership) {
      return NextResponse.json(
        { error: "User is already a board member" },
        { status: 400 }
      );
    }

    // Add user as board member
    const { data: newMember, error: createError } = await supabaseAdmin
      .from("BoardMember")
      .insert({
        userId: targetUserId,
        boardId: boardId,
        role: "member",
      })
      .select(
        `
        *,
        user:User (
          id,
          name,
          email,
          image,
          role
        )
      `
      )
      .single();

    if (createError) {
      console.error("Error creating board member:", createError);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }

    return NextResponse.json(newMember);
  } catch (error) {
    console.error("Error adding board member:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
