import { supabaseAdmin } from "@/lib/supabase";
import Link from "next/link";
import { IconUsers, IconClock, IconBuilding } from "@tabler/icons-react";
import { notFound } from "next/navigation";
import EpicContent from "./EpicContent.client";
import RaciMatrixSection from "./RaciMatrixSection";
import TeamMembers from "@/ui/TeamMembers/TeamMembers.client";
import EpicFilesSection from "./EpicFilesSection.client";

async function getEpicDetails(epicId: string) {
  const supabase = supabaseAdmin;

  // Fetch epic
  const { data: epic, error: epicError } = await supabase
    .from("Task")
    .select("*, department:Department(id, name, description)")
    .eq("id", epicId)
    .single();

  if (epicError || !epic) {
    return null;
  }

  // Fetch owner
  const { data: owner } = await supabase
    .from("User")
    .select("id, name, email")
    .eq("id", epic.userId)
    .single();

  // Fetch RACI assignments
  const { data: raciAssignments } = await supabase
    .from("RACIMatrix")
    .select("*, user:User(id, name, email)")
    .eq("epicId", epicId);

  // Fetch epic members
  const { data: members } = await supabase
    .from("EpicMember")
    .select("*, user:User(id, name, email)")
    .eq("epicId", epicId);

  // Fetch stakeholders
  const { data: stakeholders } = await supabase
    .from("Stakeholder")
    .select("*, user:User(id, name, email)")
    .eq("taskId", epicId);

  // Fetch subtasks (tasks that belong to this epic)
  const { data: subtasks } = await supabase
    .from("Task")
    .select(
      `
      *,
      assignedUser:User(id, name, email),
      column:Column(id, title)
    `
    )
    .eq("epicId", epicId);

  // Fetch checklists for the epic
  const { data: checklists } = await supabase
    .from("Checklist")
    .select(
      `
      *,
      items:ChecklistItem(*)
    `
    )
    .eq("taskId", epicId);

  // Calculate metrics
  const totalTasks = subtasks?.length || 0;
  const completedTasks =
    subtasks?.filter(
      (t: any) =>
        t.status === "DONE" ||
        t.column?.title?.toLowerCase().includes("done") ||
        t.column?.title?.toLowerCase().includes("complete")
    ).length || 0;
  const blockedTasks =
    subtasks?.filter(
      (t: any) =>
        t.isBlocked || t.column?.title?.toLowerCase().includes("blocked")
    ).length || 0;
  const progress =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Fetch attachments for this epic (attachments stored in Attachment table via taskId)
  const { data: attachments } = await supabase
    .from("Attachment")
    .select("*")
    .eq("taskId", epicId);

  return {
    ...epic,
    owner,
    raciAssignments: raciAssignments || [],
    members: members || [],
    stakeholders: stakeholders || [],
    subtasks: subtasks || [],
    checklists: checklists || [],
    metrics: { totalTasks, completedTasks, blockedTasks, progress },
    attachments: attachments || [],
  };
}

export default async function EpicDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const epic = await getEpicDetails(params.id);

  if (!epic) {
    notFound();
  }

  // RACI will be rendered in the client component via raciUsers (see EpicContent)

  // Get unique users with RACI assignments
  const raciUsers = Array.from(
    new Set(epic.raciAssignments.map((r: any) => r.userId))
  ).map((userId) => {
    const user = epic.raciAssignments.find(
      (r: any) => r.userId === userId
    )?.user;
    const userRoles = epic.raciAssignments
      .filter((r: any) => r.userId === userId)
      .map((r: any) => r.role);
    return { ...user, roles: userRoles };
  });

  return (
    <div className="min-h-screen bg-zinc-950 p-6">
      <div className="w-full">
        {/* Full-width header that spans the page; inner content is full-width with padded edges */}
        <div className="w-full bg-zinc-900 border-t border-b border-zinc-800 mb-6">
          <div className="max-w-7xl mx-auto px-6 py-8 min-h-[36vh]">
            {/* Dashboard header layout: large grid for title + wide metrics and actions */}
            <div className="grid grid-cols-12 gap-6 items-start">
              <div className="col-span-7">
                <h1 className="text-4xl font-bold text-white mb-3">
                  {epic.title}
                </h1>
                {epic.description && (
                  <p className="text-zinc-400 max-w-3xl">{epic.description}</p>
                )}
                {epic.column?.title === "📋 Backlog" && (
                  <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-blue-900/30 text-blue-400 text-sm rounded">
                    📋 In Planning Phase
                  </div>
                )}
              </div>

              <div className="col-span-5 flex items-start justify-end gap-4">
                {/* top-right spacer: (currently unused) */}

                <div className="flex gap-2 items-center">
                  <Link
                    href={`/epics/${epic.id}/edit`}
                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors"
                  >
                    Edit
                  </Link>
                  {epic.businessValue && (
                    <span className="px-3 py-1 text-sm font-medium bg-blue-900/30 text-blue-400 rounded">
                      {epic.businessValue} Value
                    </span>
                  )}
                  {epic.riskLevel && (
                    <span
                      className={`px-3 py-1 text-sm font-medium rounded ${
                        epic.riskLevel.toUpperCase() === "HIGH"
                          ? "bg-red-900/30 text-red-400"
                          : epic.riskLevel.toUpperCase() === "MEDIUM"
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

            {/* Dashboard metrics — spread full width */}
            <div className="grid grid-cols-12 gap-4 mt-6">
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
                <div className="text-zinc-400 text-sm mb-1">Blocked</div>
                <div className="text-2xl font-bold text-red-400">
                  {epic.metrics.blockedTasks}
                </div>
              </div>
            </div>

            {/* Owner / Due / Department row */}
            <div className="flex items-center gap-6 mt-4 text-zinc-400">
              {epic.owner && (
                <div className="flex items-center gap-2">
                  <IconUsers size={18} />
                  <span>Owner: {epic.owner.name}</span>
                </div>
              )}
              {epic.dueDate && (
                <div className="flex items-center gap-2">
                  <IconClock size={18} />
                  <span>
                    Due: {new Date(epic.dueDate).toLocaleDateString()}
                  </span>
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
        </div>

        {/* full-bleed visual debug row (edge-to-edge) */}
        <div className="w-full mb-6">
          <div className="grid grid-cols-12 gap-4 px-6">
            <div className="col-span-3 bg-red-600/30 border border-red-600 rounded-lg p-6 text-sm text-red-300">
              <EpicFilesSection epic={epic} params={params} />
            </div>
            <div className="col-span-6 bg-green-600/30 border border-green-600 rounded-lg p-6 text-sm text-green-300">
              {/* Center 1/2 - RACI matrix */}
              <div className="w-full h-full">
                <RaciMatrixSection
                  raciUsers={raciUsers}
                  storageKey={`epic:${epic.id}:section:raci:fullbleed`}
                  defaultCollapsed={true}
                />
              </div>
            </div>
            <div className="col-span-3 bg-blue-600/30 border border-blue-600 rounded-lg p-6 text-sm text-blue-300">
              {/* Right 1/4 - Team members widget (client) */}
              <div className="w-full h-full">
                <TeamMembers epicId={epic.id} />
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto">
          <EpicContent epic={epic} raciUsers={raciUsers} params={params} />
        </div>
      </div>
    </div>
  );
}
