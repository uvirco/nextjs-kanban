import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { IconUsers, IconUserCheck, IconUserX } from "@tabler/icons-react";
import type { User } from "@/types/types";

export default async function AdminDashboard() {
  const session = await auth();

  if (!session || !session.user || session.user.role !== "ADMIN") {
    return <div>Access denied</div>;
  }

  // Get user statistics
  const { count: totalUsers } = await supabaseAdmin
    .from("User")
    .select("*", { count: "exact", head: true });

  const { count: activeUsers } = await supabaseAdmin
    .from("User")
    .select("*", { count: "exact", head: true })
    .eq("isActive", true);

  const inactiveUsers = (totalUsers || 0) - (activeUsers || 0);

  // Get recent users
  const { data: recentUsers, error } = await supabaseAdmin
    .from("User")
    .select("id, name, email, role, isActive, createdAt")
    .order("createdAt", { ascending: false })
    .limit(5);

  if (error) {
    console.error("Failed to fetch recent users:", error);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-zinc-400 mt-2">Manage users and system settings</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <IconUsers className="text-blue-400" size={24} />
            <div>
              <p className="text-sm text-zinc-400">Total Users</p>
              <p className="text-2xl font-bold text-white">{totalUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <IconUserCheck className="text-green-400" size={24} />
            <div>
              <p className="text-sm text-zinc-400">Active Users</p>
              <p className="text-2xl font-bold text-white">{activeUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <IconUserX className="text-red-400" size={24} />
            <div>
              <p className="text-sm text-zinc-400">Inactive Users</p>
              <p className="text-2xl font-bold text-white">{inactiveUsers}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Users */}
      <div className="bg-zinc-800 border border-zinc-700 rounded-lg">
        <div className="p-6 border-b border-zinc-700">
          <h2 className="text-xl font-semibold text-white">Recent Users</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {recentUsers &&
              (recentUsers as User[]).map((user: User) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 bg-zinc-700 rounded-lg"
                >
                  <div>
                    <p className="text-white font-medium">{user.name}</p>
                    <p className="text-zinc-400 text-sm">{user.email}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        user.role === "ADMIN"
                          ? "bg-red-600 text-white"
                          : user.role === "MANAGER"
                            ? "bg-blue-600 text-white"
                            : "bg-green-600 text-white"
                      }`}
                    >
                      {user.role}
                    </span>
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        user.isActive
                          ? "bg-green-600 text-white"
                          : "bg-red-600 text-white"
                      }`}
                    >
                      {user.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
