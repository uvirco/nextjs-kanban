"use client";

import { useState } from "react";
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

interface CreateRoleModalProps {
  trigger: React.ReactNode;
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

export default function CreateRoleModal({ trigger }: CreateRoleModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    sortOrder: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/epic-roles", {
        method: "POST",
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
        setIsOpen(false);
        setFormData({
          name: "",
          description: "",
          category: "",
          sortOrder: "",
        });
        // Refresh the page to show the new role
        window.location.reload();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to create role");
      }
    } catch (error) {
      console.error("Error creating role:", error);
      alert("Failed to create role");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <>
      <div onClick={() => setIsOpen(true)}>{trigger}</div>

      <Modal isOpen={isOpen} onOpenChange={setIsOpen}>
        <ModalContent>
          <form onSubmit={handleSubmit}>
            <ModalHeader className="flex flex-col gap-1">
              Create New Role
            </ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <Input
                  label="Role Name"
                  placeholder="Enter role name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  required
                />

                <Input
                  label="Description"
                  placeholder="Enter role description (optional)"
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                />

                <Select
                  label="Category"
                  placeholder="Select a category"
                  value={formData.category}
                  onChange={(e) => handleChange("category", e.target.value)}
                  required
                >
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
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
                />
              </div>
            </ModalBody>
            <ModalFooter>
              <Button
                color="danger"
                variant="light"
                onPress={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button
                color="primary"
                type="submit"
                isLoading={isSubmitting}
              >
                {isSubmitting ? "Creating..." : "Create Role"}
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </>
  );
}