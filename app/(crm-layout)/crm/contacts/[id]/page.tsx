"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CRMContact } from "@/types/crm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  IconMail,
  IconPhone,
  IconBuilding,
  IconMapPin,
  IconArrowLeft,
  IconEdit,
  IconCheck,
  IconX,
} from "@tabler/icons-react";

export default function ContactDetailPage() {
  const params = useParams();
  const router = useRouter();
  const contactId = params.id as string;
  const [contact, setContact] = useState<CRMContact | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [organizations, setOrganizations] = useState<{id: string, name: string}[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    organizationId: null as string | null,
    position: "",
    address: "",
    notes: "",
  });

  useEffect(() => {
    fetchContact();
    fetchOrganizations();
  }, [contactId]);

  const fetchContact = async () => {
    try {
      const response = await fetch(`/api/crm/contacts/${contactId}`);
      if (!response.ok) throw new Error("Failed to fetch contact");
      const data = await response.json();
      setContact(data.contact);
      setFormData({
        name: data.contact.name || "",
        email: data.contact.email || "",
        phone: data.contact.phone || "",
        organizationId: data.contact.organizationId || "",
        position: data.contact.position || "",
        address: data.contact.address || "",
        notes: data.contact.notes || "",
      });
    } catch (error) {
      console.error("Error fetching contact:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrganizations = async () => {
    try {
      const response = await fetch("/api/crm/organizations");
      if (response.ok) {
        const data = await response.json();
        setOrganizations(data.organizations || []);
      }
    } catch (error) {
      console.error("Error fetching organizations:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`/api/crm/contacts/${contactId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        setContact(data.contact);
        setIsEditing(false);
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || "Failed to update contact"}`);
      }
    } catch (error) {
      console.error("Error updating contact:", error);
      alert("Failed to update contact");
    } finally {
      setSaving(false);
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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-zinc-800 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-zinc-800 rounded"></div>
        </div>
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-white mb-4">
          Contact not found
        </h1>
        <Button onClick={() => router.push("/crm/contacts")}>
          Back to Contacts
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        onClick={() => router.push("/crm/contacts")}
        variant="ghost"
        className="mb-4 text-zinc-400 hover:text-white"
      >
        <IconArrowLeft className="mr-2" size={18} />
        Back to Contacts
      </Button>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-white text-3xl">
              {isEditing ? (
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="text-3xl font-bold bg-transparent border-none p-0 h-auto text-white"
                  placeholder="Contact name"
                />
              ) : (
                contact.name
              )}
            </CardTitle>
            {contact.position && contact.organizationId && !isEditing && (
              <p className="text-zinc-400 text-lg">
                {contact.position} at {organizations.find(org => org.id === contact.organizationId)?.name || contact.organizationId}
              </p>
            )}
          </div>
          {!isEditing ? (
            <Button
              onClick={() => setIsEditing(true)}
              variant="outline"
              className="text-zinc-400 border-zinc-600 hover:text-white hover:border-zinc-400"
            >
              <IconEdit className="mr-2" size={18} />
              Edit
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setIsEditing(false);
                  setFormData({
                    name: contact.name || "",
                    email: contact.email || "",
                    phone: contact.phone || "",
                    organizationId: contact.organizationId || "",
                    position: contact.position || "",
                    address: contact.address || "",
                    notes: contact.notes || "",
                  });
                }}
                variant="outline"
                disabled={saving}
                className="text-zinc-400 border-zinc-600 hover:text-white hover:border-zinc-400"
              >
                <IconX className="mr-2" size={18} />
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={saving}>
                <IconCheck className="mr-2" size={18} />
                {saving ? "Saving..." : "Save"}
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email" className="text-white">
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    className="mt-1 text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="phone" className="text-white">
                    Phone
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 234 567 8900"
                    className="mt-1 text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="organizationId" className="text-white">
                    Company
                  </Label>
                  <Select
                    value={formData.organizationId || "none"}
                    onValueChange={(value) => setFormData({ ...formData, organizationId: value === "none" ? null : value })}
                  >
                    <SelectTrigger className="mt-1 text-white">
                      <SelectValue placeholder="Select a company" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {organizations.map((org) => (
                        <SelectItem key={org.id} value={org.id}>
                          {org.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="position" className="text-white">
                    Position
                  </Label>
                  <Input
                    id="position"
                    name="position"
                    value={formData.position}
                    onChange={handleChange}
                    placeholder="CEO"
                    className="mt-1 text-white"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address" className="text-white">
                  Address
                </Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="123 Main St, City, Country"
                  className="mt-1 text-white"
                />
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
                  rows={4}
                />
              </div>
            </form>
          ) : (
            <>
              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {contact.email && (
                  <div className="flex items-center gap-3">
                    <IconMail className="text-indigo-400" size={20} />
                    <div>
                      <p className="text-zinc-500 text-sm">Email</p>
                      <a
                        href={`mailto:${contact.email}`}
                        className="text-white hover:text-indigo-400"
                      >
                        {contact.email}
                      </a>
                    </div>
                  </div>
                )}

                {contact.phone && (
                  <div className="flex items-center gap-3">
                    <IconPhone className="text-indigo-400" size={20} />
                    <div>
                      <p className="text-zinc-500 text-sm">Phone</p>
                      <a
                        href={`tel:${contact.phone}`}
                        className="text-white hover:text-indigo-400"
                      >
                        {contact.phone}
                      </a>
                    </div>
                  </div>
                )}

                {contact.organizationId && (
                  <div className="flex items-center gap-3">
                    <IconBuilding className="text-indigo-400" size={20} />
                    <div>
                      <p className="text-zinc-500 text-sm">Company</p>
                      <p className="text-white">
                        {organizations.find(org => org.id === contact.organizationId)?.name || contact.organizationId}
                      </p>
                    </div>
                  </div>
                )}

                {contact.address && (
                  <div className="flex items-center gap-3">
                    <IconMapPin className="text-indigo-400" size={20} />
                    <div>
                      <p className="text-zinc-500 text-sm">Address</p>
                      <p className="text-white">{contact.address}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Notes */}
              {contact.notes && (
                <div className="mt-6">
                  <h3 className="text-white font-semibold mb-2">Notes</h3>
                  <p className="text-zinc-300 whitespace-pre-wrap">
                    {contact.notes}
                  </p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
