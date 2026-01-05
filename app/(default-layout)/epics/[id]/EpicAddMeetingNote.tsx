"use client";

import React, { useState } from "react";
import { IconX, IconCalendar, IconUsers } from "@tabler/icons-react";
import RichTextEditor from "../../../ui/RichTextEditor";

interface EpicAddMeetingNoteProps {
  epicId: string;
  onCancel: () => void;
  onSuccess: (meetingNote: any) => void;
}

const meetingTypes = [
  { value: "planning", label: "Planning" },
  { value: "review", label: "Review" },
  { value: "retrospective", label: "Retrospective" },
  { value: "stakeholder", label: "Stakeholder" },
  { value: "demo", label: "Demo" },
  { value: "standup", label: "Standup" },
  { value: "other", label: "Other" },
];

export default function EpicAddMeetingNote({
  epicId,
  onCancel,
  onSuccess,
}: EpicAddMeetingNoteProps) {
  const [formData, setFormData] = useState({
    title: "",
    meetingType: "other",
    meetingDate: new Date().toISOString().split("T")[0],
    attendees: "",
    agenda: "",
    notes: "",
    decisions: "",
    actionItems: [] as Array<{
      description: string;
      assignee: string;
      status: string;
      priority: string;
      due_date: string;
    }>,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const attendeesArray = formData.attendees
        .split(",")
        .map((attendee) => attendee.trim())
        .filter((attendee) => attendee.length > 0);

      const response = await fetch(`/api/epics/${epicId}/meeting-notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          attendees: attendeesArray,
          meetingDate: new Date(formData.meetingDate).toISOString(),
        }),
      });

      if (response.ok) {
        const newMeetingNote = await response.json();
        onSuccess(newMeetingNote);
      } else {
        alert("Failed to create meeting note");
      }
    } catch (error) {
      console.error("Failed to create meeting note:", error);
      alert("Failed to create meeting note");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleActionItemChange = (
    index: number,
    field: string,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      actionItems: prev.actionItems.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const addActionItem = () => {
    setFormData((prev) => ({
      ...prev,
      actionItems: [
        ...prev.actionItems,
        {
          description: "",
          assignee: "",
          status: "pending",
          priority: "medium",
          due_date: "",
        },
      ],
    }));
  };

  const removeActionItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      actionItems: prev.actionItems.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Add Meeting Note</h3>
        <button
          onClick={onCancel}
          className="p-2 text-zinc-400 hover:text-zinc-300 hover:bg-zinc-700 rounded transition-colors"
        >
          <IconX size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Meeting Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
              placeholder="e.g., Sprint Planning, Stakeholder Review"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Meeting Type
            </label>
            <select
              value={formData.meetingType}
              onChange={(e) => handleChange("meetingType", e.target.value)}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              {meetingTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2 flex items-center gap-2">
              <IconCalendar size={16} />
              Meeting Date *
            </label>
            <input
              type="date"
              value={formData.meetingDate}
              onChange={(e) => handleChange("meetingDate", e.target.value)}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2 flex items-center gap-2">
              <IconUsers size={16} />
              Attendees
            </label>
            <input
              type="text"
              value={formData.attendees}
              onChange={(e) => handleChange("attendees", e.target.value)}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
              placeholder="John Doe, Jane Smith, Mike Johnson"
            />
            <p className="text-xs text-zinc-500 mt-1">
              Separate names with commas
            </p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Agenda
          </label>
          <RichTextEditor
            content={formData.agenda}
            onChange={(content) => handleChange("agenda", content)}
            placeholder="What was discussed or planned to be discussed..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Meeting Notes
          </label>
          <RichTextEditor
            content={formData.notes}
            onChange={(content) => handleChange("notes", content)}
            placeholder="Detailed notes from the meeting..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Decisions Made
          </label>
          <RichTextEditor
            content={formData.decisions}
            onChange={(content) => handleChange("decisions", content)}
            placeholder="Key decisions and outcomes..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Action Items
          </label>
          <div className="space-y-3">
            {formData.actionItems.map((item, index) => (
              <div
                key={index}
                className="flex gap-3 items-start p-3 bg-zinc-800 rounded-lg"
              >
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) =>
                        handleActionItemChange(
                          index,
                          "description",
                          e.target.value
                        )
                      }
                      className="w-full px-2 py-1 bg-zinc-900 border border-zinc-700 rounded text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 text-sm"
                      placeholder="Action item description"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">
                      Assignee
                    </label>
                    <input
                      type="text"
                      value={item.assignee}
                      onChange={(e) =>
                        handleActionItemChange(
                          index,
                          "assignee",
                          e.target.value
                        )
                      }
                      className="w-full px-2 py-1 bg-zinc-900 border border-zinc-700 rounded text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 text-sm"
                      placeholder="Assignee name"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">
                      Status
                    </label>
                    <select
                      value={item.status}
                      onChange={(e) =>
                        handleActionItemChange(index, "status", e.target.value)
                      }
                      className="w-full px-2 py-1 bg-zinc-900 border border-zinc-700 rounded text-white focus:outline-none focus:border-blue-500 text-sm"
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">
                      Priority
                    </label>
                    <select
                      value={item.priority}
                      onChange={(e) =>
                        handleActionItemChange(
                          index,
                          "priority",
                          e.target.value
                        )
                      }
                      className="w-full px-2 py-1 bg-zinc-900 border border-zinc-700 rounded text-white focus:outline-none focus:border-blue-500 text-sm"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={item.due_date}
                      onChange={(e) =>
                        handleActionItemChange(
                          index,
                          "due_date",
                          e.target.value
                        )
                      }
                      className="px-2 py-1 bg-zinc-900 border border-zinc-700 rounded text-white focus:outline-none focus:border-blue-500 text-sm"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeActionItem(index)}
                    className="px-2 py-1 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded text-sm transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addActionItem}
              className="w-full py-2 border-2 border-dashed border-zinc-600 hover:border-zinc-500 rounded-lg text-zinc-400 hover:text-zinc-300 transition-colors"
            >
              + Add Action Item
            </button>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-zinc-400 hover:text-zinc-300 hover:bg-zinc-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !formData.title.trim()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            {loading ? "Creating..." : "Create Meeting Note"}
          </button>
        </div>
      </form>
    </div>
  );
}
