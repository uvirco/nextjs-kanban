import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  IconUsers,
  IconSettings,
  IconDashboard,
  IconBuilding,
  IconUserCheck,
} from "@tabler/icons-react";
import AdminSignOutButton from "./AdminSignOutButton";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session || !session.user || session.user.role !== "ADMIN") {
    redirect("/projects/dashboard");
  }

  return (
    <div className="min-h-screen bg-zinc-900">
      {/* Admin Header */}
      <nav className="border-b border-zinc-800 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/projects/dashboard"
                className="text-zinc-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Back to App
              </Link>
              <AdminSignOutButton />
            </div>
          </div>
        </div>
      </nav>

      {/* Admin Sidebar */}
      <div className="flex">
        <div className="w-64 bg-zinc-950 min-h-screen border-r border-zinc-800">
          <nav className="mt-8">
            <div className="px-4 space-y-2">
              <Link
                href="/projects/admin"
                className="flex items-center px-4 py-2 text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-md"
              >
                <IconDashboard size={20} className="mr-3" />
                Dashboard
              </Link>
              <Link
                href="/projects/admin/users"
                className="flex items-center px-4 py-2 text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-md"
              >
                <IconUsers size={20} className="mr-3" />
                User Management
              </Link>
              <Link
                href="/projects/admin/departments"
                className="flex items-center px-4 py-2 text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-md"
              >
                <IconBuilding size={20} className="mr-3" />
                Departments
              </Link>
              <Link
                href="/projects/admin/epic-roles"
                className="flex items-center px-4 py-2 text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-md"
              >
                <IconUserCheck size={20} className="mr-3" />
                Epic Roles
              </Link>
              <Link
                href="/projects/admin/settings"
                className="flex items-center px-4 py-2 text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-md"
              >
                <IconSettings size={20} className="mr-3" />
                Settings
              </Link>
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">{children}</div>
      </div>
    </div>
  );
}
