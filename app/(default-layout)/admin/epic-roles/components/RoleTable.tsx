"use client";

import { useState } from "react";
import {
  IconDots,
  IconEdit,
  IconTrash,
  IconEye,
  IconEyeOff,
} from "@tabler/icons-react";
import EditRoleModal from "./EditRoleModal";

interface Role {
  id: string;
  name: string;
  description: string | null;
  category: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

interface RoleTableProps {
  roles: Role[];
}

export default function RoleTable({ roles }: RoleTableProps) {
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    setOpenMenuId(null);
  };

  const handleToggleActive = async (roleId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/epic-roles/${roleId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isActive: !currentStatus,
        }),
      });

      if (response.ok) {
        // Refresh the page to show updated data
        window.location.reload();
      } else {
        alert("Failed to update role status");
      }
    } catch (error) {
      console.error("Error updating role:", error);
      alert("Failed to update role status");
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this role? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/epic-roles/${roleId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Refresh the page to show updated data
        window.location.reload();
      } else {
        alert("Failed to delete role");
      }
    } catch (error) {
      console.error("Error deleting role:", error);
      alert("Failed to delete role");
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      management: "bg-blue-500",
      technical: "bg-green-500",
      design: "bg-purple-500",
      business: "bg-yellow-500",
      operations: "bg-orange-500",
      administration: "bg-pink-500",
      finance: "bg-indigo-500",
      legal: "bg-red-500",
      marketing: "bg-teal-500",
      sales: "bg-cyan-500",
      "customer-service": "bg-lime-500",
      other: "bg-gray-500",
    };
    return colors[category] || "bg-gray-500";
  };

  return (
    <div className="bg-zinc-900 rounded-lg border border-zinc-800">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-zinc-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                Order
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {roles.map((role) => (
              <tr key={role.id} className="hover:bg-zinc-800/50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-white">
                    {role.name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${getCategoryColor(role.category)}`}
                  >
                    {role.category}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-zinc-300 max-w-xs truncate">
                    {role.description || "No description"}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-zinc-300">{role.sortOrder}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      role.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {role.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="relative">
                    <button
                      onClick={() =>
                        setOpenMenuId(openMenuId === role.id ? null : role.id)
                      }
                      className="text-zinc-400 hover:text-white p-1"
                    >
                      <IconDots size={16} />
                    </button>

                    {openMenuId === role.id && (
                      <div className="absolute right-0 mt-2 w-48 bg-zinc-800 rounded-md shadow-lg z-10 border border-zinc-700">
                        <div className="py-1">
                          <button
                            onClick={() => handleEditRole(role)}
                            className="flex items-center w-full px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-700 hover:text-white"
                          >
                            <IconEdit size={16} className="mr-2" />
                            Edit Role
                          </button>
                          <button
                            onClick={() =>
                              handleToggleActive(role.id, role.isActive)
                            }
                            className="flex items-center w-full px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-700 hover:text-white"
                          >
                            {role.isActive ? (
                              <>
                                <IconEyeOff size={16} className="mr-2" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <IconEye size={16} className="mr-2" />
                                Activate
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => handleDeleteRole(role.id)}
                            className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:bg-zinc-700 hover:text-red-300"
                          >
                            <IconTrash size={16} className="mr-2" />
                            Delete Role
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingRole && (
        <EditRoleModal
          role={editingRole}
          isOpen={!!editingRole}
          onClose={() => setEditingRole(null)}
        />
      )}
    </div>
  );
}
