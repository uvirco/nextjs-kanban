"use client";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useSearchParams, useRouter } from "next/navigation";
import {
  IconUsers,
  IconClock,
  IconBuilding,
  IconArrowLeft,
  IconSettings,
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
import { Button } from "@/components/ui/button";
import EditMeetingNoteForm from "@/ui/EditMeetingNoteForm";
import EditEpicForm from "./edit/EditEpicForm";
import EditOverviewForm from "./EditOverviewForm";
import ManageMembersModal from "./ManageMembersModal";
import EditTasksForm from "./edit/EditTasksForm";
import QuickNotesTab from "./QuickNotesTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function EpicDetailPageClient({
  epic,
  raciUsers,
  params,
}: {
  epic: any;
  raciUsers: any[];
  params: { id: string };
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const storageKey = `epic-${params.id}-active-tab`;
  const [activeTab, setActiveTab] = useState('overview');
  const [editingNote, setEditingNote] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingOverview, setEditingOverview] = useState(false);
  const [editingTasks, setEditingTasks] = useState(false);
  const [departments, setDepartments] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [meetingNotesSearch, setMeetingNotesSearch] = useState("");
  const [quickNotesSearch, setQuickNotesSearch] = useState("");
  const [showMemberModal, setShowMemberModal] = useState(false);

  // Load last active tab from localStorage on mount
  useEffect(() => {
    console.log('Component mounted, params.id:', params.id);
    console.log('Storage key:', storageKey);
    const tabFromUrl = searchParams.get('tab');
    const savedTab = localStorage.getItem(storageKey);
    console.log('Tab from URL:', tabFromUrl);
    console.log('Saved tab:', savedTab);
    
    if (tabFromUrl) {
      setActiveTab(tabFromUrl);
      localStorage.setItem(storageKey, tabFromUrl);
    } else if (savedTab) {
      setActiveTab(savedTab);
    }
  }, [storageKey, searchParams]);

  // Save tab to localStorage when it changes
  const handleTabChange = (value: string) => {
    console.log('Tab changed to:', value);
    console.log('Storage key:', storageKey);
    setActiveTab(value);
    localStorage.setItem(storageKey, value);
    console.log('Saved to localStorage:', localStorage.getItem(storageKey));
  };

  console.log('Rendering with activeTab:', activeTab);

  // Fetch departments and goals for the edit form
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch departments
        const deptResponse = await fetch("/api/departments");
        if (deptResponse.ok) {
          const deptData = await deptResponse.json();
          setDepartments(deptData);
        }

        // Fetch goals
        const goalsResponse = await fetch(`/api/tasks/${epic.id}/goals`);
        if (goalsResponse.ok) {
          const goalsData = await goalsResponse.json();
          setGoals(goalsData);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };
    fetchData();
  }, [epic.id]);

  return (
    <>
      {/* Simplified Header - Just Title */}
      <div className="bg-zinc-900 border-b border-zinc-800">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/projects/epics"
                className="flex items-center gap-2 text-zinc-400 hover:text-zinc-300 transition-colors"
              >
                <IconArrowLeft size={20} />
                <span>Back to Epics</span>
              </Link>
              <div className="h-6 w-px bg-zinc-700" />
              <h1 className="text-2xl font-bold text-white">{epic.title}</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content with Tabs */}
      <div className="overflow-hidden">
        <div className="px-6">
          {/* Main Content */}
          <div className="w-full">
            <Suspense fallback={<div className="flex items-center justify-center p-8"><div className="text-zinc-400">Loading...</div></div>}>
              <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full" id={`epic-tabs-${epic.id}`}>
              <TabsList className="grid w-full grid-cols-9 mb-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="taskboard">Taskboard</TabsTrigger>
                <TabsTrigger value="tasks">Tasks</TabsTrigger>
                <TabsTrigger value="checklists">Checklists</TabsTrigger>
                <TabsTrigger value="meeting-notes">Meeting Notes</TabsTrigger>
                <TabsTrigger value="quick-notes">Quick Notes</TabsTrigger>
                <TabsTrigger value="links">Links & Files</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
                <TabsTrigger value="raci">RACI</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Overview Tab Header with Title, Member Avatars, and Edit Buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-bold text-white">Epic Overview</h2>
                    {/* Member Avatars and Add Button */}
                    <div className="flex items-center gap-1">
                      {epic.members && epic.members.length > 0 && (
                        <div className="flex -space-x-2">
                          {epic.members.slice(0, 5).map((member: any) => (
                            <div
                              key={member.id}
                              className="w-8 h-8 rounded-full bg-zinc-600 border-2 border-zinc-800 flex items-center justify-center text-xs font-medium text-white"
                              title={`${member.user.name || member.user.email} (${member.role})`}
                            >
                              {member.user.image ? (
                                <img
                                  src={member.user.image}
                                  alt={member.user.name || member.user.email}
                                  className="w-full h-full rounded-full object-cover"
                                />
                              ) : (
                                (member.user.name || member.user.email || "?")[0].toUpperCase()
                              )}
                            </div>
                          ))}
                          {epic.members.length > 5 && (
                            <div className="w-8 h-8 rounded-full bg-zinc-700 border-2 border-zinc-800 flex items-center justify-center text-xs font-medium text-zinc-300">
                              +{epic.members.length - 5}
                            </div>
                          )}
                        </div>
                      )}
                      <Button
                        onClick={() => setShowMemberModal(true)}
                        variant="ghost"
                        size="sm"
                        className="text-zinc-400 hover:text-zinc-300 hover:bg-zinc-800 ml-2"
                      >
                        <IconUsers size={14} />
                      </Button>
                    </div>
                  </div>
                  {!editingOverview && (
                    <div className="flex gap-2">
                      <Button
                        onClick={() => setEditingOverview(true)}
                        variant="outline"
                        className="text-zinc-300 border-zinc-600 hover:bg-zinc-700"
                      >
                        <IconSettings size={16} className="mr-2" />
                        Edit Details
                      </Button>
                      <Button
                        onClick={() => setShowEditModal(true)}
                        variant="outline"
                        className="text-zinc-300 border-zinc-600 hover:bg-zinc-700"
                      >
                        <IconSettings size={16} className="mr-2" />
                        Edit Epic
                      </Button>
                    </div>
                  )}
                </div>

                {editingOverview ? (
                  /* Edit Mode */
                  <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Edit Epic Details</h3>
                    <EditOverviewForm
                      epic={epic}
                      departments={departments}
                      stakeholders={epic.stakeholders || []}
                      onSave={(updatedData) => {
                        // Update local epic data and exit edit mode
                        Object.assign(epic, updatedData);
                        if (updatedData.goals) {
                          setGoals(updatedData.goals);
                        }
                        setEditingOverview(false);
                        // Optionally refresh the page or update parent state
                        window.location.reload();
                      }}
                      onCancel={() => setEditingOverview(false)}
                    />
                  </div>
                ) : (
                  /* Display Mode */
                  <>
                    {/* Epic Description */}
                    {epic.description && (
                      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-white mb-2">Description</h3>
                        <p className="text-zinc-400">{epic.description}</p>
                      </div>
                    )}

                    {/* Status and Priority Badges */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-white mb-4">Status & Priority</h3>
                      <div className="flex items-center gap-4 flex-wrap">
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

                    {/* Progress Metrics */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-white mb-4">Progress Overview</h3>
                      <div className="grid grid-cols-12 gap-4">
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
                    </div>

                    {/* Additional Info */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-white mb-4">Details</h3>
                      <div className="flex items-center gap-6 text-zinc-400">
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

                    {/* Goals section (editable) */}
                    <GoalSection
                      taskId={epic.id}
                      boardId={epic.column?.boardId || ""}
                    />

                    {/* Stakeholders section */}
                    <EpicStakeholdersSection epic={epic} params={params} />
                  </>
                )}
              </TabsContent>

              <TabsContent value="tasks" className="space-y-6">
                {/* Tasks Tab Header with Edit Button */}
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white">Tasks</h2>
                  {!editingTasks && (
                    <Button
                      onClick={() => setEditingTasks(true)}
                      variant="outline"
                      className="text-zinc-300 border-zinc-600 hover:bg-zinc-700"
                    >
                      <IconSettings size={16} className="mr-2" />
                      Configure Tasks
                    </Button>
                  )}
                </div>

                {editingTasks ? (
                  /* Edit Mode */
                  <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Task Configuration</h3>
                    <EditTasksForm
                      epic={epic}
                      onSave={(updatedData) => {
                        Object.assign(epic, updatedData);
                        setEditingTasks(false);
                        window.location.reload();
                      }}
                      onCancel={() => setEditingTasks(false)}
                    />
                  </div>
                ) : (
                  /* Display Mode */
                  <div className="w-full">
                    <EpicContent epic={epic} raciUsers={raciUsers} params={params} />
                  </div>
                )}
              </TabsContent>

              <TabsContent value="checklists" className="space-y-6">
                {/* Checklists section */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                  <EpicChecklistsSection epic={epic} params={params} />
                </div>
              </TabsContent>

              <TabsContent value="taskboard" className="space-y-6">
                {/* Taskboard section */}
                <EpicTaskboardSection epic={epic} params={params} />
              </TabsContent>

              <TabsContent value="raci" className="space-y-6">
                {/* RACI matrix */}
                <div className="w-full">
                  <RaciMatrixSection
                    raciUsers={raciUsers}
                  />
                </div>
              </TabsContent>

              <TabsContent value="meeting-notes" className="space-y-4">
                <div className="space-y-4">
                  {/* Search Bar */}
                  <div className="flex items-center gap-4">
                    <input
                      type="text"
                      placeholder="Search meeting notes..."
                      value={meetingNotesSearch}
                      onChange={(e) => setMeetingNotesSearch(e.target.value)}
                      className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  {epic.meetingNotes?.filter((note: any) => 
                    meetingNotesSearch === "" || 
                    note.title.toLowerCase().includes(meetingNotesSearch.toLowerCase()) ||
                    (note.notes && note.notes.toLowerCase().includes(meetingNotesSearch.toLowerCase()))
                  ).map((note: any) => (
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
                  {epic.meetingNotes && epic.meetingNotes.length > 0 && epic.meetingNotes.filter((note: any) => 
                    meetingNotesSearch === "" || 
                    note.title.toLowerCase().includes(meetingNotesSearch.toLowerCase()) ||
                    (note.notes && note.notes.toLowerCase().includes(meetingNotesSearch.toLowerCase()))
                  ).length === 0 && meetingNotesSearch !== "" && (
                    <p className="text-zinc-500 text-center py-4">No meeting notes match your search</p>
                  )}
                  <Button
                    onClick={() => setEditingNote({})}
                    className="w-full bg-zinc-700 hover:bg-zinc-600"
                  >
                    Add Meeting Note
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="quick-notes" className="space-y-6">
                {/* Search Bar */}
                <div className="flex items-center gap-4">
                  <input
                    type="text"
                    placeholder="Search quick notes..."
                    value={quickNotesSearch}
                    onChange={(e) => setQuickNotesSearch(e.target.value)}
                    className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <QuickNotesTab epic={epic} searchTerm={quickNotesSearch} onSave={(updatedEpic) => {
                  // Handle save - you might need to refresh or update state
                  window.location.reload(); // Simple refresh for now
                }} />
              </TabsContent>

              <TabsContent value="links" className="space-y-6">
                {/* Files section */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                  <EpicFilesSection epic={epic} params={params} />
                </div>

                {/* Links section */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                  <EpicLinksSection epic={epic} params={params} />
                </div>
              </TabsContent>



              <TabsContent value="activity">
                <EpicCommentsOverview epicId={epic.id} />
              </TabsContent>
            </Tabs>
            </Suspense>
          </div>
        </div>
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

      {/* Edit Epic Modal */}
      {showEditModal && (
        <EditEpicForm
          epic={epic}
        />
      )}

      {/* Manage Members Modal */}
      {showMemberModal && (
        <ManageMembersModal
          epicId={epic.id}
          currentMembers={epic.members || []}
          onClose={() => setShowMemberModal(false)}
          onSave={(updatedMembers) => {
            // Update epic members and close modal
            epic.members = updatedMembers;
            setShowMemberModal(false);
            // Optionally refresh the page or update parent state
            window.location.reload();
          }}
        />
      )}
    </>
  );
}

export default EpicDetailPageClient;
