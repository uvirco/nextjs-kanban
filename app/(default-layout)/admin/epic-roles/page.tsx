import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase";
import RoleTable from "./components/RoleTable";
import CreateRoleModal from "./components/CreateRoleModal";
import { Button } from "@nextui-org/button";
import { IconPlus } from "@tabler/icons-react";

export default async function EpicRolesPage() {
  const session = await auth();

  if (!session || !session.user || session.user.role !== "ADMIN") {
    return <div>Access denied</div>;
  }

  // Get all roles
  const { data: rolesData, error: rolesError } = await supabaseAdmin
    .from("EpicRole")
    .select("*")
    .order("sortOrder", { ascending: true });

  if (rolesError) {
    console.error("Failed to fetch roles:", rolesError);
  }

  const roles = rolesData || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Epic Role Management</h1>
          <p className="text-zinc-400 mt-2">Create, edit, and manage epic team member roles</p>
        </div>
        <CreateRoleModal
          trigger={
            <Button color="primary" startContent={<IconPlus size={20} />}>
              Add Role
            </Button>
          }
        />
      </div>

      <RoleTable roles={roles} />
    </div>
  );
}