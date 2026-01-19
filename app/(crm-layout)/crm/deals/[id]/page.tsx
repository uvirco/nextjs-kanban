"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  IconArrowLeft,
  IconEdit,
  IconTrash,
  IconMail,
  IconFileText,
  IconPaperclip,
  IconDeviceFloppy,
  IconX,
  IconClock,
} from "@tabler/icons-react";

interface Deal {
  deal_id: number;
  id: string;
  title: string;
  value: number | null;
  stage: string;
  expectedCloseDate: string | null;
  notes: string;
  contactId: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Email {
  id: string;
  subject: string;
  fromEmail: string;
  toEmail: string;
  body: string;
  receivedAt: string;
  sentAt: string;
  isRead: boolean;
  direction: "INBOUND" | "OUTBOUND";
}

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
}

interface StageHistory {
  id: string;
  dealId: number;
  fromStage: string;
  toStage: string;
  changedAt: string;
  notes: string | null;
  changedByUser: {
    id: string;
    name: string;
    email: string;
  } | null;
}

interface Activity {
  id: string;
  type: string;
  content: string;
  dealId: number;
  createdAt: string;
  createdByUser: {
    id: string;
    name: string;
    email: string;
  } | null;
}

export default function DealDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [deal, setDeal] = useState<Deal | null>(null);
  const [contact, setContact] = useState<Contact | null>(null);
  const [emails, setEmails] = useState<Email[]>([]);
  const [stageHistory, setStageHistory] = useState<StageHistory[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedDeal, setEditedDeal] = useState<Partial<Deal>>({});

  useEffect(() => {
    fetchDealDetails();
  }, [id]);

  const fetchDealDetails = async () => {
    try {
      // Fetch deal
      const dealResponse = await fetch(`/api/crm/deals/${id}`);
      if (dealResponse.ok) {
        const dealData = await dealResponse.json();
        setDeal(dealData);
        setEditedDeal(dealData);

        // Fetch contact if exists
        if (dealData.contactId) {
          const contactResponse = await fetch(`/api/crm/contacts/${dealData.contactId}`);
          if (contactResponse.ok) {
            const contactData = await contactResponse.json();
            setContact(contactData);
          }
        }

        // Fetch related emails
        const emailsResponse = await fetch(`/api/crm/emails?dealId=${dealData.deal_id}`);
        if (emailsResponse.ok) {
          const emailsData = await emailsResponse.json();
          setEmails(emailsData.emails || []);
        }

        // Fetch stage history
        const historyResponse = await fetch(`/api/crm/deals/${id}/history`);
        if (historyResponse.ok) {
          const historyData = await historyResponse.json();
          setStageHistory(historyData.history || []);
        }

        // Fetch activities
        const activitiesResponse = await fetch(`/api/crm/deals/${id}/activities`);
        if (activitiesResponse.ok) {
          const activitiesData = await activitiesResponse.json();
          setActivities(activitiesData.activities || []);
        }
      }
    } catch (error) {
      console.error("Failed to fetch deal details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/crm/deals/${deal?.deal_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editedDeal),
      });

      if (response.ok) {
        await fetchDealDetails();
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Failed to update deal:", error);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this deal?")) return;

    try {
      const response = await fetch(`/api/crm/deals/${deal?.deal_id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.push("/crm/deals");
      }
    } catch (error) {
      console.error("Failed to delete deal:", error);
    }
  };

  const formatCurrency = (value: number | null) => {
    if (!value) return "Not set";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  const formatDate = (date: string | null) => {
    if (!date) return "Not set";
    return new Date(date).toLocaleDateString();
  };

  if (loading) {
    return <div className="p-6">Loading deal details...</div>;
  }

  if (!deal) {
    return <div className="p-6">Deal not found</div>;
  }

  return (
    <div className="h-screen flex flex-col bg-gray-950">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/crm/deals")}
            >
              <IconArrowLeft size={16} className="mr-1" />
              Back to Deals
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-100">
                Deal #{deal.deal_id}: {deal.title}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {deal.stage}
                </Badge>
                <span className="text-sm text-gray-400">
                  {formatCurrency(deal.value)}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button size="sm" onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                  <IconDeviceFloppy size={16} className="mr-1" />
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setEditedDeal(deal);
                  }}
                >
                  <IconX size={16} className="mr-1" />
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Button size="sm" onClick={() => setIsEditing(true)} className="bg-gray-700 hover:bg-gray-600">
                  <IconEdit size={16} className="mr-1" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <IconTrash size={16} className="mr-1" />
                  Delete
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Split Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Deal Info (1/3) */}
        <div className="w-1/3 border-r border-gray-800 bg-gray-900 overflow-y-auto p-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg text-gray-100">Deal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <>
                  <div>
                    <label className="text-sm font-medium text-gray-300">Title</label>
                    <Input
                      value={editedDeal.title || ""}
                      onChange={(e) =>
                        setEditedDeal({ ...editedDeal, title: e.target.value })
                      }
                      className="mt-1 bg-gray-700 border-gray-600 text-gray-100"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-300">Value</label>
                    <Input
                      type="number"
                      value={editedDeal.value || ""}
                      onChange={(e) =>
                        setEditedDeal({
                          ...editedDeal,
                          value: parseFloat(e.target.value),
                        })
                      }
                      className="mt-1 bg-gray-700 border-gray-600 text-gray-100"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-300">
                      Expected Close Date
                    </label>
                    <Input
                      type="date"
                      value={editedDeal.expectedCloseDate || ""}
                      onChange={(e) =>
                        setEditedDeal({
                          ...editedDeal,
                          expectedCloseDate: e.target.value,
                        })
                      }
                      className="mt-1 bg-gray-700 border-gray-600 text-gray-100"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-300">Notes</label>
                    <Textarea
                      value={editedDeal.notes || ""}
                      onChange={(e) =>
                        setEditedDeal({ ...editedDeal, notes: e.target.value })
                      }
                      rows={6}
                      className="mt-1 bg-gray-700 border-gray-600 text-gray-100"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="text-sm font-medium text-gray-400">Value</label>
                    <p className="text-lg font-semibold text-gray-100 mt-1">
                      {formatCurrency(deal.value)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-400">Stage</label>
                    <p className="text-gray-100 mt-1">{deal.stage}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-400">
                      Expected Close Date
                    </label>
                    <p className="text-gray-100 mt-1">
                      {formatDate(deal.expectedCloseDate)}
                    </p>
                  </div>
                  {contact && (
                    <div>
                      <label className="text-sm font-medium text-gray-400">Contact</label>
                      <div className="mt-1">
                        <p className="text-gray-100 font-medium">{contact.name}</p>
                        <p className="text-sm text-gray-400">{contact.email}</p>
                        {contact.phone && (
                          <p className="text-sm text-gray-400">{contact.phone}</p>
                        )}
                        {contact.company && (
                          <p className="text-sm text-gray-400">{contact.company}</p>
                        )}
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-gray-400">Notes</label>
                    <p className="text-gray-100 mt-1 whitespace-pre-wrap">
                      {deal.notes || "No notes"}
                    </p>
                  </div>
                  <div className="pt-4 border-t border-gray-700">
                    <div className="text-xs text-gray-500 space-y-1">
                      <p>Created: {formatDate(deal.createdAt)}</p>
                      <p>Updated: {formatDate(deal.updatedAt)}</p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Tabs (2/3) */}
        <div className="w-2/3 bg-gray-950 overflow-hidden">
          <Tabs defaultValue="emails" className="h-full flex flex-col">
            <TabsList className="bg-gray-900 border-b border-gray-800 rounded-none w-full justify-start px-6">
              <TabsTrigger value="emails" className="gap-2">
                <IconMail size={16} />
                Emails ({emails.length})
              </TabsTrigger>
              <TabsTrigger value="timeline" className="gap-2">
                <IconClock size={16} />
                Timeline
              </TabsTrigger>
              <TabsTrigger value="notes" className="gap-2">
                <IconFileText size={16} />
                Notes
              </TabsTrigger>
              <TabsTrigger value="files" className="gap-2">
                <IconPaperclip size={16} />
                Files
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto">
              <TabsContent value="emails" className="m-0 p-6">
                <div className="space-y-4">
                  {emails.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      No emails linked to this deal
                    </div>
                  ) : (
                    emails.map((email) => (
                      <Card
                        key={email.id}
                        className="bg-gray-800 border-gray-700 hover:bg-gray-750 cursor-pointer"
                        onClick={() => router.push(`/crm/emails/${email.id}`)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge
                                  variant={
                                    email.direction === "INBOUND"
                                      ? "default"
                                      : "secondary"
                                  }
                                  className="text-xs"
                                >
                                  {email.direction}
                                </Badge>
                                {!email.isRead && (
                                  <Badge variant="destructive" className="text-xs">
                                    Unread
                                  </Badge>
                                )}
                              </div>
                              <h3 className="font-semibold text-gray-100 mb-1">
                                {email.subject || "(no subject)"}
                              </h3>
                              <p className="text-sm text-gray-400 mb-2">
                                From: {email.fromEmail}
                              </p>
                              <p className="text-sm text-gray-300 line-clamp-2">
                                {email.body.replace(/<[^>]*>/g, "").substring(0, 200)}
                                ...
                              </p>
                            </div>
                            <div className="text-xs text-gray-500 ml-4">
                              {formatDate(email.receivedAt || email.sentAt)}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="timeline" className="m-0 p-6">
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-100">Activity Timeline</h3>
                  {activities.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      No activities recorded yet
                    </div>
                  ) : (
                    <div className="relative">
                      {/* Timeline line */}
                      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-700"></div>
                      
                      <div className="space-y-6">
                        {activities.map((activity) => {
                          const iconColor = activity.type === 'STAGE_CHANGE' ? 'bg-blue-500' : 
                                           activity.type === 'EMAIL' ? 'bg-green-500' :
                                           activity.type === 'CALL' ? 'bg-purple-500' :
                                           activity.type === 'MEETING' ? 'bg-orange-500' : 'bg-gray-500';
                          
                          return (
                            <div key={activity.id} className="relative pl-12">
                              {/* Timeline dot */}
                              <div className={`absolute left-2.5 w-3 h-3 ${iconColor} rounded-full ring-4 ring-gray-950`}></div>
                              
                              <Card className="bg-gray-800 border-gray-700">
                                <CardContent className="p-4">
                                  <div className="flex items-start justify-between mb-2">
                                    <Badge variant="outline" className="text-xs">
                                      {activity.type.replace('_', ' ')}
                                    </Badge>
                                    <span className="text-xs text-gray-500">
                                      {new Date(activity.createdAt).toLocaleString()}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-300 mb-2">
                                    {activity.content}
                                  </p>
                                  {activity.createdByUser && (
                                    <p className="text-xs text-gray-400">
                                      By: {activity.createdByUser.name}
                                    </p>
                                  )}
                                </CardContent>
                              </Card>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="notes" className="m-0 p-6">
                <div className="text-center py-12 text-gray-500">
                  Notes feature coming soon
                </div>
              </TabsContent>

              <TabsContent value="files" className="m-0 p-6">
                <div className="text-center py-12 text-gray-500">
                  Files feature coming soon
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
