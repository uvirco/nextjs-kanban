"use client";

import React, { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure
} from "@nextui-org/modal";
import { Button } from "@nextui-org/button";
import { Input } from "@nextui-org/input";
import { Select, SelectItem } from "@nextui-org/select";
import { toast } from "sonner";
import { IconPlus } from "@tabler/icons-react";

interface CreateUserModalProps {
  trigger?: React.ReactNode;
}

export default function CreateUserModal({ trigger }: CreateUserModalProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "MEMBER" as "ADMIN" | "MANAGER" | "MEMBER",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.name || !formData.email || !formData.password || !formData.role) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        toast.success("User created successfully");
        onClose();
        setFormData({
          name: "",
          email: "",
          password: "",
          role: "MEMBER",
        });
        window.location.reload();
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to create user");
      }
    } catch (error) {
      toast.error("Error creating user");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <>
      {trigger ? (
        React.cloneElement(trigger as React.ReactElement, {
          onClick: (e: React.MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            onOpen();
          },
        })
      ) : (
        <Button
          color="primary"
          onClick={onOpen}
          startContent={<IconPlus size={20} />}
        >
          Add User
        </Button>
      )}

      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalContent>
          <form onSubmit={handleSubmit}>
            <ModalHeader>
              <h3 className="text-lg font-semibold">Create New User</h3>
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

              <Input
                label="Password"
                type="password"
                placeholder="Enter initial password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                required
              />

              <Select
                label="Role"
                placeholder="Select user role"
                value={formData.role}
                onChange={(e) => handleInputChange("role", e.target.value)}
                required
              >
                <SelectItem key="MEMBER" value="MEMBER">Member</SelectItem>
                <SelectItem key="MANAGER" value="MANAGER">Manager</SelectItem>
                <SelectItem key="ADMIN" value="ADMIN">Admin</SelectItem>
              </Select>
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
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? 'Creating...' : 'Create User'}
              </button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </>
  );
}