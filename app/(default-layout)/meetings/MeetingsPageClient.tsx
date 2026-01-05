"use client";

import React, { useState, useEffect } from "react";
import { IconCalendar, IconFilter, IconPlus, IconSearch } from "@tabler/icons-react";

interface MeetingNote {
  id: string;
  title: string;
  meeting_type: string;
  meeting_date: string;
  attendees_text: string[];
  agenda?: string;
  notes?: string;
  decisions?: string;
  action_items?: Array<{
    id: string;
    description: string;
    assignee_text?: string;
    status: string;
    priority: string;
    due_date?: string;
  }>;
  createdBy: {
    name: string;
    email: string;
  };
  epic: {
    id: string;
    title: string;
  };
  created_at: string;
}

interface Epic {
  id: string;
  title: string;
}

export default function MeetingsPageClient() {
  const [meetingNotes, setMeetingNotes] = useState<MeetingNote[]>([]);
  const [epics, setEpics] = useState<Epic[]>([]);
  const [selectedEpicId, setSelectedEpicId] = useState<string>("all");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchEpics();
  }, []);

  useEffect(() => {
    fetchMeetingNotes();
  }, [selectedEpicId]);

  const fetchEpics = async () => {
    try {
      const response = await fetch("/api/epics/list");
      if (response.ok) {
        const data = await response.json();
        setEpics(data);
      }
    } catch (error) {
      console.error("Failed to fetch epics:", error);
    }
  };

  const fetchMeetingNotes = async () => {
    setLoading(true);
    try {
      const url =
        selectedEpicId === "all"
          ? "/api/meeting-notes"
          : `/api/meeting-notes?epicId=${selectedEpicId}`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setMeetingNotes(data);
      }
    } catch (error) {
      console.error("Failed to fetch meeting notes:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredNotes = meetingNotes.filter((note) => {
    // Search filter
    const matchesSearch =
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.meeting_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.epic.title.toLowerCase().includes(searchTerm.toLowerCase());

    // Period filter
    const noteDate = new Date(note.meeting_date);
    const now = new Date();
    let matchesPeriod = true;

    if (selectedPeriod !== "all") {
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      switch (selectedPeriod) {
        case "today":
          matchesPeriod = noteDate >= startOfToday;
          break;
        case "last7days":
          const last7Days = new Date(now);
          last7Days.setDate(now.getDate() - 7);
          matchesPeriod = noteDate >= last7Days;
          break;
        case "last30days":
          const last30Days = new Date(now);
          last30Days.setDate(now.getDate() - 30);
          matchesPeriod = noteDate >= last30Days;
          break;
        case "thisMonth":
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          matchesPeriod = noteDate >= startOfMonth;
          break;
        case "lastMonth":
          const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
          matchesPeriod = noteDate >= startOfLastMonth && noteDate <= endOfLastMonth;
          break;
        case "thisYear":
          const startOfYear = new Date(now.getFullYear(), 0, 1);
          matchesPeriod = noteDate >= startOfYear;
          break;
      }
    }

    return matchesSearch && matchesPeriod;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <IconCalendar size={32} className="text-blue-400" />
              <h1 className="text-3xl font-bold text-white">Meeting Notes</h1>
            </div>
            <p className="text-zinc-400">
              Manage meeting notes and action items across all epics
            </p>
          </div>
          <a
            href="/epics"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <IconPlus size={20} />
            New Meeting Note
          </a>
        </div>

        {/* Filters */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Epic Filter */}
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                <IconFilter size={16} className="inline mr-2" />
                Filter by Epic
              </label>
              <select
                value={selectedEpicId}
                onChange={(e) => setSelectedEpicId(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Epics</option>
                {epics.map((epic) => (
                  <option key={epic.id} value={epic.id}>
                    {epic.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Period Filter */}
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                <IconCalendar size={16} className="inline mr-2" />
                Time Period
              </label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="last7days">Last 7 Days</option>
                <option value="last30days">Last 30 Days</option>
                <option value="thisMonth">This Month</option>
                <option value="lastMonth">Last Month</option>
                <option value="thisYear">This Year</option>
              </select>
            </div>

            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                <IconSearch size={16} className="inline mr-2" />
                Search
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by title, type, or epic..."
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Meeting Notes List */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
        {loading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-zinc-800 rounded"></div>
            <div className="h-32 bg-zinc-800 rounded"></div>
            <div className="h-32 bg-zinc-800 rounded"></div>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="text-center py-12">
            <IconCalendar size={64} className="mx-auto text-zinc-600 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              No meeting notes yet
            </h3>
            <p className="text-zinc-400 mb-4">
              Meeting notes are created within epics. Visit an epic detail page
              to add your first meeting note.
            </p>
            <a
              href="/epics"
              className="inline-block px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors"
            >
              Go to Epics
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNotes.map((note) => (
              <div
                key={note.id}
                className="bg-zinc-800 border border-zinc-700 rounded-lg p-5 hover:border-zinc-600 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-1">
                      {note.title}
                    </h3>
                    <div className="flex items-center gap-3 text-sm text-zinc-400">
                      <span className="px-2 py-1 bg-blue-900/30 text-blue-400 rounded">
                        {note.meeting_type}
                      </span>
                      <span>{formatDate(note.meeting_date)}</span>
                      <span>•</span>
                      <a
                        href={`/epics/${note.epic.id}`}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        {note.epic.title}
                      </a>
                    </div>
                  </div>
                </div>

                {note.attendees_text && note.attendees_text.length > 0 && (
                  <div className="mb-3">
                    <span className="text-sm text-zinc-400">Attendees: </span>
                    <span className="text-sm text-zinc-300">
                      {note.attendees_text.join(", ")}
                    </span>
                  </div>
                )}

                {note.agenda && (
                  <div className="mb-3">
                    <span className="text-sm font-medium text-zinc-400">
                      Agenda:{" "}
                    </span>
                    <p className="text-sm text-zinc-300 mt-1">{note.agenda}</p>
                  </div>
                )}

                {note.decisions && (
                  <div className="mb-3">
                    <span className="text-sm font-medium text-zinc-400">
                      Decisions:{" "}
                    </span>
                    <p className="text-sm text-zinc-300 mt-1">{note.decisions}</p>
                  </div>
                )}

                {note.action_items && note.action_items.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-zinc-700">
                    <span className="text-sm font-medium text-zinc-400 mb-2 block">
                      Action Items ({note.action_items.length})
                    </span>
                    <div className="space-y-2">
                      {note.action_items.slice(0, 3).map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-2 text-sm"
                        >
                          <span
                            className={`px-2 py-0.5 rounded text-xs ${
                              item.status === "completed"
                                ? "bg-green-900/30 text-green-400"
                                : item.status === "in_progress"
                                  ? "bg-blue-900/30 text-blue-400"
                                  : "bg-zinc-700 text-zinc-300"
                            }`}
                          >
                            {item.status}
                          </span>
                          <span className="text-zinc-300">{item.description}</span>
                          {item.assignee_text && (
                            <span className="text-zinc-500 text-xs">
                              → {item.assignee_text}
                            </span>
                          )}
                        </div>
                      ))}
                      {note.action_items.length > 3 && (
                        <span className="text-xs text-zinc-500">
                          +{note.action_items.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="mt-3 pt-3 border-t border-zinc-700 flex items-center justify-between">
                  <span className="text-xs text-zinc-500">
                    Created by {note.createdBy.name} on{" "}
                    {formatDate(note.created_at)}
                  </span>
                  <a
                    href={`/epics/${note.epic.id}`}
                    className="text-sm text-blue-400 hover:text-blue-300"
                  >
                    View in Epic →
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
