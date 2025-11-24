import { auth } from "@/auth";
import prisma from "@/prisma/prisma";
import UserTable from "./components/UserTable";
import CreateUserModal from "./components/CreateUserModal";
import { Button } from "@nextui-org/button";
import { IconPlus } from "@tabler/icons-react";

export default async function UsersPage() {
  const session = await auth();

  if (!session || !session.user || session.user.role !== "ADMIN") {
    return <div>Access denied</div>;
  }

  const users = await prisma.user.findMany({
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
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">User Management</h1>
          <p className="text-zinc-400 mt-2">Create, edit, and manage user accounts</p>
        </div>
        <CreateUserModal
          trigger={
            <Button color="primary" startContent={<IconPlus size={20} />}>
              Add User
            </Button>
          }
        />
      </div>

      <UserTable users={users} />
    </div>
  );
}