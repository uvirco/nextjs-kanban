import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase";
import UserTable from "./components/UserTable";
import CreateUserModal from "./components/CreateUserModal";
import { Button } from "@nextui-org/button";
import { IconPlus } from "@tabler/icons-react";

export default async function UsersPage() {
  const session = await auth();

  if (!session || !session.user || session.user.role !== "ADMIN") {
    return <div>Access denied</div>;
  }

  // Get all board members count per user
  const { data: boardMemberCounts } = await supabaseAdmin
    .from("BoardMember")
    .select("userId");

  // Create a map of userId to count
  const memberCountMap: Record<string, number> = {};
  boardMemberCounts?.forEach((bm) => {
    memberCountMap[bm.userId] = (memberCountMap[bm.userId] || 0) + 1;
  });

  // Get users
  const { data: usersData, error: usersError } = await supabaseAdmin
    .from("User")
    .select("id, name, email, role, isActive, createdAt, updatedAt")
    .order("createdAt", { ascending: false });

  if (usersError) {
    console.error("Failed to fetch users:", usersError);
  }

  // Map users with their board count
  const users = usersData?.map(user => ({
    ...user,
    _count: {
      memberBoards: memberCountMap[user.id] || 0,
    },
  })) || [];

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