"use client";

import { useState } from "react";
import { IconDots, IconEdit, IconTrash, IconEye, IconUserOff, IconUserCheck } from "@tabler/icons-react";
import EditUserModal from "./EditUserModal";

interface User {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    memberBoards: number;
  };
}

interface UserTableProps {
  users: User[];
}

export default function UserTable({ users }: UserTableProps) {
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setOpenMenuId(null);
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        window.location.reload();
      } else {
        alert("Failed to delete user");
      }
    } catch (error) {
      alert("Error deleting user");
    }
    setOpenMenuId(null);
  };

  const handleToggleActive = async (userId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive: !isActive }),
      });

      if (response.ok) {
        window.location.reload();
      } else {
        alert("Failed to update user");
      }
    } catch (error) {
      alert("Error updating user");
    }
    setOpenMenuId(null);
  };

  return (
    <>
      <div className="bg-zinc-800 rounded-lg overflow-hidden border border-zinc-700">
        <table className="w-full">
          <thead className="bg-zinc-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-zinc-300 uppercase">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-zinc-300 uppercase">Email</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-zinc-300 uppercase">Role</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-zinc-300 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-zinc-300 uppercase">Boards</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-zinc-300 uppercase">Created</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-zinc-300 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-700">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-zinc-700/50">
                <td className="px-4 py-3 text-white">
                  {user.name || "No name"}
                </td>
                <td className="px-4 py-3 text-zinc-300">
                  {user.email}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs ${
                    user.role === 'ADMIN' ? 'bg-red-600 text-white' :
                    user.role === 'MANAGER' ? 'bg-blue-600 text-white' :
                    'bg-green-600 text-white'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs ${
                    user.isActive ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                  }`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3 text-zinc-300">
                  {user._count.memberBoards}
                </td>
                <td className="px-4 py-3 text-zinc-400">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <div className="relative">
                    <button
                      onClick={() => setOpenMenuId(openMenuId === user.id ? null : user.id)}
                      className="p-1 hover:bg-zinc-600 rounded"
                    >
                      <IconDots size={16} />
                    </button>
                    
                    {openMenuId === user.id && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setOpenMenuId(null)}
                        />
                        <div className="absolute right-0 z-20 mt-1 w-48 bg-zinc-900 border border-zinc-700 rounded-md shadow-lg overflow-hidden">
                          <button
                            onClick={() => handleEditUser(user)}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-white hover:bg-zinc-800"
                          >
                            <IconEdit size={16} />
                            Edit User
                          </button>
                          <button
                            onClick={() => handleToggleActive(user.id, user.isActive)}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-white hover:bg-zinc-800"
                          >
                            {user.isActive ? <IconUserOff size={16} /> : <IconUserCheck size={16} />}
                            {user.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-zinc-800"
                          >
                            <IconTrash size={16} />
                            Delete User
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingUser && (
        <EditUserModal
          user={editingUser}
          isOpen={!!editingUser}
          onClose={() => setEditingUser(null)}
        />
      )}
    </>
  );
}
