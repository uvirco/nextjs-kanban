"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  IconUsers,
  IconClock,
  IconBuilding,
  IconArrowLeft,
  IconChevronLeft,
  IconChevronRight,
} from "@tabler/icons-react";
import EpicContent from "./EpicContent.client";
import RaciMatrixSection from "./RaciMatrixSection";
import TeamMembers from "@/ui/TeamMembers/TeamMembers.client";
import EpicFilesSection from "./EpicFilesSection.client";
import EpicLinksSection from "./EpicLinksSection.client";
import EpicChecklistsSection from "./EpicChecklistsSection.client";
import EpicStakeholdersSection from "./EpicStakeholdersSection.client";
import EpicTaskboardSection from "./EpicTaskboardSection.client";
import GoalSection from "@/ui/GoalSection";
import EpicCommentsOverview from "@/ui/EpicCommentsOverview";
import EpicDetailsSidebar from "@/ui/EpicDetailsSidebar";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import EditMeetingNoteForm from "@/ui/EditMeetingNoteForm";

function EpicDetailPageClient({
  epic,
  raciUsers,
  params,
}: {
  epic: any;
  raciUsers: any[];
  params: { id: string };
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [editingNote, setEditingNote] = useState<any>(null);

  useEffect(() => {
    // Load sidebar preference from localStorage
    const saved = localStorage.getItem("epic-sidebar-collapsed");
    if (saved !== null) {
      setSidebarCollapsed(JSON.parse(saved));
    }
  }, []);

  const toggleSidebar = () => {
    const newState = !sidebarCollapsed;
    setSidebarCollapsed(newState);
    localStorage.setItem("epic-sidebar-collapsed", JSON.stringify(newState));
  };

  return (
    <>
      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-800">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/epics"
                className="flex items-center gap-2 text-zinc-400 hover:text-zinc-300 transition-colors"
              >
                <IconArrowLeft size={20} />
                <span>Back to Epics</span>
              </Link>
              <div className="h-6 w-px bg-zinc-700" />
              <h1 className="text-2xl font-bold text-white">{epic.title}</h1>
            </div>

            {/* Sidebar Toggle Button */}
            <button
              onClick={toggleSidebar}
              className="flex items-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors text-sm text-zinc-300 hover:text-white"
            >
              {sidebarCollapsed ? (
                <>
                  <IconChevronLeft size={16} />
                  <span>Show Details</span>
                </>
              ) : (
                <>
                  <IconChevronRight size={16} />
                  <span>Hide Details</span>
                </>
              )}
            </button>
          </div>

          {epic.description && (
            <p className="text-zinc-400 mt-2">{epic.description}</p>
          )}

          {/* Status and metrics row */}
          <div className="flex items-center gap-6 mt-4">
            {epic.column && (
              <span className="px-3 py-1 text-sm font-medium bg-indigo-900/30 text-indigo-400 rounded">
                {epic.column.title
                  .replace(/[\uD83C-\uDBFF\uDC00-\uDFFF]+/g, "")
                  .trim()}
              </span>
            )}
            {epic.priority && (
              <span
                className={`px-3 py-1 text-sm font-medium rounded ${
                  epic.priority.toLowerCase() === "critical"
                    ? "bg-red-900/30 text-red-400"
                    : epic.priority.toLowerCase() === "high"
                      ? "bg-orange-900/30 text-orange-400"
                      : epic.priority.toLowerCase() === "medium"
                        ? "bg-yellow-900/30 text-yellow-400"
                        : "bg-green-900/30 text-green-400"
                }`}
              >
                {epic.priority} Priority
              </span>
            )}
            {epic.riskLevel && (
              <span
                className={`px-3 py-1 text-sm font-medium rounded ${
                  epic.riskLevel.toLowerCase() === "high"
                    ? "bg-red-900/30 text-red-400"
                    : epic.riskLevel.toLowerCase() === "medium"
                      ? "bg-yellow-900/30 text-yellow-400"
                      : "bg-green-900/30 text-green-400"
                }`}
              >
                {epic.riskLevel} Risk
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Progress metrics */}
      <div className="bg-zinc-900 border-t border-b border-zinc-800 mb-6">
        <div className="grid grid-cols-12 gap-4 p-6">
          <div className="col-span-3 bg-zinc-800 p-5 rounded-lg">
            <div className="text-zinc-400 text-sm mb-1">Progress</div>
            <div className="text-2xl font-bold text-white">
              {epic.metrics.progress}%
            </div>
            <div className="w-full bg-zinc-700 rounded-full h-2 mt-3">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${epic.metrics.progress}%` }}
              />
            </div>
          </div>

          <div className="col-span-3 bg-zinc-800 p-5 rounded-lg">
            <div className="text-zinc-400 text-sm mb-1">Readiness</div>
            <div className="text-2xl font-bold text-white">
              {epic.readinessScore || 0}%
            </div>
            <div className="w-full bg-zinc-700 rounded-full h-2 mt-3">
              <div
                className={`h-2 rounded-full ${(epic.readinessScore || 0) >= 80 ? "bg-green-600" : (epic.readinessScore || 0) >= 50 ? "bg-yellow-600" : "bg-red-600"}`}
                style={{ width: `${epic.readinessScore || 0}%` }}
              />
            </div>
          </div>

          <div className="col-span-2 bg-zinc-800 p-5 rounded-lg">
            <div className="text-zinc-400 text-sm mb-1">Total Tasks</div>
            <div className="text-2xl font-bold text-white">
              {epic.metrics.totalTasks}
            </div>
          </div>

          <div className="col-span-2 bg-zinc-800 p-5 rounded-lg">
            <div className="text-zinc-400 text-sm mb-1">Completed</div>
            <div className="text-2xl font-bold text-green-400">
              {epic.metrics.completedTasks}
            </div>
          </div>

          <div className="col-span-2 bg-zinc-800 p-5 rounded-lg">
            <div className="text-zinc-400 text-sm mb-1">In Progress</div>
            <div className="text-2xl font-bold text-blue-400">
              {epic.metrics.inProgressTasks}
            </div>
          </div>
        </div>

        {/* Owner / Due / Department row */}
        <div className="flex items-center gap-6 px-6 pb-4 text-zinc-400">
          {epic.owner && (
            <div className="flex items-center gap-2">
              <IconUsers size={18} />
              <span>Owner: {epic.owner.name}</span>
            </div>
          )}
          {epic.dueDate && (
            <div className="flex items-center gap-2">
              <IconClock size={18} />
              <span>Due: {new Date(epic.dueDate).toLocaleDateString()}</span>
            </div>
          )}
          {epic.department && (
            <div className="flex items-center gap-2">
              <IconBuilding size={18} />
              <span>Department: {epic.department.name}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="overflow-hidden">
        <div className="grid grid-cols-12 gap-4 px-6">
          {/* Main Content */}
          <div
            className={`${sidebarCollapsed ? "col-span-12" : "col-span-9"} transition-all duration-300`}
          >
            {/* Task Flow Timeline - Full Width - Moved to top */}
            <div className="w-full mb-6">
              <EpicContent epic={epic} raciUsers={raciUsers} params={params} />
            </div>

            {/* Checklists section above RACI matrix */}
            <div className="mb-6">
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                <EpicChecklistsSection epic={epic} params={params} />
              </div>
            </div>
            {/* Taskboard section between Checklists and RACI */}
            <div className="mb-6">
              <EpicTaskboardSection epic={epic} params={params} />
            </div>
            {/* Center 3/4 - RACI matrix */}
            <div className="w-full h-full mb-6">
              <RaciMatrixSection
                raciUsers={raciUsers}
                storageKey={`epic:${epic.id}:section:raci:fullbleed`}
                defaultCollapsed={true}
              />
            </div>
          </div>

          {/* Sidebar */}
          {!sidebarCollapsed && (
            <div className="col-span-3 transition-all duration-300">
              {/* Team members widget (client) */}
              <div className="w-full">
                <TeamMembers epicId={epic.id} />
              </div>
              {/* Goals section below team members */}
              <div className="mt-6">
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                  <GoalSection
                    taskId={epic.id}
                    boardId={epic.column?.boardId || ""}
                  />
                </div>
              </div>
              {/* Stakeholders section below goals */}
              <div className="mt-6">
                <EpicStakeholdersSection epic={epic} params={params} />
              </div>
              {/* Epic Details sidebar below stakeholders */}
              <div className="mt-6">
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                  <EpicDetailsSidebar epic={epic} />
                </div>
              </div>
              {/* Files and Links sections below epic details */}
              <div className="mt-6 space-y-6">
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                  <EpicFilesSection epic={epic} params={params} />
                </div>
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                  <EpicLinksSection epic={epic} params={params} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Meeting Notes Section */}
      <div className="w-full px-6 mb-6">
        <Accordion type="single" collapsible>
          <AccordionItem value="meeting-notes">
            <AccordionTrigger className="text-xl font-semibold px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg hover:bg-zinc-800 transition-colors">
              Meeting Notes ({epic.meetingNotes?.length || 0})
            </AccordionTrigger>
            <AccordionContent className="px-4 py-4 bg-zinc-900 border border-zinc-800 rounded-lg mt-2">
              <div className="space-y-4">
                {epic.meetingNotes?.map((note: any) => (
                  <div key={note.id} className="border border-zinc-700 rounded-lg p-4 bg-zinc-800">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium text-white">{note.title}</h3>
                        <p className="text-sm text-zinc-400">
                          {note.meeting_type} • {new Date(note.meeting_date).toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        onClick={() => setEditingNote(note)}
                        size="sm"
                        variant="outline"
                        className="text-zinc-300 border-zinc-600 hover:bg-zinc-700"
                      >
                        Edit
                      </Button>
                    </div>
                    <div className="text-sm text-zinc-300 line-clamp-3">
                      {note.notes ? (
                        <div dangerouslySetInnerHTML={{ __html: note.notes }} />
                      ) : (
                        <span className="text-zinc-500">No notes content</span>
                      )}
                    </div>
                  </div>
                ))}
                {(!epic.meetingNotes || epic.meetingNotes.length === 0) && (
                  <p className="text-zinc-500 text-center py-4">No meeting notes yet</p>
                )}
                <Button
                  onClick={() => setEditingNote({})}
                  className="w-full bg-zinc-700 hover:bg-zinc-600"
                >
                  Add Meeting Note
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Comments Overview Section */}
      <div className="w-full px-6">
        <EpicCommentsOverview epicId={epic.id} />
      </div>

      {/* Edit Meeting Note Modal */}
      {editingNote && (
        <EditMeetingNoteForm
          meetingNote={editingNote}
          epicId={epic.id}
          onCancel={() => setEditingNote(null)}
          onSuccess={() => {
            setEditingNote(null);
            // Trigger page refresh to show updated notes
            window.location.reload();
          }}
        />
      )}
    </>
  );
}

export default EpicDetailPageClient;
