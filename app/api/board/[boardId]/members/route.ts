import { auth } from "@/auth";
import prisma from "@/prisma/prisma";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{
    boardId: string;
  }>;
}

export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { boardId } = await params;
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if current user is a board member with owner role
    const boardMembership = await prisma.boardMember.findFirst({
      where: {
        userId: userId,
        boardId: boardId,
        role: "owner",
      },
    });

    if (!boardMembership) {
      return NextResponse.json({ error: "Forbidden - Only board owners can manage members" }, { status: 403 });
    }

    const { userId: targetUserId } = await request.json();

    if (!targetUserId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Check if target user exists and is not admin
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!targetUser || targetUser.role === "ADMIN") {
      return NextResponse.json({ error: "Invalid user" }, { status: 400 });
    }

    // Check if user is already a member
    const existingMembership = await prisma.boardMember.findUnique({
      where: {
        userId_boardId: {
          userId: targetUserId,
          boardId: boardId,
        },
      },
    });

    if (existingMembership) {
      return NextResponse.json({ error: "User is already a board member" }, { status: 400 });
    }

    // Add user as board member
    const newMember = await prisma.boardMember.create({
      data: {
        userId: targetUserId,
        boardId: boardId,
        role: "member",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json(newMember);
  } catch (error) {
    console.error("Error adding board member:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}