"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CRMContact } from "@/types/crm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  IconMail,
  IconPhone,
  IconBuilding,
  IconMapPin,
  IconArrowLeft,
} from "@tabler/icons-react";

export default function ContactDetailPage() {
  const params = useParams();
  const router = useRouter();
  const contactId = params.id as string;
  const [contact, setContact] = useState<CRMContact | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContact();
  }, [contactId]);

  const fetchContact = async () => {
    try {
      const response = await fetch(`/api/crm/contacts/${contactId}`);
      if (!response.ok) throw new Error("Failed to fetch contact");
      const data = await response.json();
      setContact(data);
    } catch (error) {
      console.error("Error fetching contact:", error);
    } finally {
      setLoading(false);
    }
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
        <CardHeader>
          <CardTitle className="text-white text-3xl">{contact.name}</CardTitle>
          {contact.position && contact.company && (
            <p className="text-zinc-400 text-lg">
              {contact.position} at {contact.company}
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
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

            {contact.company && (
              <div className="flex items-center gap-3">
                <IconBuilding className="text-indigo-400" size={20} />
                <div>
                  <p className="text-zinc-500 text-sm">Company</p>
                  <p className="text-white">{contact.company}</p>
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
        </CardContent>
      </Card>
    </div>
  );
}
