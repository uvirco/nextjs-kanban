"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IconArrowLeft, IconArchive, IconTrash, IconMailOpened } from "@tabler/icons-react";

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
  dealId?: string;
  isRead?: boolean;
  status?: 'ACTIVE' | 'ARCHIVED' | 'DELETED';
}

export default function EmailDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [email, setEmail] = useState<Email | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmail();
  }, [id]);

  const fetchEmail = async () => {
    try {
      const response = await fetch(`/api/crm/emails?id=${id}`);
      if (response.ok) {
        const data = await response.json();
        const foundEmail = data.emails.find((e: Email) => e.id === id);
        setEmail(foundEmail || null);
      }
    } catch (error) {
      console.error("Error fetching email:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsUnread = async () => {
    try {
      const response = await fetch(`/api/crm/emails/${email?.id}/read`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRead: false }),
      });

      if (response.ok) {
        router.push("/crm/emails");
      }
    } catch (error) {
      console.error("Error marking as unread:", error);
    }
  };

  const archiveEmail = async () => {
    try {
      const response = await fetch(`/api/crm/emails/${email?.id}/archive`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "ARCHIVED" }),
      });

      if (response.ok) {
        router.push("/crm/emails");
      }
    } catch (error) {
      console.error("Error archiving email:", error);
    }
  };

  const deleteEmail = async () => {
    if (!confirm("Are you sure you want to delete this email?")) return;

    try {
      const response = await fetch(`/api/crm/emails/${email?.id}/archive`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "DELETED" }),
      });

      if (response.ok) {
        router.push("/crm/emails");
      }
    } catch (error) {
      console.error("Error deleting email:", error);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-white">
        <h1 className="text-2xl font-bold mb-4">Loading email...</h1>
      </div>
    );
  }

  if (!email) {
    return (
      <div className="p-6 text-white">
        <h1 className="text-2xl font-bold mb-4">Email not found</h1>
        <Button onClick={() => router.push("/crm/emails")}>
          <IconArrowLeft size={16} className="mr-2" />
          Back to Inbox
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.push("/crm/emails")} className="text-gray-300 hover:text-white hover:bg-gray-700">
          <IconArrowLeft size={16} className="mr-2" />
          Back to Inbox
        </Button>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={markAsUnread} className="bg-gray-800 border-gray-600 text-gray-200 hover:bg-gray-700 hover:text-white">
            <IconMailOpened size={16} className="mr-2" />
            Mark as Unread
          </Button>
          <Button variant="outline" size="sm" onClick={archiveEmail} className="bg-gray-800 border-gray-600 text-gray-200 hover:bg-gray-700 hover:text-white">
            <IconArchive size={16} className="mr-2" />
            Archive
          </Button>
          <Button variant="destructive" size="sm" onClick={deleteEmail} className="bg-red-900 hover:bg-red-800 text-white border-red-800">
            <IconTrash size={16} className="mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <div className="flex items-start justify-between mb-4">
            <CardTitle className="text-2xl text-white">
              {email.subject || "(no subject)"}
            </CardTitle>
            <Badge variant={email.direction === "INBOUND" ? "default" : "secondary"}>
              {email.direction}
            </Badge>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center text-gray-300">
              <span className="font-semibold w-20">From:</span>
              <span>{email.fromEmail}</span>
            </div>
            <div className="flex items-center text-gray-300">
              <span className="font-semibold w-20">To:</span>
              <span>{email.toEmail}</span>
            </div>
            <div className="flex items-center text-gray-300">
              <span className="font-semibold w-20">Date:</span>
              <span>
                {new Date(email.receivedAt || email.sentAt || email.createdAt).toLocaleString()}
              </span>
            </div>
            {email.dealId && (
              <div className="flex items-center text-gray-300">
                <span className="font-semibold w-20">Deal:</span>
                <Badge variant="outline" className="text-xs border-gray-600">
                  Deal #{email.dealId}
                </Badge>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <div className="prose prose-invert max-w-none">
            <div 
              className="text-gray-200 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: email.body }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
