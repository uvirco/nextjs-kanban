"use client";

import { useState, useEffect } from "react";
import { Button } from "@nextui-org/button";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/modal";
import { Input } from "@nextui-org/input";
import { Select, SelectItem } from "@nextui-org/select";

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

interface EditRoleModalProps {
  role: Role;
  isOpen: boolean;
  onClose: () => void;
}

const categories = [
  { value: "management", label: "Management" },
  { value: "technical", label: "Technical" },
  { value: "design", label: "Design" },
  { value: "business", label: "Business" },
  { value: "operations", label: "Operations" },
  { value: "administration", label: "Administration" },
  { value: "finance", label: "Finance" },
  { value: "legal", label: "Legal" },
  { value: "marketing", label: "Marketing" },
  { value: "sales", label: "Sales" },
  { value: "customer-service", label: "Customer Service" },
  { value: "other", label: "Other" },
];

export default function EditRoleModal({
  role,
  isOpen,
  onClose,
}: EditRoleModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    sortOrder: "",
  });

  useEffect(() => {
    if (role) {
      setFormData({
        name: role.name,
        description: role.description || "",
        category: role.category,
        sortOrder: role.sortOrder.toString(),
      });
    }
  }, [role]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/admin/epic-roles/${role.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description || null,
          category: formData.category,
          sortOrder: parseInt(formData.sortOrder) || 0,
        }),
      });

      if (response.ok) {
        onClose();
        // Refresh the page to show updated data
        window.location.reload();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to update role");
      }
    } catch (error) {
      console.error("Error updating role:", error);
      alert("Failed to update role");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onClose} className="dark">
      <ModalContent className="bg-zinc-900 border border-zinc-700">
        <form onSubmit={handleSubmit}>
          <ModalHeader className="flex flex-col gap-1 bg-zinc-900 text-white border-b border-zinc-700">Edit Role</ModalHeader>
          <ModalBody className="bg-zinc-900">
            <div className="space-y-4">
              <Input
                label="Role Name"
                placeholder="Enter role name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                required
                className="dark"
                classNames={{
                  label: "text-zinc-300",
                  input: "bg-zinc-800 border-zinc-600 text-white placeholder-zinc-400",
                  inputWrapper: "bg-zinc-800 border-zinc-600 hover:bg-zinc-700 focus-within:bg-zinc-700"
                }}
              />

              <Input
                label="Description"
                placeholder="Enter role description (optional)"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                className="dark"
                classNames={{
                  label: "text-zinc-300",
                  input: "bg-zinc-800 border-zinc-600 text-white placeholder-zinc-400",
                  inputWrapper: "bg-zinc-800 border-zinc-600 hover:bg-zinc-700 focus-within:bg-zinc-700"
                }}
              />

              <Select
                label="Category"
                placeholder="Select a category"
                value={formData.category}
                onChange={(e) => handleChange("category", e.target.value)}
                required
                className="dark"
                classNames={{
                  label: "text-zinc-300",
                  trigger: "bg-zinc-800 border-zinc-600 text-white hover:bg-zinc-700 data-[open=true]:bg-zinc-700",
                  listbox: "bg-zinc-800 border-zinc-600",
                  popoverContent: "bg-zinc-800 border-zinc-600",
                  listboxWrapper: "bg-zinc-800"
                }}
              >
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value} className="text-white hover:bg-zinc-700">
                    {category.label}
                  </SelectItem>
                ))}
              </Select>

              <Input
                label="Sort Order"
                type="number"
                placeholder="Enter sort order (lower numbers appear first)"
                value={formData.sortOrder}
                onChange={(e) => handleChange("sortOrder", e.target.value)}
                min="0"
                className="dark"
                classNames={{
                  label: "text-zinc-300",
                  input: "bg-zinc-800 border-zinc-600 text-white placeholder-zinc-400",
                  inputWrapper: "bg-zinc-800 border-zinc-600 hover:bg-zinc-700 focus-within:bg-zinc-700"
                }}
              />
            </div>
          </ModalBody>
          <ModalFooter className="bg-zinc-900 border-t border-zinc-700">
            <Button color="danger" variant="light" onPress={onClose} className="text-zinc-300 hover:bg-zinc-800">
              Cancel
            </Button>
            <Button color="primary" type="submit" isLoading={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
              {isSubmitting ? "Updating..." : "Update Role"}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
