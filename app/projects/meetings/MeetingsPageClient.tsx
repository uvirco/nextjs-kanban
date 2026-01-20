"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  IconCalendar,
  IconFilter,
  IconPlus,
  IconSearch,
  IconEdit,
  IconChevronDown,
  IconChevronRight,
  IconUsers,
  IconTarget,
  IconFileText,
  IconCircleCheck,
} from "@tabler/icons-react";
import CreateMeetingNoteModal from "../../../ui/CreateMeetingNoteModal";
import EditMeetingNoteForm from "../../../ui/EditMeetingNoteForm";

interface MeetingNote {
  id: string;
  title: string;
  meeting_type: string;
  meeting_date: string;
  attendees_text: string[];
  attendees?: Array<{ id: string; name: string; email: string }>;
  agenda?: string;
  notes?: string;
  decisions?: string;
  action_items?: Array<{
    id: string;
    description: string;
    assignee_text?: string;
    assignee?: { id: string; name: string; email: string };
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
  const searchParams = useSearchParams();
  const router = useRouter();

  const [meetingNotes, setMeetingNotes] = useState<MeetingNote[]>([]);
  const [epics, setEpics] = useState<Epic[]>([]);
  const [selectedEpicId, setSelectedEpicId] = useState<string>("all");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingNote, setEditingNote] = useState<MeetingNote | null>(null);
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());

  // Initialize state from URL parameters and localStorage
  useEffect(() => {
    const epicParam = searchParams.get("epic") || "all";
    const periodParam = searchParams.get("period") || "all";
    const searchParam = searchParams.get("search") || "";

    setSelectedEpicId(epicParam);
    setSelectedPeriod(periodParam);
    setSearchTerm(searchParam);

    // Load expanded notes from localStorage
    const savedExpanded = localStorage.getItem("meetings-expanded-notes");
    if (savedExpanded) {
      try {
        const expandedArray = JSON.parse(savedExpanded);
        setExpandedNotes(new Set(expandedArray));
      } catch (error) {
        console.error("Failed to parse saved expanded notes:", error);
      }
    }
  }, [searchParams]);

  useEffect(() => {
    fetchEpics();
  }, []);

  useEffect(() => {
    fetchMeetingNotes();
  }, []);

  useEffect(() => {
    fetchMeetingNotes();
  }, [selectedEpicId]);

  // Debounced search update
  useEffect(() => {
    const timer = setTimeout(() => {
      const currentSearch = searchParams.get("search") || "";
      if (searchTerm !== currentSearch) {
        updateFilters({ search: searchTerm });
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [searchTerm, searchParams, router]);

  const fetchEpics = async () => {
    try {
      console.log("Fetching epics...");
      const response = await fetch("/api/epics");
      console.log("Epics response status:", response.status);
      if (response.ok) {
        const data = await response.json();
        console.log("Fetched epics:", data);
        setEpics(data);
      } else {
        const errorData = await response.json();
        console.error("Failed to fetch epics:", errorData);
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
      console.log("Fetching meeting notes from:", url);
      const response = await fetch(url);
      console.log("Meeting notes response status:", response.status);
      if (response.ok) {
        const data = await response.json();
        console.log("Fetched meeting notes:", data);
        setMeetingNotes(data);
      } else {
        const errorData = await response.json();
        console.error("Failed to fetch meeting notes:", errorData);
      }
    } catch (error) {
      console.error("Failed to fetch meeting notes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSuccess = (newMeetingNote: MeetingNote) => {
    setMeetingNotes((prev) => [newMeetingNote, ...prev]);
  };

  const handleEditNote = (note: MeetingNote) => {
    setEditingNote(note);
  };

  const handleEditSuccess = (updatedNote: MeetingNote) => {
    setMeetingNotes((prev) =>
      prev.map((note) => (note.id === updatedNote.id ? updatedNote : note))
    );
    setEditingNote(null);
  };

  const handleEditCancel = () => {
    setEditingNote(null);
  };

  const toggleExpand = (id: string) => {
    setExpandedNotes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      // Save to localStorage
      localStorage.setItem(
        "meetings-expanded-notes",
        JSON.stringify([...newSet])
      );
      return newSet;
    });
  };

  // Update URL when filters change
  const updateFilters = (updates: {
    epic?: string;
    period?: string;
    search?: string;
  }) => {
    const params = new URLSearchParams(searchParams.toString());

    if (updates.epic !== undefined) {
      if (updates.epic === "all") {
        params.delete("epic");
      } else {
        params.set("epic", updates.epic);
      }
    }

    if (updates.period !== undefined) {
      if (updates.period === "all") {
        params.delete("period");
      } else {
        params.set("period", updates.period);
      }
    }

    if (updates.search !== undefined) {
      if (updates.search.trim() === "") {
        params.delete("search");
      } else {
        params.set("search", updates.search.trim());
      }
    }

    const newUrl = params.toString() ? `?${params.toString()}` : "";
    router.replace(`/meetings${newUrl}`, { scroll: false });
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
      const startOfToday = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      );

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
          const startOfLastMonth = new Date(
            now.getFullYear(),
            now.getMonth() - 1,
            1
          );
          const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
          matchesPeriod =
            noteDate >= startOfLastMonth && noteDate <= endOfLastMonth;
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
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <IconPlus size={20} />
            New Meeting Note
          </button>
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
                onChange={(e) => {
                  const value = e.target.value;
                  setSelectedEpicId(value);
                  updateFilters({ epic: value });
                }}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Projects</option>
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
                onChange={(e) => {
                  const value = e.target.value;
                  setSelectedPeriod(value);
                  updateFilters({ period: value });
                }}
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
              Get started by creating your first meeting note.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors inline-flex items-center gap-2"
            >
              <IconPlus size={20} />
              Create Meeting Note
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNotes.map((note) => {
              const isExpanded = expandedNotes.has(note.id);
              return (
                <div
                  key={note.id}
                  className="bg-zinc-800 border border-zinc-700 rounded-lg overflow-hidden hover:border-zinc-600 transition-colors"
                >
                  {/* Collapsed Header */}
                  <div
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-zinc-700/50 transition-colors"
                    onClick={() => toggleExpand(note.id)}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {isExpanded ? (
                        <IconChevronDown
                          size={20}
                          className="text-zinc-400 flex-shrink-0"
                        />
                      ) : (
                        <IconChevronRight
                          size={20}
                          className="text-zinc-400 flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-white truncate">
                          {note.title}
                        </h3>
                        <div className="flex items-center gap-3 text-sm text-zinc-400 mt-1">
                          <span className="px-2 py-0.5 bg-blue-900/30 text-blue-400 rounded text-xs capitalize">
                            {note.meeting_type}
                          </span>
                          <span className="flex items-center gap-1">
                            <IconCalendar size={14} />
                            {formatDate(note.meeting_date)}
                          </span>
                          {note.attendees && note.attendees.length > 0 && (
                            <span className="flex items-center gap-1">
                              <IconUsers size={14} />
                              {note.attendees.length} attendees
                            </span>
                          )}
                          {note.epic && (
                            <>
                              <span>•</span>
                              <a
                                href={`/projects/epics/${note.epic.id}`}
                                className="text-blue-400 hover:text-blue-300 truncate"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {note.epic.title}
                              </a>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditNote(note);
                        }}
                        className="p-2 text-zinc-400 hover:text-zinc-300 hover:bg-zinc-700 rounded transition-colors"
                        title="Edit meeting note"
                      >
                        <IconEdit size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="border-t border-zinc-700 p-4 space-y-4">
                      {note.attendees && note.attendees.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-zinc-300 mb-2 flex items-center gap-2">
                            <IconUsers size={16} />
                            Attendees
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {note.attendees.map((attendee) => (
                              <span
                                key={attendee.id}
                                className="px-2 py-1 bg-zinc-700 text-zinc-300 rounded text-sm"
                              >
                                {attendee.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {note.agenda && (
                        <div>
                          <h4 className="text-sm font-medium text-zinc-300 mb-2 flex items-center gap-2">
                            <IconTarget size={16} />
                            Agenda
                          </h4>
                          <div className="text-zinc-300 text-sm bg-zinc-900 p-3 rounded prose prose-sm prose-invert max-w-none">
                            <div
                              dangerouslySetInnerHTML={{ __html: note.agenda }}
                            />
                          </div>
                        </div>
                      )}

                      {note.notes && (
                        <div>
                          <h4 className="text-sm font-medium text-zinc-300 mb-2 flex items-center gap-2">
                            <IconFileText size={16} />
                            Notes
                          </h4>
                          <div className="text-zinc-300 text-sm bg-zinc-900 p-3 rounded prose prose-sm prose-invert max-w-none">
                            <div
                              dangerouslySetInnerHTML={{ __html: note.notes }}
                            />
                          </div>
                        </div>
                      )}

                      {note.decisions && (
                        <div>
                          <h4 className="text-sm font-medium text-zinc-300 mb-2 flex items-center gap-2">
                            <IconCircleCheck size={16} />
                            Decisions
                          </h4>
                          <div className="text-zinc-300 text-sm bg-zinc-900 p-3 rounded prose prose-sm prose-invert max-w-none">
                            <div
                              dangerouslySetInnerHTML={{
                                __html: note.decisions,
                              }}
                            />
                          </div>
                        </div>
                      )}

                      {note.action_items && note.action_items.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-zinc-300 mb-2 flex items-center gap-2">
                            <IconTarget size={16} />
                            Action Items ({note.action_items.length})
                          </h4>
                          <div className="space-y-2">
                            {note.action_items.map((item) => (
                              <div
                                key={item.id}
                                className="flex items-start gap-3 p-3 bg-zinc-900 rounded"
                              >
                                <span
                                  className={`px-2 py-1 rounded text-xs flex-shrink-0 mt-0.5 ${
                                    item.status === "completed"
                                      ? "bg-green-900/30 text-green-400"
                                      : item.status === "in_progress"
                                        ? "bg-blue-900/30 text-blue-400"
                                        : "bg-zinc-700 text-zinc-300"
                                  }`}
                                >
                                  {item.status.replace("_", " ")}
                                </span>
                                <div className="flex-1 min-w-0">
                                  <div className="text-zinc-300 text-sm">
                                    {item.description}
                                  </div>
                                  {item.assignee && (
                                    <div className="text-zinc-500 text-xs mt-1">
                                      Assigned to: {item.assignee.name}
                                    </div>
                                  )}
                                  {item.due_date && (
                                    <div className="text-zinc-500 text-xs mt-1">
                                      Due:{" "}
                                      {new Date(
                                        item.due_date
                                      ).toLocaleDateString()}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-4 border-t border-zinc-700">
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
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreateMeetingNoteModal
          epics={epics}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
        />
      )}

      {editingNote && (
        <EditMeetingNoteForm
          meetingNote={editingNote}
          epicId={editingNote.epic.id}
          onCancel={handleEditCancel}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
}
