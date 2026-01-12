"use client";

import { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/modal";
import { Button } from "@nextui-org/button";
import { Input } from "@nextui-org/input";
import { Select, SelectItem } from "@nextui-org/select";
import { Switch } from "@nextui-org/switch";
import { toast } from "sonner";

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

interface EditUserModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
}

export default function EditUserModal({ user, isOpen, onClose }: EditUserModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "MEMBER" as "ADMIN" | "MANAGER" | "MEMBER",
    isActive: true,
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        role: user.role as "ADMIN" | "MANAGER" | "MEMBER",
        isActive: user.isActive,
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success("User updated successfully");
        onClose();
        window.location.reload();
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to update user");
      }
    } catch (error) {
      toast.error("Error updating user");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalContent>
        <form onSubmit={handleSubmit}>
          <ModalHeader>
            <h3 className="text-lg font-semibold">Edit User</h3>
          </ModalHeader>

          <ModalBody className="space-y-4">
            <Input
              label="Name"
              placeholder="Enter user's full name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              required
            />

            <Input
              label="Email"
              type="email"
              placeholder="Enter user's email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              required
            />

            <Select
              label="Role"
              placeholder="Select user role"
              selectedKeys={[formData.role]}
              onChange={(e) => handleInputChange("role", e.target.value)}
              required
            >
              <SelectItem key="MEMBER" value="MEMBER">Member</SelectItem>
              <SelectItem key="MANAGER" value="MANAGER">Manager</SelectItem>
              <SelectItem key="ADMIN" value="ADMIN">Admin</SelectItem>
            </Select>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Active Status</p>
                <p className="text-xs text-zinc-400">
                  Inactive users cannot log in
                </p>
              </div>
              <Switch
                isSelected={formData.isActive}
                onValueChange={(value) => handleInputChange("isActive", value)}
              />
            </div>

            <div className="text-sm text-zinc-400">
              <p>Member of {user._count.memberBoards} board(s)</p>
              <p>Created: {new Date(user.createdAt).toLocaleDateString()}</p>
            </div>
          </ModalBody>

          <ModalFooter>
            <Button
              type="button"
              variant="flat"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              color="primary"
              isLoading={isLoading}
            >
              Update User
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}