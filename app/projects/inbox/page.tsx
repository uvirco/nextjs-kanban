"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  IconMail,
  IconSend,
  IconInbox,
  IconPaperclip,
  IconUser,
  IconBuilding,
  IconRefresh,
} from "@tabler/icons-react";
import { format } from "date-fns";

interface CRMEmail {
  id: string;
  subject?: string;
  body?: string;
  fromEmail?: string;
  toEmail?: string;
  ccEmails?: string[];
  sentAt?: Date;
  receivedAt?: Date;
  direction: "INBOUND" | "OUTBOUND";
  threadId?: string;
  createdAt: Date;
  contact?: {
    id: string;
    name: string;
    email: string;
  };
  deal?: {
    id: string;
    title: string;
  };
  lead?: {
    id: string;
    title: string;
  };
  attachments?: Array<{
    id: string;
    filename: string;
    fileSize?: number;
    mimeType?: string;
  }>;
}

export default function InboxPage() {
  const [emails, setEmails] = useState<CRMEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmail, setSelectedEmail] = useState<CRMEmail | null>(null);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    fetchEmails();
  }, [activeTab]);

  const fetchEmails = async () => {
    try {
      const direction = activeTab === "all" ? null : activeTab;
      const url = direction
        ? `/api/crm/emails?direction=${direction}`
        : "/api/crm/emails";

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setEmails(data.emails);
      }
    } catch (error) {
      console.error("Error fetching emails:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNewEmails = async () => {
    try {
      const response = await fetch("/api/fetch-emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Email fetch result:", result);
        // Refresh the email list
        fetchEmails();
      }
    } catch (error) {
      console.error("Error fetching new emails:", error);
    }
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return "";
    return format(new Date(date), "MMM d, yyyy 'at' h:mm a");
  };

  const getEmailDisplayName = (email: CRMEmail) => {
    if (email.contact?.name) return email.contact.name;
    if (email.fromEmail) return email.fromEmail;
    if (email.toEmail) return email.toEmail;
    return "Unknown";
  };

  const getEmailAddress = (email: CRMEmail) => {
    if (email.direction === "INBOUND") return email.fromEmail;
    return email.toEmail;
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <IconInbox className="text-blue-400" size={32} />
          Email Inbox
        </h1>
        <Button onClick={fetchNewEmails} variant="outline">
          <IconRefresh className="mr-2" size={18} />
          Fetch New Emails
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Email List */}
        <div className="lg:col-span-1">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-3">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="inbound">Inbox</TabsTrigger>
                  <TabsTrigger value="outbound">Sent</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[600px] overflow-y-auto">
                {emails.length === 0 ? (
                  <div className="p-4 text-center text-zinc-400">
                    No emails found
                  </div>
                ) : (
                  emails.map((email) => (
                    <div
                      key={email.id}
                      className={`p-4 border-b border-zinc-800 cursor-pointer hover:bg-zinc-800 transition-colors ${
                        selectedEmail?.id === email.id ? "bg-zinc-800" : ""
                      }`}
                      onClick={() => setSelectedEmail(email)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-white truncate">
                              {getEmailDisplayName(email)}
                            </span>
                            {email.attachments &&
                              email.attachments.length > 0 && (
                                <IconPaperclip
                                  size={14}
                                  className="text-zinc-400"
                                />
                              )}
                          </div>
                          <p className="text-sm text-zinc-300 truncate mb-1">
                            {email.subject || "No subject"}
                          </p>
                          <p className="text-xs text-zinc-500 truncate">
                            {getEmailAddress(email)}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <Badge
                            variant={
                              email.direction === "INBOUND"
                                ? "default"
                                : "secondary"
                            }
                            className="text-xs"
                          >
                            {email.direction === "INBOUND" ? "Inbox" : "Sent"}
                          </Badge>
                          <span className="text-xs text-zinc-500">
                            {formatDate(email.receivedAt || email.sentAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Email Detail */}
        <div className="lg:col-span-2">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-6">
              {selectedEmail ? (
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold text-white mb-2">
                        {selectedEmail.subject || "No subject"}
                      </h2>
                      <div className="flex items-center gap-4 text-sm text-zinc-400">
                        <div className="flex items-center gap-2">
                          <IconUser size={16} />
                          <span>{getEmailDisplayName(selectedEmail)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <IconMail size={16} />
                          <span>{getEmailAddress(selectedEmail)}</span>
                        </div>
                        <span>
                          {formatDate(
                            selectedEmail.receivedAt || selectedEmail.sentAt
                          )}
                        </span>
                      </div>
                    </div>
                    <Badge
                      variant={
                        selectedEmail.direction === "INBOUND"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {selectedEmail.direction === "INBOUND"
                        ? "Received"
                        : "Sent"}
                    </Badge>
                  </div>

                  {/* Associated Records */}
                  {(selectedEmail.contact ||
                    selectedEmail.deal ||
                    selectedEmail.lead) && (
                    <div className="mb-4 p-3 bg-zinc-800 rounded-lg">
                      <h3 className="text-sm font-medium text-zinc-300 mb-2">
                        Associated Records:
                      </h3>
                      <div className="flex gap-4">
                        {selectedEmail.contact && (
                          <div className="flex items-center gap-2 text-sm">
                            <IconUser size={14} className="text-blue-400" />
                            <span className="text-zinc-300">
                              {selectedEmail.contact.name}
                            </span>
                          </div>
                        )}
                        {selectedEmail.deal && (
                          <div className="flex items-center gap-2 text-sm">
                            <IconBuilding
                              size={14}
                              className="text-green-400"
                            />
                            <span className="text-zinc-300">
                              {selectedEmail.deal.title}
                            </span>
                          </div>
                        )}
                        {selectedEmail.lead && (
                          <div className="flex items-center gap-2 text-sm">
                            <IconBuilding
                              size={14}
                              className="text-yellow-400"
                            />
                            <span className="text-zinc-300">
                              {selectedEmail.lead.title}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Attachments */}
                  {selectedEmail.attachments &&
                    selectedEmail.attachments.length > 0 && (
                      <div className="mb-4">
                        <h3 className="text-sm font-medium text-zinc-300 mb-2">
                          Attachments:
                        </h3>
                        <div className="flex gap-2 flex-wrap">
                          {selectedEmail.attachments.map((attachment) => (
                            <div
                              key={attachment.id}
                              className="flex items-center gap-2 px-3 py-2 bg-zinc-800 rounded-lg text-sm"
                            >
                              <IconPaperclip size={14} />
                              <span className="text-zinc-300">
                                {attachment.filename}
                              </span>
                              {attachment.fileSize && (
                                <span className="text-zinc-500">
                                  ({Math.round(attachment.fileSize / 1024)}KB)
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  <div className="border-t border-zinc-700 my-4"></div>

                  {/* Email Body */}
                  <div className="prose prose-invert max-w-none">
                    <div
                      className="text-zinc-200 whitespace-pre-wrap"
                      dangerouslySetInnerHTML={{
                        __html:
                          selectedEmail.body?.replace(/\n/g, "<br>") ||
                          "No content",
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <IconMail className="mx-auto text-zinc-600 mb-4" size={48} />
                  <h3 className="text-lg font-medium text-zinc-400 mb-2">
                    Select an email to view
                  </h3>
                  <p className="text-zinc-500">
                    Choose an email from the list to see its contents
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
