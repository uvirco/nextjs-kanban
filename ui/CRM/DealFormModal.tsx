"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CRMContact } from "@/types/crm";

interface DealFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  stage: string;
  dealToEdit?: any;
}

export default function DealFormModal({
  isOpen,
  onClose,
  onSuccess,
  stage,
  dealToEdit,
}: DealFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [contacts, setContacts] = useState<CRMContact[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    contactId: "",
    value: "",
    expectedCloseDate: "",
    notes: "",
    stage: stage,
    order: 0,
  });

  useEffect(() => {
    fetchContacts();
    if (dealToEdit) {
      setFormData({
        title: dealToEdit.title || "",
        contactId: dealToEdit.contactId || "",
        value: dealToEdit.value?.toString() || "",
        expectedCloseDate: dealToEdit.expectedCloseDate || "",
        notes: dealToEdit.notes || "",
        stage: dealToEdit.stage || stage,
        order: dealToEdit.order || 0,
      });
    } else {
      setFormData((prev) => ({ ...prev, stage: stage }));
    }
  }, [dealToEdit, stage]);

  const fetchContacts = async () => {
    try {
      const response = await fetch("/api/crm/contacts");
      if (response.ok) {
        const data = await response.json();
        setContacts(data.contacts);
      }
    } catch (error) {
      console.error("Error fetching contacts:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = dealToEdit
        ? `/api/crm/deals/${dealToEdit.id}`
        : "/api/crm/deals";
      const method = dealToEdit ? "PUT" : "POST";

      const payload = {
        ...formData,
        value: formData.value ? parseFloat(formData.value) : null,
        contactId: formData.contactId || null,
        expectedCloseDate: formData.expectedCloseDate || null,
      };

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        onSuccess();
        onClose();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || "Failed to save deal"}`);
      }
    } catch (error) {
      console.error("Error saving deal:", error);
      alert("Failed to save deal");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-800 border-zinc-700 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-white">
            {dealToEdit ? "Edit Deal" : "Add New Deal"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title" className="text-white">
              Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Deal title"
              className="mt-1 text-white"
            />
          </div>

          <div>
            <Label htmlFor="contactId" className="text-white">
              Contact
            </Label>
            <Select
              value={formData.contactId || "none"}
              onValueChange={(value) =>
                setFormData({ ...formData, contactId: value === "none" ? "" : value })
              }
            >
              <SelectTrigger className="mt-1 text-white">
                <SelectValue placeholder="Select a contact" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                <SelectItem value="none">None</SelectItem>
                {contacts.map((contact) => (
                  <SelectItem key={contact.id} value={contact.id}>
                    {contact.name} {contact.email && `(${contact.email})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="value" className="text-white">
                Deal Value ($)
              </Label>
              <Input
                id="value"
                name="value"
                type="number"
                step="0.01"
                value={formData.value}
                onChange={handleChange}
                placeholder="10000"
                className="mt-1 text-white"
              />
            </div>

            <div>
              <Label htmlFor="expectedCloseDate" className="text-white">
                Expected Close Date
              </Label>
              <Input
                id="expectedCloseDate"
                name="expectedCloseDate"
                type="date"
                value={formData.expectedCloseDate}
                onChange={handleChange}
                className="mt-1 text-white"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes" className="text-white">
              Notes
            </Label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Additional information..."
              className="mt-1 text-white"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading
                ? "Saving..."
                : dealToEdit
                  ? "Update Deal"
                  : "Create Deal"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
