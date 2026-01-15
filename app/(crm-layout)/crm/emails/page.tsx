"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IconMail, IconRefresh, IconSearch, IconArchive, IconArchiveOff } from "@tabler/icons-react";

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

export default function EmailInboxPage() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set());
  const [view, setView] = useState<'active' | 'archived'>('active');

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
      await fetchEmails();
    } catch (error) {
      console.error("Failed to fetch new emails:", error);
    }
  };

  const markAsRead = async (emailId: string) => {
    try {
      const response = await fetch(`/api/crm/emails/${emailId}/read`, { method: 'PATCH' });
      if (response.ok) {
        setEmails(emails.map(email => 
          email.id === emailId ? { ...email, isRead: true } : email
        ));
      }
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const archiveEmail = async (emailId: string, archive: boolean = true) => {
    try {
      const newStatus = archive ? 'ARCHIVED' : 'ACTIVE';
      const response = await fetch(`/api/crm/emails/${emailId}/archive`, { 
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) {
        setEmails(emails.map(email => 
          email.id === emailId ? { ...email, status: newStatus } : email
        ));
      }
    } catch (error) {
      console.error("Failed to archive email:", error);
    }
  };

  const archiveSelected = async () => {
    const selectedArray = Array.from(selectedEmails);
    await Promise.all(selectedArray.map(id => archiveEmail(id, view === 'active')));
    setSelectedEmails(new Set());
  };

  const handleSelectEmail = (emailId: string, checked: boolean) => {
    const newSelected = new Set(selectedEmails);
    if (checked) {
      newSelected.add(emailId);
    } else {
      newSelected.delete(emailId);
    }
    setSelectedEmails(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedEmails(new Set(filteredEmails.map(email => email.id)));
    } else {
      setSelectedEmails(new Set());
    }
  };

  useEffect(() => {
    fetchEmails();
  }, []);

  const filteredEmails = emails.filter((email) => {
    // Filter by view (active/archived)
    if (view === 'active' && email.status !== 'ACTIVE') return false;
    if (view === 'archived' && email.status !== 'ARCHIVED') return false;

    // Filter by search term
    if (!searchTerm) return true;
    
    return (
      email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.fromEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.body.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const activeCount = emails.filter(e => e.status === 'ACTIVE').length;
  const archivedCount = emails.filter(e => e.status === 'ARCHIVED').length;
  const unreadCount = emails.filter(e => e.status === 'ACTIVE' && !e.isRead).length;

  if (loading) {
    return <div className="p-6">Loading emails...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <IconMail size={24} />
          Email Inbox
          {unreadCount > 0 && (
            <Badge variant="destructive" className="ml-2">
              {unreadCount} unread
            </Badge>
          )}
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
        <Tabs value={view} onValueChange={(value) => setView(value as any)}>
          <TabsList>
            <TabsTrigger value="active">Inbox ({activeCount})</TabsTrigger>
            <TabsTrigger value="archived">Archived ({archivedCount})</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {selectedEmails.size > 0 && (
        <div className="mb-4 p-3 bg-blue-900 border border-blue-700 rounded-lg flex items-center gap-4">
          <span className="text-sm font-medium text-blue-100">{selectedEmails.size} selected</span>
          <Button size="sm" variant="outline" onClick={archiveSelected}>
            <IconArchive size={14} className="mr-1" />
            {view === 'active' ? 'Archive' : 'Unarchive'} Selected
          </Button>
        </div>
      )}

      <div className="bg-gray-900 shadow overflow-hidden sm:rounded-md border border-gray-700">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-800">
            <tr>
              <th className="px-4 py-3">
                <Checkbox
                  checked={selectedEmails.size === filteredEmails.length && filteredEmails.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Sender
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Subject
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Content
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Linked Deal
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-gray-900 divide-y divide-gray-700">
            {filteredEmails.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                  No emails found.
                </td>
              </tr>
            ) : (
              filteredEmails.map((email) => (
                <tr 
                  key={email.id} 
                  className={`hover:bg-gray-800 cursor-pointer ${!email.isRead ? 'bg-blue-950 border-l-4 border-blue-500' : ''}`}
                  onClick={() => markAsRead(email.id)}
                >
                  <td className="px-4 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedEmails.has(email.id)}
                      onCheckedChange={(checked) => handleSelectEmail(email.id, checked as boolean)}
                    />
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className={`text-sm ${!email.isRead ? 'font-bold' : 'font-medium'} text-gray-100`}>
                      {email.fromEmail}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className={`text-sm ${!email.isRead ? 'font-bold' : ''} text-gray-100 max-w-xs truncate`}>
                      {email.subject || "(no subject)"}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className={`text-sm ${!email.isRead ? 'font-semibold' : ''} text-gray-300 max-w-md truncate`}>
                      {email.body.replace(/<[^>]*>/g, "").substring(0, 100)}...
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {email.dealId ? (
                      <Badge variant="outline" className="text-xs border-gray-600 text-gray-300">
                        Deal #{email.dealId}
                      </Badge>
                    ) : (
                      <span className="text-sm text-gray-500">-</span>
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-400">
                    {new Date(email.receivedAt || email.sentAt || email.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => archiveEmail(email.id, view === 'active')}
                    >
                      {view === 'active' ? <IconArchive size={14} /> : <IconArchiveOff size={14} />}
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}