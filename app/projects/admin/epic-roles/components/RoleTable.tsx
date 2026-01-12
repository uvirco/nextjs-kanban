"use client";

import { useState, useMemo } from "react";
import {
  IconDots,
  IconEdit,
  IconTrash,
  IconEye,
  IconEyeOff,
  IconSearch,
  IconChevronUp,
  IconChevronDown,
  IconFilter,
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

  // Filtering and sorting state
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<string>("sortOrder");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Get unique categories for filter dropdown
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(roles.map((role) => role.category))
    );
    return ["all", ...uniqueCategories.sort()];
  }, [roles]);

  // Filter and sort roles
  const filteredAndSortedRoles = useMemo(() => {
    let filtered = roles.filter((role) => {
      const matchesSearch =
        searchTerm === "" ||
        role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        role.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        role.category.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        categoryFilter === "all" || role.category === categoryFilter;
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && role.isActive) ||
        (statusFilter === "inactive" && !role.isActive);

      return matchesSearch && matchesCategory && matchesStatus;
    });

    // Sort the filtered results
    filtered.sort((a, b) => {
      let aValue: any = a[sortField as keyof Role];
      let bValue: any = b[sortField as keyof Role];

      // Handle string sorting
      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [
    roles,
    searchTerm,
    categoryFilter,
    statusFilter,
    sortField,
    sortDirection,
  ]);

  // Handle sorting
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

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
      {/* Filter and Search Bar */}
      <div className="p-4 border-b border-zinc-800">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <IconSearch
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400"
                size={16}
              />
              <input
                type="text"
                placeholder="Search roles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="sm:w-48">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              {categories
                .filter((cat) => cat !== "all")
                .map((category) => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="sm:w-32">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Results count */}
        <div className="mt-2 text-sm text-zinc-400">
          Showing {filteredAndSortedRoles.length} of {roles.length} roles
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-zinc-800">
            <tr>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider cursor-pointer hover:bg-zinc-700 transition-colors"
                onClick={() => handleSort("name")}
              >
                <div className="flex items-center gap-1">
                  Role
                  {sortField === "name" &&
                    (sortDirection === "asc" ? (
                      <IconChevronUp size={14} />
                    ) : (
                      <IconChevronDown size={14} />
                    ))}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider cursor-pointer hover:bg-zinc-700 transition-colors"
                onClick={() => handleSort("category")}
              >
                <div className="flex items-center gap-1">
                  Category
                  {sortField === "category" &&
                    (sortDirection === "asc" ? (
                      <IconChevronUp size={14} />
                    ) : (
                      <IconChevronDown size={14} />
                    ))}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                Description
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider cursor-pointer hover:bg-zinc-700 transition-colors"
                onClick={() => handleSort("sortOrder")}
              >
                <div className="flex items-center gap-1">
                  Order
                  {sortField === "sortOrder" &&
                    (sortDirection === "asc" ? (
                      <IconChevronUp size={14} />
                    ) : (
                      <IconChevronDown size={14} />
                    ))}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider cursor-pointer hover:bg-zinc-700 transition-colors"
                onClick={() => handleSort("isActive")}
              >
                <div className="flex items-center gap-1">
                  Status
                  {sortField === "isActive" &&
                    (sortDirection === "asc" ? (
                      <IconChevronUp size={14} />
                    ) : (
                      <IconChevronDown size={14} />
                    ))}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {filteredAndSortedRoles.map((role) => (
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
