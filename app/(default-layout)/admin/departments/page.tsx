import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import DepartmentsManagement from "./DepartmentsManagement";

export default async function AdminDepartmentsPage() {
  const session = await auth();

  if (!session || !session.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  // Fetch departments
  const { data: departments, error } = await supabaseAdmin
    .from("Department")
    .select("*")
    .order("name");

  if (error) {
    console.error("Error fetching departments:", error);
  }

  // Fetch users for manager selection
  const { data: users } = await supabaseAdmin
    .from("User")
    .select("id, name, email")
    .eq("isActive", true)
    .order("name");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Department Management</h1>
        <p className="text-zinc-400 mt-2">
          Manage organizational departments for better task categorization
        </p>
      </div>

      <DepartmentsManagement
        initialDepartments={departments || []}
        users={users || []}
      />
    </div>
  );
}