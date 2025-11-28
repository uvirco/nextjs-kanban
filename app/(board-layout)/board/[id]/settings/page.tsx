import { auth } from "@/auth";
import prisma from "@/prisma/prisma";
import { redirect } from "next/navigation";
import BoardSettingsClient from "./BoardSettingsClient";

interface BoardSettingsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function BoardSettingsPage({
  params,
}: BoardSettingsPageProps) {
  const { id } = await params;
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/login");
  }

  // Check if user is a board member with owner role (only owners can manage members)
  const boardMembership = await prisma.boardMember.findFirst({
    where: {
      userId: userId,
      boardId: id,
      role: "owner",
    },
  });

  if (!boardMembership) {
    redirect("/board");
  }

  // Fetch board data
  const board = await prisma.board.findUnique({
    where: { id: id },
    include: {
      members: {
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
      },
      labels: true,
      settings: true,
    },
  });

  if (!board) {
    redirect("/board");
  }

  // Fetch all users (excluding ADMIN) for member management
  const allUsers = await prisma.user.findMany({
    where: {
      role: {
        not: "ADMIN",
      },
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
    },
  });

  // Get current board members
  const currentMembers = board.members.map((member) => member.user);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <BoardSettingsClient
          board={board}
          allUsers={allUsers}
          currentMembers={currentMembers}
          labels={board.labels}
        />
      </div>
    </div>
  );
}
