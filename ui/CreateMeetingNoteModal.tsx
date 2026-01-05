"use client";

import React, { useState, useEffect } from "react";
import { IconX, IconCalendar, IconUsers } from "@tabler/icons-react";
import RichTextEditor from "./RichTextEditor";

interface CreateMeetingNoteModalProps {
  epics: Array<{ id: string; title: string }>;
  onClose: () => void;
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

export default function CreateMeetingNoteModal({
  epics,
  onClose,
  onSuccess,
}: CreateMeetingNoteModalProps) {
  const [localEpics, setLocalEpics] = useState(epics);
  const [epicsLoading, setEpicsLoading] = useState(false);
  const [epicMembers, setEpicMembers] = useState<
    Array<{ id: string; name: string; email: string }>
  >([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    meetingType: "other",
    meetingDate: new Date().toISOString().split("T")[0],
    attendees: [] as string[],
    agenda: "",
    notes: "",
    decisions: "",
    epicId: "",
    actionItems: [] as Array<{
      description: string;
      assignee: string;
      status: string;
      priority: string;
      due_date: string;
    }>,
  });
  const [loading, setLoading] = useState(false);

  // Fetch epics if not provided
  useEffect(() => {
    if (epics.length > 0) {
      setLocalEpics(epics);
    } else {
      fetchEpics();
    }
  }, [epics]);

  // Fetch epic members when epic is selected
  useEffect(() => {
    if (formData.epicId) {
      fetchEpicMembers(formData.epicId);
    } else {
      setEpicMembers([]);
    }
  }, [formData.epicId]);

  const fetchEpics = async () => {
    setEpicsLoading(true);
    try {
      console.log("CreateMeetingNoteModal: Fetching epics...");
      const response = await fetch("/api/epics");
      console.log(
        "CreateMeetingNoteModal: Epics response status:",
        response.status
      );
      if (response.ok) {
        const data = await response.json();
        console.log("CreateMeetingNoteModal: Fetched epics:", data);
        setLocalEpics(data);
      } else {
        const errorData = await response.json();
        console.error(
          "CreateMeetingNoteModal: Failed to fetch epics:",
          errorData
        );
      }
    } catch (error) {
      console.error("CreateMeetingNoteModal: Failed to fetch epics:", error);
    } finally {
      setEpicsLoading(false);
    }
  };

  const fetchEpicMembers = async (epicId: string) => {
    setMembersLoading(true);
    try {
      const response = await fetch(`/api/epics/${epicId}/members`);
      if (response.ok) {
        const data = await response.json();
        const members = data.map((m: any) => ({
          id: m.user.id,
          name: m.user.name,
          email: m.user.email,
        }));
        setEpicMembers(members);
      }
    } catch (error) {
      console.error("Failed to fetch epic members:", error);
    } finally {
      setMembersLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        `/api/epics/${formData.epicId}/meeting-notes`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...formData,
            attendees: formData.attendees,
            meetingDate: new Date(formData.meetingDate).toISOString(),
          }),
        }
      );

      if (response.ok) {
        const newMeetingNote = await response.json();
        onSuccess(newMeetingNote);
        onClose();
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

  const handleChange = (field: string, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleAttendee = (userId: string) => {
    setFormData((prev) => ({
      ...prev,
      attendees: prev.attendees.includes(userId)
        ? prev.attendees.filter((id) => id !== userId)
        : [...prev.attendees, userId],
    }));
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-zinc-800 border border-zinc-700 rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-zinc-700">
          <h2 className="text-xl font-semibold text-white">
            Create Meeting Note
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-300 hover:bg-zinc-700 rounded transition-colors"
          >
            <IconX size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Epic Selection */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Select Epic *
            </label>
            <select
              value={formData.epicId}
              onChange={(e) => handleChange("epicId", e.target.value)}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              required
              disabled={epicsLoading}
            >
              <option value="">
                {epicsLoading ? "Loading epics..." : "Choose an epic..."}
              </option>
              {localEpics.map((epic) => (
                <option key={epic.id} value={epic.id}>
                  {epic.title}
                </option>
              ))}
            </select>
          </div>

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
              {membersLoading ? (
                <div className="text-sm text-zinc-400">Loading members...</div>
              ) : epicMembers.length > 0 ? (
                <div className="space-y-2 max-h-40 overflow-y-auto p-3 bg-zinc-900 border border-zinc-700 rounded-lg">
                  {epicMembers.map((member) => (
                    <label
                      key={member.id}
                      className="flex items-center gap-2 cursor-pointer hover:bg-zinc-800 p-1 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={formData.attendees.includes(member.id)}
                        onChange={() => toggleAttendee(member.id)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-white">{member.name}</span>
                      <span className="text-xs text-zinc-500">
                        ({member.email})
                      </span>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-zinc-400 p-3 bg-zinc-900 border border-zinc-700 rounded-lg">
                  {formData.epicId
                    ? "No members found for this epic"
                    : "Select an epic first"}
                </div>
              )}
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
                  className="flex gap-3 items-start p-3 bg-zinc-900 rounded-lg"
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
                        className="w-full px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 text-sm"
                        placeholder="Action item description"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-zinc-400 mb-1">
                        Assignee
                      </label>
                      <select
                        value={item.assignee}
                        onChange={(e) =>
                          handleActionItemChange(
                            index,
                            "assignee",
                            e.target.value
                          )
                        }
                        className="w-full px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-white focus:outline-none focus:border-blue-500 text-sm"
                      >
                        <option value="">Select assignee...</option>
                        {epicMembers.map((member) => (
                          <option key={member.id} value={member.id}>
                            {member.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-zinc-400 mb-1">
                        Status
                      </label>
                      <select
                        value={item.status}
                        onChange={(e) =>
                          handleActionItemChange(
                            index,
                            "status",
                            e.target.value
                          )
                        }
                        className="w-full px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-white focus:outline-none focus:border-blue-500 text-sm"
                      >
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
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
                        className="w-full px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-white focus:outline-none focus:border-blue-500 text-sm"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeActionItem(index)}
                    className="p-1 text-zinc-400 hover:text-red-400 transition-colors"
                  >
                    <IconX size={16} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addActionItem}
                className="px-3 py-2 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 rounded-lg transition-colors text-sm"
              >
                + Add Action Item
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-zinc-400 hover:text-zinc-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:opacity-50 text-white rounded-lg transition-colors"
            >
              {loading ? "Creating..." : "Create Meeting Note"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
