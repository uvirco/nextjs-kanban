"use client";

import { useState, useEffect, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RichTextEditor from "@/ui/RichTextEditor";
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
  IconNote,
  IconPin,
  IconPinFilled,
  IconLink,
  IconUpload,
  IconDownload,
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

interface CRMNote {
  id: string;
  content: string;
  dealId: number | null;
  contactId: string | null;
  leadId: string | null;
  createdByUserId: string | null;
  createdAt: string;
  updatedAt: string;
  isPinned: boolean;
  createdByUser?: {
    name: string;
    email: string;
  };
}

export default function DealDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const boardId = searchParams?.get("boardId");
  const [deal, setDeal] = useState<Deal | null>(null);
  const [contact, setContact] = useState<Contact | null>(null);
  const [emails, setEmails] = useState<Email[]>([]);
  const [stageHistory, setStageHistory] = useState<StageHistory[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [notes, setNotes] = useState<CRMNote[]>([]);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedDeal, setEditedDeal] = useState<Partial<Deal>>({});
  const [newNoteContent, setNewNoteContent] = useState("");
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    fetchDealDetails();
  }, [id]);

  useEffect(() => {
    if (deal) {
      fetchNotes();
      fetchAttachments();
    }
  }, [deal]);

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
          const contactResponse = await fetch(
            `/api/crm/contacts/${dealData.contactId}`,
          );
          if (contactResponse.ok) {
            const contactData = await contactResponse.json();
            setContact(contactData);
          }
        }

        // Fetch related emails
        const emailsResponse = await fetch(
          `/api/crm/emails?dealId=${dealData.deal_id}`,
        );
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
        const activitiesResponse = await fetch(
          `/api/crm/deals/${id}/activities`,
        );
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
        router.push(boardId ? `/crm/deals?boardId=${boardId}` : "/crm/deals");
      }
    } catch (error) {
      console.error("Failed to delete deal:", error);
    }
  };

  const fetchNotes = async () => {
    if (!deal) return;
    try {
      const response = await fetch(`/api/crm/notes?dealId=${deal.deal_id}`);
      if (response.ok) {
        const data = await response.json();
        setNotes(data.notes || []);
      }
    } catch (error) {
      console.error("Failed to fetch notes:", error);
    }
  };

  const handleSaveNote = async () => {
    if (!newNoteContent.trim() || !deal) return;

    setIsSavingNote(true);
    try {
      const response = await fetch("/api/crm/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newNoteContent,
          dealId: deal.deal_id,
        }),
      });

      if (response.ok) {
        setNewNoteContent("");
        await fetchNotes();
        await fetchDealDetails(); // Refresh activities
      } else {
        alert("Failed to save note");
      }
    } catch (error) {
      console.error("Failed to save note:", error);
      alert("Failed to save note");
    } finally {
      setIsSavingNote(false);
    }
  };

  const handleTogglePin = async (noteId: string, currentPinned: boolean) => {
    try {
      const response = await fetch(`/api/crm/notes/${noteId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPinned: !currentPinned }),
      });

      if (response.ok) {
        await fetchNotes();
      }
    } catch (error) {
      console.error("Failed to toggle pin:", error);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm("Are you sure you want to delete this note?")) return;

    try {
      const response = await fetch(`/api/crm/notes/${noteId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchNotes();
      } else {
        alert("Failed to delete note");
      }
    } catch (error) {
      console.error("Failed to delete note:", error);
      alert("Failed to delete note");
    }
  };

  const fetchAttachments = async () => {
    if (!deal) return;
    try {
      const response = await fetch(
        `/api/crm/attachments?dealId=${deal.deal_id}`,
      );
      if (response.ok) {
        const data = await response.json();
        setAttachments(data.attachments || []);
      }
    } catch (error) {
      console.error("Failed to fetch attachments:", error);
    }
  };

  const handleFileUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!deal) return;

    setIsUploading(true);
    setUploadError("");

    const formData = new FormData(e.currentTarget);
    const file = formData.get("file") as File;

    if (!file) {
      setUploadError("Please select a file");
      setIsUploading(false);
      return;
    }

    try {
      // Upload file using API endpoint (handles both storage and database)
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);
      uploadFormData.append("dealId", String(deal.deal_id));

      const response = await fetch("/api/crm/attachments/upload-file", {
        method: "POST",
        body: uploadFormData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload file");
      }

      setShowUploadForm(false);
      await fetchAttachments();
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      console.error("Upload error:", error);
      setUploadError("Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  };

  const handleLinkSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!deal) return;

    setIsUploading(true);
    setUploadError("");

    const formData = new FormData(e.currentTarget);
    const filename = formData.get("filename") as string;
    const url = formData.get("url") as string;

    if (!filename || !url) {
      setUploadError("Please provide both filename and URL");
      setIsUploading(false);
      return;
    }

    try {
      const response = await fetch("/api/crm/attachments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename,
          url,
          dealId: deal.deal_id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add link");
      }

      setShowLinkForm(false);
      await fetchAttachments();
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      console.error("Link add error:", error);
      setUploadError("Failed to add link");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
    if (!confirm("Are you sure you want to delete this attachment?")) return;

    try {
      const response = await fetch(`/api/crm/attachments/${attachmentId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchAttachments();
      } else {
        alert("Failed to delete attachment");
      }
    } catch (error) {
      console.error("Failed to delete attachment:", error);
      alert("Failed to delete attachment");
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (!deal) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    setIsUploading(true);
    setUploadError("");

    try {
      // Upload all files using API endpoint
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("dealId", String(deal.deal_id));

        const response = await fetch("/api/crm/attachments/upload-file", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          console.error("Upload error for", file.name);
          continue;
        }
      }

      await fetchAttachments();
    } catch (error) {
      console.error("Drop upload error:", error);
      setUploadError("Failed to upload some files");
    } finally {
      setIsUploading(false);
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
              onClick={() => router.push(boardId ? `/crm/deals?boardId=${boardId}` : "/crm/deals")}
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
                <Button
                  size="sm"
                  onClick={handleSave}
                  className="bg-green-600 hover:bg-green-700"
                >
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
                <Button
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="bg-gray-700 hover:bg-gray-600"
                >
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
              <CardTitle className="text-lg text-gray-100">
                Deal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <>
                  <div>
                    <label className="text-sm font-medium text-gray-300">
                      Title
                    </label>
                    <Input
                      value={editedDeal.title || ""}
                      onChange={(e) =>
                        setEditedDeal({ ...editedDeal, title: e.target.value })
                      }
                      className="mt-1 bg-gray-700 border-gray-600 text-gray-100"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-300">
                      Value
                    </label>
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
                </>
              ) : (
                <>
                  <div>
                    <label className="text-sm font-medium text-gray-400">
                      Value
                    </label>
                    <p className="text-lg font-semibold text-gray-100 mt-1">
                      {formatCurrency(deal.value)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-400">
                      Stage
                    </label>
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
                      <label className="text-sm font-medium text-gray-400">
                        Contact
                      </label>
                      <div className="mt-1">
                        <p className="text-gray-100 font-medium">
                          {contact.name}
                        </p>
                        <p className="text-sm text-gray-400">{contact.email}</p>
                        {contact.phone && (
                          <p className="text-sm text-gray-400">
                            {contact.phone}
                          </p>
                        )}
                        {contact.company && (
                          <p className="text-sm text-gray-400">
                            {contact.company}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
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
                                  <Badge
                                    variant="destructive"
                                    className="text-xs"
                                  >
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
                                {email.body
                                  .replace(/<[^>]*>/g, "")
                                  .substring(0, 200)}
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
                  <h3 className="text-lg font-semibold text-gray-100">
                    Activity Timeline
                  </h3>
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
                          const iconColor =
                            activity.type === "STAGE_CHANGE"
                              ? "bg-blue-500"
                              : activity.type === "EMAIL"
                                ? "bg-green-500"
                                : activity.type === "CALL"
                                  ? "bg-purple-500"
                                  : activity.type === "MEETING"
                                    ? "bg-orange-500"
                                    : activity.type === "NOTE"
                                      ? "bg-amber-500"
                                      : activity.type === "FILE_ATTACHED"
                                        ? "bg-cyan-500"
                                        : activity.type === "DEAL_WON"
                                          ? "bg-green-500"
                                          : "bg-gray-500";

                          return (
                            <div key={activity.id} className="relative pl-12">
                              {/* Timeline dot */}
                              <div
                                className={`absolute left-2.5 w-3 h-3 ${iconColor} rounded-full ring-4 ring-gray-950`}
                              ></div>

                              <Card
                                className={`bg-gray-800 border-gray-700 ${activity.type === "DEAL_WON" ? "border-green-500/50" : ""}`}
                              >
                                <CardContent className="p-4">
                                  <div className="flex items-start justify-between mb-2">
                                    {activity.type === "DEAL_WON" ? (
                                      <Badge
                                        variant="outline"
                                        className="text-xs border-green-500 text-green-400 bg-green-500/10"
                                      >
                                        🎉 DEAL WON
                                      </Badge>
                                    ) : (
                                      <Badge
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        {activity.type.replace("_", " ")}
                                      </Badge>
                                    )}
                                    <span className="text-xs text-gray-500">
                                      {new Date(
                                        activity.createdAt,
                                      ).toLocaleString()}
                                    </span>
                                  </div>
                                  {activity.type === "NOTE" ? (
                                    <div
                                      className="text-sm text-gray-300 mb-2 prose prose-invert prose-sm max-w-none"
                                      dangerouslySetInnerHTML={{
                                        __html: activity.content.replace(
                                          "Added a note: ",
                                          "",
                                        ),
                                      }}
                                    />
                                  ) : (
                                    <p
                                      className={`text-sm mb-2 ${activity.type === "DEAL_WON" ? "text-green-300 font-semibold" : "text-gray-300"}`}
                                    >
                                      {activity.content}
                                    </p>
                                  )}
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
                <div className="space-y-4">
                  {/* New note editor */}
                  <Card className="bg-gray-800 border-gray-700">
                    <CardContent className="p-4">
                      <h3 className="text-lg font-semibold text-gray-100 mb-3">
                        Add New Note
                      </h3>
                      <RichTextEditor
                        content={newNoteContent}
                        onChange={setNewNoteContent}
                        placeholder="Add a note about this deal..."
                        className="min-h-[200px]"
                      />
                      <Button
                        onClick={handleSaveNote}
                        disabled={isSavingNote || !newNoteContent.trim()}
                        className="mt-3 bg-green-600 hover:bg-green-700"
                      >
                        <IconDeviceFloppy size={16} className="mr-2" />
                        {isSavingNote ? "Saving..." : "Add Note"}
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Existing notes list */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-gray-100">
                      Notes History ({notes.length})
                    </h3>
                    {notes.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        No notes yet. Add your first note above.
                      </div>
                    ) : (
                      notes.map((note) => (
                        <Card
                          key={note.id}
                          className={`bg-gray-800 border-gray-700 ${
                            note.isPinned ? "border-yellow-500 border-2" : ""
                          }`}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2 flex-1">
                                {note.isPinned && (
                                  <IconPinFilled
                                    size={16}
                                    className="text-yellow-500"
                                  />
                                )}
                                <div className="text-sm text-gray-400">
                                  {note.createdByUser?.name || "Unknown"} •{" "}
                                  {new Date(note.createdAt).toLocaleString()}
                                  {note.createdAt !== note.updatedAt && (
                                    <span className="ml-1">(edited)</span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() =>
                                    handleTogglePin(note.id, note.isPinned)
                                  }
                                  className="h-8 w-8 p-0 text-gray-400 hover:text-yellow-500"
                                  title={
                                    note.isPinned ? "Unpin note" : "Pin note"
                                  }
                                >
                                  {note.isPinned ? (
                                    <IconPinFilled size={16} />
                                  ) : (
                                    <IconPin size={16} />
                                  )}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDeleteNote(note.id)}
                                  className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
                                  title="Delete note"
                                >
                                  <IconTrash size={16} />
                                </Button>
                              </div>
                            </div>
                            <div
                              className="prose prose-invert prose-sm max-w-none text-gray-100"
                              dangerouslySetInnerHTML={{ __html: note.content }}
                            />
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="files" className="m-0 p-6">
                <div className="space-y-4">
                  {/* Drag and Drop Zone */}
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                      isDragging
                        ? "border-blue-500 bg-blue-500/10"
                        : "border-gray-700 bg-gray-800/50"
                    }`}
                  >
                    <IconUpload
                      size={48}
                      className={`mx-auto mb-4 ${
                        isDragging ? "text-blue-500" : "text-gray-500"
                      }`}
                    />
                    <h3 className="text-lg font-semibold text-gray-100 mb-2">
                      {isDragging ? "Drop files here" : "Drag & Drop Files"}
                    </h3>
                    <p className="text-sm text-gray-400 mb-4">
                      or click below to browse
                    </p>
                    <div className="flex gap-2 justify-center">
                      <Button
                        onClick={() => setShowUploadForm(!showUploadForm)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <IconUpload size={16} className="mr-2" />
                        Upload File
                      </Button>
                      <Button
                        onClick={() => setShowLinkForm(!showLinkForm)}
                        variant="outline"
                        className="border-gray-600"
                      >
                        <IconLink size={16} className="mr-2" />
                        Add Link
                      </Button>
                    </div>
                  </div>

                  {/* Upload Form */}
                  {showUploadForm && (
                    <Card className="bg-gray-800 border-gray-700">
                      <CardContent className="p-4">
                        <form onSubmit={handleFileUpload} className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Select File
                            </label>
                            <input
                              type="file"
                              name="file"
                              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-gray-100 text-sm"
                              required
                            />
                          </div>
                          {uploadError && (
                            <div className="text-sm text-red-400">
                              {uploadError}
                            </div>
                          )}
                          <div className="flex gap-2">
                            <Button
                              type="submit"
                              disabled={isUploading}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              {isUploading ? "Uploading..." : "Upload"}
                            </Button>
                            <Button
                              type="button"
                              onClick={() => setShowUploadForm(false)}
                              variant="outline"
                              className="border-gray-600"
                            >
                              Cancel
                            </Button>
                          </div>
                        </form>
                      </CardContent>
                    </Card>
                  )}

                  {/* Link Form */}
                  {showLinkForm && (
                    <Card className="bg-gray-800 border-gray-700">
                      <CardContent className="p-4">
                        <form onSubmit={handleLinkSubmit} className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Link Name
                            </label>
                            <input
                              type="text"
                              name="filename"
                              placeholder="e.g., Project Proposal"
                              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-gray-100 text-sm"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              URL
                            </label>
                            <input
                              type="url"
                              name="url"
                              placeholder="https://..."
                              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-gray-100 text-sm"
                              required
                            />
                          </div>
                          {uploadError && (
                            <div className="text-sm text-red-400">
                              {uploadError}
                            </div>
                          )}
                          <div className="flex gap-2">
                            <Button
                              type="submit"
                              disabled={isUploading}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              {isUploading ? "Adding..." : "Add Link"}
                            </Button>
                            <Button
                              type="button"
                              onClick={() => setShowLinkForm(false)}
                              variant="outline"
                              className="border-gray-600"
                            >
                              Cancel
                            </Button>
                          </div>
                        </form>
                      </CardContent>
                    </Card>
                  )}

                  {/* Files List */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-gray-100">
                      Attachments ({attachments.length})
                    </h3>
                    {attachments.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        No attachments yet. Upload files or add links above.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {attachments.map((attachment) => (
                          <Card
                            key={attachment.id}
                            className="bg-gray-800 border-gray-700 hover:bg-gray-750"
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                  {attachment.url &&
                                  !attachment.storage_path ? (
                                    <IconLink
                                      size={20}
                                      className="text-blue-400 flex-shrink-0"
                                    />
                                  ) : (
                                    <IconPaperclip
                                      size={20}
                                      className="text-gray-400 flex-shrink-0"
                                    />
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-100 truncate">
                                      {attachment.filename}
                                    </p>
                                    <div className="flex items-center gap-2 text-xs text-gray-400">
                                      {attachment.size && (
                                        <span>
                                          {(attachment.size / 1024).toFixed(1)}{" "}
                                          KB
                                        </span>
                                      )}
                                      {attachment.uploadedByUser && (
                                        <>
                                          <span>•</span>
                                          <span>
                                            {attachment.uploadedByUser.name}
                                          </span>
                                        </>
                                      )}
                                      {attachment.createdAt && (
                                        <>
                                          <span>•</span>
                                          <span>
                                            {new Date(
                                              attachment.createdAt,
                                            ).toLocaleDateString()}
                                          </span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  {attachment.url && (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() =>
                                        window.open(attachment.url, "_blank")
                                      }
                                      className="h-8 w-8 p-0 text-gray-400 hover:text-blue-500"
                                      title="Open"
                                    >
                                      <IconDownload size={16} />
                                    </Button>
                                  )}
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() =>
                                      handleDeleteAttachment(attachment.id)
                                    }
                                    className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
                                    title="Delete"
                                  >
                                    <IconTrash size={16} />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
