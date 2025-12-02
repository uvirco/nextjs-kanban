"use client";

import { useState } from "react";
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconUser,
  IconBuilding,
} from "@tabler/icons-react";

interface Department {
  id: string;
  name: string;
  description: string | null;
  managerId: string | null;
  manager?: {
    id: string;
    name: string | null;
    email: string | null;
  };
  createdAt: string;
  updatedAt: string;
}

interface User {
  id: string;
  name: string | null;
  email: string | null;
}

interface DepartmentsManagementProps {
  initialDepartments: Department[];
  users: User[];
}

export default function DepartmentsManagement({
  initialDepartments,
  users,
}: DepartmentsManagementProps) {
  const [departments, setDepartments] =
    useState<Department[]>(initialDepartments);
  const [isAddingDepartment, setIsAddingDepartment] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(
    null
  );
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    managerId: "",
  });

  const resetForm = () => {
    setFormData({ name: "", description: "", managerId: "" });
    setIsAddingDepartment(false);
    setEditingDepartment(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingDepartment
        ? `/api/departments/${editingDepartment.id}`
        : "/api/departments";

      const method = editingDepartment ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description || null,
          managerId: formData.managerId || null,
        }),
      });

      if (response.ok) {
        const updatedDepartment = await response.json();

        if (editingDepartment) {
          setDepartments(
            departments.map((dept) =>
              dept.id === editingDepartment.id ? updatedDepartment : dept
            )
          );
        } else {
          setDepartments([...departments, updatedDepartment]);
        }

        resetForm();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to save department");
      }
    } catch (error) {
      console.error("Error saving department:", error);
      alert("Failed to save department");
    }
  };

  const handleEdit = (department: Department) => {
    setEditingDepartment(department);
    setFormData({
      name: department.name,
      description: department.description || "",
      managerId: department.managerId || "",
    });
  };

  const handleDelete = async (departmentId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this department? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/departments/${departmentId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setDepartments(departments.filter((dept) => dept.id !== departmentId));
      } else {
        const error = await response.json();
        alert(error.error || "Failed to delete department");
      }
    } catch (error) {
      console.error("Error deleting department:", error);
      alert("Failed to delete department");
    }
  };

  return (
    <div className="space-y-6">
      {/* Add Department Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-white">Departments</h2>
          <p className="text-zinc-400 text-sm">
            {departments.length} department{departments.length !== 1 ? "s" : ""}{" "}
            configured
          </p>
        </div>
        <button
          onClick={() => setIsAddingDepartment(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <IconPlus size={16} />
          Add Department
        </button>
      </div>

      {/* Add/Edit Form */}
      {(isAddingDepartment || editingDepartment) && (
        <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            {editingDepartment ? "Edit Department" : "Add New Department"}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Department Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter department name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
                className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe the department's purpose and responsibilities"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Department Manager
              </label>
              <select
                value={formData.managerId}
                onChange={(e) =>
                  setFormData({ ...formData, managerId: e.target.value })
                }
                className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a manager (optional)</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name || user.email}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                {editingDepartment ? "Update Department" : "Create Department"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-zinc-600 hover:bg-zinc-700 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Departments List */}
      <div className="bg-zinc-800 border border-zinc-700 rounded-lg">
        <div className="p-6">
          <div className="space-y-4">
            {departments.length === 0 ? (
              <div className="text-center py-8 text-zinc-400">
                <IconBuilding size={48} className="mx-auto mb-4 opacity-50" />
                <p>No departments configured yet</p>
                <p className="text-sm">Click "Add Department" to get started</p>
              </div>
            ) : (
              departments.map((department) => (
                <div
                  key={department.id}
                  className="flex items-center justify-between p-4 bg-zinc-700 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <IconBuilding size={20} className="text-blue-400" />
                      <div>
                        <h3 className="text-white font-medium">
                          {department.name}
                        </h3>
                        {department.description && (
                          <p className="text-zinc-400 text-sm">
                            {department.description}
                          </p>
                        )}
                      </div>
                    </div>
                    {department.manager && (
                      <div className="flex items-center gap-2 mt-2 text-sm text-zinc-400">
                        <IconUser size={14} />
                        <span>
                          Manager:{" "}
                          {department.manager.name || department.manager.email}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(department)}
                      className="p-2 text-zinc-400 hover:text-blue-400 transition-colors"
                      title="Edit department"
                    >
                      <IconEdit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(department.id)}
                      className="p-2 text-zinc-400 hover:text-red-400 transition-colors"
                      title="Delete department"
                    >
                      <IconTrash size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
