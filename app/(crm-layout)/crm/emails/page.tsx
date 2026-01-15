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
  sentAt: string;
  createdAt: string;
  contactId?: string;
  dealId?: string;
  leadId?: string;
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

  const addTestEmails = async () => {
    try {
      const testEmails = [
        {
          fromEmail: 'prospect@company.com',
          toEmail: 'sales@uvircopd.com',
          subject: 'Interest in your services',
          body: 'Hi,\n\nI came across your website and I\'m interested in learning more about your CRM solutions. Can we schedule a call?\n\nBest,\nJohn Smith\nCTO at TechCorp',
          receivedAt: new Date(Date.now() - 600000).toISOString(), // 10 minutes ago
          direction: 'INBOUND'
        },
        {
          fromEmail: 'sales@uvircopd.com',
          toEmail: 'prospect@company.com',
          subject: 'Re: Interest in your services',
          body: 'Hi John,\n\nThank you for your interest! I\'d be happy to schedule a demo. How does next Tuesday at 2 PM work for you?\n\nBest,\nPierre\nSales Manager',
          sentAt: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
          direction: 'OUTBOUND'
        }
      ];

      for (const email of testEmails) {
        await fetch("/api/crm/emails", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(email)
        });
      }

      await fetchEmails(); // Refresh the list
    } catch (error) {
      console.error("Failed to add test emails:", error);
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
        <div className="flex gap-2">
          <Button onClick={addTestEmails} variant="outline" className="flex items-center gap-2">
            <IconMail size={16} />
            Add Test Emails
          </Button>
          <Button onClick={fetchNewEmails} className="flex items-center gap-2">
            <IconRefresh size={16} />
            Fetch New Emails
          </Button>
        </div>
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
                    {new Date(email.receivedAt || email.sentAt || email.createdAt).toLocaleString()}
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