"use client";

import { useState, useEffect } from "react";
import { CRMContact } from "@/types/crm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function CRMContactsPage() {
  const [contacts, setContacts] = useState<CRMContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const response = await fetch("/api/crm/contacts");
      if (response.ok) {
        const data = await response.json();
        setContacts(data.contacts);
      }
    } catch (error) {
      console.error("Error fetching contacts:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(search.toLowerCase()) ||
      contact.email?.toLowerCase().includes(search.toLowerCase()) ||
      contact.company?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div className="p-6">Loading contacts...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">CRM Contacts</h1>
        <Link href="/crm/contacts/new">
          <Button>Add Contact</Button>
        </Link>
      </div>

      <div className="mb-4">
        <Input
          placeholder="Search contacts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredContacts.map((contact) => (
          <Card key={contact.id} className="bg-zinc-800 border-zinc-700 hover:border-zinc-600 transition-colors">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-white">
                <Link
                  href={`/crm/contacts/${contact.id}`}
                  className="hover:text-blue-400 transition-colors"
                >
                  {contact.name}
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-1 text-sm">
              {contact.email && (
                <p className="text-zinc-300 truncate">{contact.email}</p>
              )}
              {contact.company && (
                <p className="text-zinc-400 truncate">{contact.company}</p>
              )}
              {contact.phone && (
                <p className="text-zinc-400 text-xs">{contact.phone}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredContacts.length === 0 && (
        <p className="text-zinc-400 text-center py-8">No contacts found.</p>
      )}
    </div>
  );
}
