"use client";

import React, { useState } from "react";
import {
  IconCalendar,
  IconUsers,
  IconEdit,
  IconTrash,
  IconChevronDown,
  IconChevronRight,
  IconFileText,
  IconTarget,
  IconCircleCheck,
} from "@tabler/icons-react";
import EditMeetingNoteForm from "./EditMeetingNoteForm";

interface ActionItem {
  id: string;
  description: string;
  assignee_text?: string;
  assignee_id?: string;
  status: string;
  priority: string;
  due_date?: string;
}

interface MeetingNote {
  id: string;
  title: string;
  meeting_type: string;
  meeting_date: string;
  attendees_text: string[];
  attendees?: string[];
  agenda?: string;
  notes?: string;
  decisions?: string;
  action_items?: ActionItem[];
  createdBy: {
    name: string;
    email: string;
  };
  created_at: string;
}

interface MeetingNoteCardProps {
  meetingNote: MeetingNote;
  epicId: string;
  onUpdate: (updatedNote: MeetingNote) => void;
  onDelete: (noteId: string) => void;
}

const meetingTypeLabels = {
  planning: "Planning",
  review: "Review",
  retrospective: "Retrospective",
  stakeholder: "Stakeholder",
  demo: "Demo",
  standup: "Standup",
  other: "Other",
};

const meetingTypeColors = {
  planning: "bg-blue-900/30 text-blue-400",
  review: "bg-green-900/30 text-green-400",
  retrospective: "bg-purple-900/30 text-purple-400",
  stakeholder: "bg-orange-900/30 text-orange-400",
  demo: "bg-pink-900/30 text-pink-400",
  standup: "bg-indigo-900/30 text-indigo-400",
  other: "bg-zinc-900/30 text-zinc-400",
};

export default function MeetingNoteCard({
  meetingNote,
  epicId,
  onUpdate,
  onDelete,
}: MeetingNoteCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this meeting note?")) {
      try {
        const response = await fetch(
          `/api/epics/${epicId}/meeting-notes/${meetingNote.id}`,
          {
            method: "DELETE",
          }
        );

        if (response.ok) {
          onDelete(meetingNote.id);
        } else {
          alert("Failed to delete meeting note");
        }
      } catch (error) {
        console.error("Failed to delete meeting note:", error);
        alert("Failed to delete meeting note");
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isEditing) {
    return (
      <EditMeetingNoteForm
        meetingNote={meetingNote}
        epicId={epicId}
        onCancel={() => setIsEditing(false)}
        onSuccess={(updatedNote) => {
          onUpdate(updatedNote);
          setIsEditing(false);
        }}
      />
    );
  }

  return (
    <div className="bg-zinc-800 border border-zinc-700 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h4 className="text-lg font-semibold text-white">
                {meetingNote.title}
              </h4>
              <span
                className={`px-2 py-1 text-xs rounded-full ${meetingTypeColors[meetingNote.meeting_type as keyof typeof meetingTypeColors] || meetingTypeColors.other}`}
              >
                {meetingTypeLabels[
                  meetingNote.meeting_type as keyof typeof meetingTypeLabels
                ] || "Other"}
              </span>
            </div>

            <div className="flex items-center gap-4 text-sm text-zinc-400">
              <div className="flex items-center gap-1">
                <IconCalendar size={16} />
                {formatDate(meetingNote.meeting_date)}
              </div>
              <div className="flex items-center gap-1">
                <IconUsers size={16} />
                {meetingNote.attendees_text?.length || 0} attendees
              </div>
              <div className="text-zinc-500">
                Created by {meetingNote.createdBy.name}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditing(true)}
              className="p-2 text-zinc-400 hover:text-zinc-300 hover:bg-zinc-700 rounded transition-colors"
              title="Edit meeting note"
            >
              <IconEdit size={16} />
            </button>
            <button
              onClick={handleDelete}
              className="p-2 text-zinc-400 hover:text-red-400 hover:bg-zinc-700 rounded transition-colors"
              title="Delete meeting note"
            >
              <IconTrash size={16} />
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 text-zinc-400 hover:text-zinc-300 hover:bg-zinc-700 rounded transition-colors"
            >
              {isExpanded ? (
                <IconChevronDown size={16} />
              ) : (
                <IconChevronRight size={16} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-zinc-700 p-4 space-y-4">
          {meetingNote.attendees_text &&
            meetingNote.attendees_text.length > 0 && (
              <div>
                <h5 className="text-sm font-semibold text-zinc-300 mb-2 flex items-center gap-2">
                  <IconUsers size={16} />
                  Attendees
                </h5>
                <div className="flex flex-wrap gap-2">
                  {meetingNote.attendees_text.map((attendee, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-zinc-700 text-zinc-300 text-sm rounded"
                    >
                      {attendee}
                    </span>
                  ))}
                </div>
              </div>
            )}

          {meetingNote.agenda && (
            <div>
              <h5 className="text-sm font-semibold text-zinc-300 mb-2 flex items-center gap-2">
                <IconTarget size={16} />
                Agenda
              </h5>
              <div className="text-zinc-300 text-sm bg-zinc-900 p-3 rounded prose prose-sm prose-invert max-w-none">
                <div dangerouslySetInnerHTML={{ __html: meetingNote.agenda }} />
              </div>
            </div>
          )}

          {meetingNote.notes && (
            <div>
              <h5 className="text-sm font-semibold text-zinc-300 mb-2 flex items-center gap-2">
                <IconFileText size={16} />
                Notes
              </h5>
              <div className="text-zinc-300 text-sm bg-zinc-900 p-3 rounded prose prose-sm prose-invert max-w-none">
                <div dangerouslySetInnerHTML={{ __html: meetingNote.notes }} />
              </div>
            </div>
          )}

          {meetingNote.decisions && (
            <div>
              <h5 className="text-sm font-semibold text-zinc-300 mb-2 flex items-center gap-2">
                <IconCircleCheck size={16} />
                Decisions
              </h5>
              <div className="text-zinc-300 text-sm bg-zinc-900 p-3 rounded prose prose-sm prose-invert max-w-none">
                <div dangerouslySetInnerHTML={{ __html: meetingNote.decisions }} />
              </div>
            </div>
          )}

          {meetingNote.action_items && meetingNote.action_items.length > 0 && (
            <div>
              <h5 className="text-sm font-semibold text-zinc-300 mb-2 flex items-center gap-2">
                <IconTarget size={16} />
                Action Items ({meetingNote.action_items.length})
              </h5>
              <div className="space-y-2">
                {meetingNote.action_items.map((item, index) => (
                  <div
                    key={item.id || index}
                    className="bg-zinc-900 p-3 rounded border-l-4 border-blue-500"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-zinc-300 text-sm mb-1">
                          {item.description}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-zinc-400">
                          {item.assignee_text && (
                            <span>👤 {item.assignee_text}</span>
                          )}
                          <span
                            className={`px-2 py-1 rounded ${
                              item.status === "completed"
                                ? "bg-green-900/30 text-green-400"
                                : item.status === "in_progress"
                                  ? "bg-blue-900/30 text-blue-400"
                                  : item.status === "cancelled"
                                    ? "bg-red-900/30 text-red-400"
                                    : "bg-zinc-700 text-zinc-300"
                            }`}
                          >
                            {item.status.replace("_", " ")}
                          </span>
                          <span
                            className={`px-2 py-1 rounded ${
                              item.priority === "critical"
                                ? "bg-red-900/30 text-red-400"
                                : item.priority === "high"
                                  ? "bg-orange-900/30 text-orange-400"
                                  : item.priority === "low"
                                    ? "bg-green-900/30 text-green-400"
                                    : "bg-zinc-700 text-zinc-300"
                            }`}
                          >
                            {item.priority}
                          </span>
                          {item.due_date && (
                            <span>
                              📅 {new Date(item.due_date).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
