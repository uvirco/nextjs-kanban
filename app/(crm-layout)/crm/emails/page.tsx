"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IconMail, IconRefresh, IconSearch } from "@tabler/icons-react";

interface Email {
  id: string;
  subject: string;
  fromEmail: string;
  toEmail: string;
  body: string;
  direction: "INBOUND" | "OUTBOUND";
  receivedAt: string;
  createdAt: string;
}

export default function EmailInboxPage() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"all" | "inbound" | "outbound">("all");

  const fetchEmails = async () => {
    try {
      const response = await fetch("/api/crm/emails");
      if (response.ok) {
        const data = await response.json();
        setEmails(data.emails);
      }
    } catch (error) {
      console.error("Failed to fetch emails:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNewEmails = async () => {
    try {
      await fetch("/api/fetch-emails", { method: "POST" });
      await fetchEmails(); // Refresh the list
    } catch (error) {
      console.error("Failed to fetch new emails:", error);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, []);

  const filteredEmails = emails.filter((email) => {
    const matchesSearch =
      email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.fromEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.body.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filter === "all" ||
      (filter === "inbound" && email.direction === "INBOUND") ||
      (filter === "outbound" && email.direction === "OUTBOUND");

    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return <div className="p-6">Loading emails...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <IconMail size={24} />
          Email Inbox
        </h1>
        <Button onClick={fetchNewEmails} className="flex items-center gap-2">
          <IconRefresh size={16} />
          Fetch New Emails
        </Button>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <Input
            placeholder="Search emails..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Tabs value={filter} onValueChange={(value) => setFilter(value as any)}>
          <TabsList>
            <TabsTrigger value="all">All ({emails.length})</TabsTrigger>
            <TabsTrigger value="inbound">
              Inbound ({emails.filter(e => e.direction === "INBOUND").length})
            </TabsTrigger>
            <TabsTrigger value="outbound">
              Outbound ({emails.filter(e => e.direction === "OUTBOUND").length})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="space-y-4">
        {filteredEmails.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-gray-500">
              No emails found.
            </CardContent>
          </Card>
        ) : (
          filteredEmails.map((email) => (
            <Card key={email.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{email.subject}</CardTitle>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>From: {email.fromEmail}</span>
                      <span>To: {email.toEmail}</span>
                      <Badge variant={email.direction === "INBOUND" ? "default" : "secondary"}>
                        {email.direction}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(email.receivedAt || email.createdAt).toLocaleString()}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-gray-700 line-clamp-3">
                  {email.body.replace(/<[^>]*>/g, "").substring(0, 200)}...
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}