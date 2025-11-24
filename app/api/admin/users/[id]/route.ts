import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/prisma/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const updateUserSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  email: z.string().email("Invalid email").optional(),
  password: z.string().min(4, "Password must be at least 4 characters").optional(),
  role: z.enum(["ADMIN", "MANAGER", "MEMBER"]).optional(),
  isActive: z.boolean().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session || !session.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            memberBoards: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session || !session.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = updateUserSchema.parse(body);

    // Hash password if provided
    let updateData = { ...validatedData };
    if (validatedData.password) {
      updateData.password = await bcrypt.hash(validatedData.password, 12);
    }

    const user = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error updating user:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session || !session.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Prevent deleting the current admin user
    if (params.id === session.user.id) {
      return NextResponse.json(
        { message: "Cannot delete your own account" },
        { status: 400 }
      );
    }

    await prisma.user.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}