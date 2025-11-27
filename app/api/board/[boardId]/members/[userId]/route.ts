import { auth } from "@/auth";
import prisma from "@/prisma/prisma";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{
    boardId: string;
    userId: string;
  }>;
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { boardId, userId: targetUserId } = await params;
    const session = await auth();
    const currentUserId = session?.user?.id;

    if (!currentUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if current user is a board member with owner role
    const boardMembership = await prisma.boardMember.findFirst({
      where: {
        userId: currentUserId,
        boardId: boardId,
        role: "owner",
      },
    });

    if (!boardMembership) {
      return NextResponse.json({ error: "Forbidden - Only board owners can manage members" }, { status: 403 });
    }

    // Prevent removing yourself if you're the only owner
    if (targetUserId === currentUserId) {
      const ownerCount = await prisma.boardMember.count({
        where: {
          boardId: boardId,
          role: "owner",
        },
      });

      if (ownerCount <= 1) {
        return NextResponse.json({ error: "Cannot remove the last owner from the board" }, { status: 400 });
      }
    }

    // Check if target user is a board member
    const targetMembership = await prisma.boardMember.findUnique({
      where: {
        userId_boardId: {
          userId: targetUserId,
          boardId: boardId,
        },
      },
    });

    if (!targetMembership) {
      return NextResponse.json({ error: "User is not a board member" }, { status: 400 });
    }

    // Remove user from board
    await prisma.boardMember.delete({
      where: {
        userId_boardId: {
          userId: targetUserId,
          boardId: boardId,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing board member:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}