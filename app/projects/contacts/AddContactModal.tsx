"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { supabase } from "@/lib/supabase";
import { Button } from "@nextui-org/button";
import { Input } from "@nextui-org/input";
import { Select, SelectItem } from "@nextui-org/select";
import { Textarea } from "@nextui-org/input";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/modal";
import { toast } from "sonner";
import { Contact } from "@/types/types";

interface AddContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingContact?: Contact | null;
}

export default function AddContactModal({
  isOpen,
  onClose,
  onSuccess,
  editingContact,
}: AddContactModalProps) {
  const { data: session, status } = useSession();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    contact_type: "supplier" as any,
    address: "",
    city: "",
    country: "",
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      if (editingContact) {
        setFormData({
          name: editingContact.name || "",
          email: editingContact.email || "",
          phone: editingContact.phone || "",
          company: editingContact.company || "",
          contact_type: editingContact.contact_type || "supplier",
          address: editingContact.address || "",
          city: editingContact.city || "",
          country: editingContact.country || "",
          notes: editingContact.notes || "",
        });
      } else {
        setFormData({
          name: "",
          email: "",
          phone: "",
          company: "",
          contact_type: "supplier",
          address: "",
          city: "",
          country: "",
          notes: "",
        });
      }
      setErrors({});
    }
  }, [isOpen, editingContact]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.contact_type) newErrors.contact_type = "Type is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please fill in all required fields");
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    const contactData: any = {
      name: formData.name.trim(),
      email: formData.email.trim() || null,
      phone: formData.phone.trim() || null,
      company: formData.company.trim() || null,
      contact_type: formData.contact_type,
      address: formData.address.trim() || null,
      city: formData.city.trim() || null,
      country: formData.country.trim() || null,
      notes: formData.notes.trim() || null,
    };

    // Get current user for created_by on new entries
    if (!editingContact) {
      let userId: string | null = null;

      if (status === "authenticated" && session?.user?.id) {
        userId = session.user.id;
      } else if (status === "authenticated" && session?.user?.email) {
        const { data: userData } = await supabase
          .from("User")
          .select("id")
          .eq("email", session.user.email)
          .single();
        if (userData) {
          userId = userData.id;
        }
      } else if (status === "loading") {
        toast.error("Session is still loading. Please try again.");
        setIsSubmitting(false);
        return;
      } else {
        toast.error("You must be logged in to create a contact");
        setIsSubmitting(false);
        return;
      }

      if (userId) {
        contactData.created_by = userId;
      }
    }

    try {
      let result;

      if (editingContact) {
        const { created_by, ...updateData } = contactData;
        result = await supabase
          .from("Contact")
          .update(updateData)
          .eq("id", editingContact.id);
      } else {
        result = await supabase.from("Contact").insert([contactData]);
      }

      const { error } = result;

      if (error) {
        console.error("Error saving contact:", error);
        toast.error(
          editingContact ? "Failed to update contact" : "Failed to add contact"
        );
      } else {
        toast.success(
          editingContact ? "Contact updated" : "Contact added successfully"
        );
        onSuccess();
      }
    } catch (err) {
      console.error("Error:", err);
      toast.error("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" scrollBehavior="inside">
      <ModalContent className="bg-zinc-900">
        <ModalHeader className="text-white text-xl font-bold">
          {editingContact ? "Edit Contact" : "Add New Contact"}
        </ModalHeader>
        <form onSubmit={handleSubmit}>
          <ModalBody className="space-y-4 text-white">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-white">
                  Name *
                </label>
                <Input
                  placeholder="Contact name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  isInvalid={!!errors.name}
                  errorMessage={errors.name}
                  className="bg-zinc-800"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-white">Type *</label>
                <div onClick={(e) => e.stopPropagation()}>
                  <Select
                    selectedKeys={[formData.contact_type]}
                    onSelectionChange={(keys) =>
                      handleChange("contact_type", Array.from(keys)[0] as string)
                    }
                    aria-label="Contact Type"
                    isInvalid={!!errors.contact_type}
                    errorMessage={errors.contact_type}
                    classNames={{
                      trigger: "bg-zinc-800 text-white border-zinc-700",
                      value: "text-white",
                      popoverContent: "bg-zinc-800 text-white",
                    }}
                  >
                    <SelectItem key="supplier">Supplier</SelectItem>
                    <SelectItem key="contractor">Contractor</SelectItem>
                    <SelectItem key="team_member">Team Member</SelectItem>
                    <SelectItem key="client">Client</SelectItem>
                    <SelectItem key="other">Other</SelectItem>
                  </Select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-white">Email</label>
                <Input
                  type="email"
                  placeholder="contact@example.com"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className="bg-zinc-800"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-white">Phone</label>
                <Input
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  className="bg-zinc-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-white">Company</label>
                <Input
                  placeholder="Company name"
                  value={formData.company}
                  onChange={(e) => handleChange("company", e.target.value)}
                  className="bg-zinc-800"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-white">Address</label>
                <Input
                  placeholder="Street address"
                  value={formData.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  className="bg-zinc-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-white">City</label>
                <Input
                  placeholder="City"
                  value={formData.city}
                  onChange={(e) => handleChange("city", e.target.value)}
                  className="bg-zinc-800"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-white">Country</label>
                <Input
                  placeholder="Country"
                  value={formData.country}
                  onChange={(e) => handleChange("country", e.target.value)}
                  className="bg-zinc-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-white">Notes</label>
              <Textarea
                placeholder="Additional notes about this contact..."
                value={formData.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                className="bg-zinc-800"
                minRows={3}
              />
            </div>
          </ModalBody>

          <ModalFooter>
            <Button variant="light" onClick={onClose} className="text-zinc-300">
              Cancel
            </Button>
            <Button
              color="primary"
              type="submit"
              isLoading={isSubmitting}
              onClick={handleSubmit}
            >
              {editingContact ? "Update Contact" : "Add Contact"}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
