"use client";

import { useState } from "react";
import { Button } from "@nextui-org/button";
import { Chip } from "@nextui-org/chip";
import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell
} from "@nextui-org/table";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem
} from "@nextui-org/dropdown";
import { IconDots, IconEdit, IconTrash, IconEye } from "@tabler/icons-react";
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

  const handleEditUser = (user: User) => {
    setEditingUser(user);
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
  };

  return (
    <>
      <Table aria-label="Users table" className="bg-zinc-800">
        <TableHeader>
          <TableColumn>NAME</TableColumn>
          <TableColumn>EMAIL</TableColumn>
          <TableColumn>ROLE</TableColumn>
          <TableColumn>STATUS</TableColumn>
          <TableColumn>BOARDS</TableColumn>
          <TableColumn>CREATED</TableColumn>
          <TableColumn>ACTIONS</TableColumn>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="text-white">
                {user.name || "No name"}
              </TableCell>
              <TableCell className="text-zinc-300">
                {user.email}
              </TableCell>
              <TableCell>
                <Chip
                  color={
                    user.role === 'ADMIN' ? 'danger' :
                    user.role === 'MANAGER' ? 'primary' :
                    'success'
                  }
                  size="sm"
                  variant="flat"
                >
                  {user.role}
                </Chip>
              </TableCell>
              <TableCell>
                <Chip
                  color={user.isActive ? 'success' : 'danger'}
                  size="sm"
                  variant="flat"
                >
                  {user.isActive ? 'Active' : 'Inactive'}
                </Chip>
              </TableCell>
              <TableCell className="text-zinc-300">
                {user._count.memberBoards}
              </TableCell>
              <TableCell className="text-zinc-400">
                {new Date(user.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <Dropdown>
                  <DropdownTrigger>
                    <Button isIconOnly size="sm" variant="light">
                      <IconDots size={16} />
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu>
                    <DropdownItem
                      startContent={<IconEye size={16} />}
                      onClick={() => handleEditUser(user)}
                    >
                      View/Edit
                    </DropdownItem>
                    <DropdownItem
                      startContent={<IconEdit size={16} />}
                      onClick={() => handleEditUser(user)}
                    >
                      Edit User
                    </DropdownItem>
                    <DropdownItem
                      startContent={user.isActive ? <IconTrash size={16} /> : <IconEye size={16} />}
                      onClick={() => handleToggleActive(user.id, user.isActive)}
                    >
                      {user.isActive ? 'Deactivate' : 'Activate'}
                    </DropdownItem>
                    <DropdownItem
                      startContent={<IconTrash size={16} />}
                      color="danger"
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      Delete User
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

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