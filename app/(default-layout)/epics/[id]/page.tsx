import { supabaseAdmin } from "@/lib/supabase";
import Link from "next/link";
import {
  IconArrowLeft,
  IconUsers,
  IconAlertTriangle,
  IconClock,
} from "@tabler/icons-react";
import { notFound } from "next/navigation";
import EpicTeamMembers from "./EpicTeamMembers";

async function getEpicDetails(epicId: string) {
  const supabase = supabaseAdmin;

  // Fetch epic
  const { data: epic, error: epicError } = await supabase
    .from("Task")
    .select("*")
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

  // Fetch subtasks
  const { data: subtasks } = await supabase
    .from("Task")
    .select("*, assignedUser:User(id, name, email), column:Column(title)")
    .eq("parentTaskId", epicId)
    .order("orderIndex");

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

  return {
    ...epic,
    owner,
    raciAssignments: raciAssignments || [],
    members: members || [],
    stakeholders: stakeholders || [],
    subtasks: subtasks || [],
    metrics: { totalTasks, completedTasks, blockedTasks, progress },
  };
}

export default async function EpicDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const epic = await getEpicDetails(params.id);

  if (!epic) {
    notFound();
  }

  const raciByRole = {
    RESPONSIBLE: epic.raciAssignments.filter(
      (r: any) => r.role === "RESPONSIBLE"
    ),
    ACCOUNTABLE: epic.raciAssignments.filter(
      (r: any) => r.role === "ACCOUNTABLE"
    ),
    CONSULTED: epic.raciAssignments.filter((r: any) => r.role === "CONSULTED"),
    INFORMED: epic.raciAssignments.filter((r: any) => r.role === "INFORMED"),
  };

  // Get unique users with RACI assignments
  const raciUsers = Array.from(
    new Set(epic.raciAssignments.map((r: any) => r.userId))
  ).map((userId) => {
    const user = epic.raciAssignments.find((r: any) => r.userId === userId)?.user;
    const userRoles = epic.raciAssignments
      .filter((r: any) => r.userId === userId)
      .map((r: any) => r.role);
    return { ...user, roles: userRoles };
  });

  return (
    <div className="min-h-screen bg-zinc-950 p-6">
      <div className="max-w-7xl mx-auto">
        <Link
          href="/epics"
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-6"
        >
          <IconArrowLeft size={20} />
          Back to Epic Portfolio
        </Link>

        {/* Header */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white mb-2">
                {epic.title}
              </h1>
              {epic.description && (
                <p className="text-zinc-400">{epic.description}</p>
              )}
              {epic.column?.title === "📋 Backlog" && (
                <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-blue-900/30 text-blue-400 text-sm rounded">
                  📋 In Planning Phase
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Link
                href={`/epics/${epic.id}/edit`}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors"
              >
                Edit Epic
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

          {/* Metrics */}
          <div className="grid grid-cols-4 gap-4 mt-6">
            <div className="bg-zinc-800 p-4 rounded-lg">
              <div className="text-zinc-400 text-sm mb-1">Progress</div>
              <div className="text-2xl font-bold text-white">
                {epic.metrics.progress}%
              </div>
              <div className="w-full bg-zinc-700 rounded-full h-2 mt-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${epic.metrics.progress}%` }}
                ></div>
              </div>
            </div>
            <div className="bg-zinc-800 p-4 rounded-lg">
              <div className="text-zinc-400 text-sm mb-1">Total Tasks</div>
              <div className="text-2xl font-bold text-white">
                {epic.metrics.totalTasks}
              </div>
            </div>
            <div className="bg-zinc-800 p-4 rounded-lg">
              <div className="text-zinc-400 text-sm mb-1">Completed</div>
              <div className="text-2xl font-bold text-green-400">
                {epic.metrics.completedTasks}
              </div>
            </div>
            <div className="bg-zinc-800 p-4 rounded-lg">
              <div className="text-zinc-400 text-sm mb-1">Blocked</div>
              <div className="text-2xl font-bold text-red-400">
                {epic.metrics.blockedTasks}
              </div>
            </div>
          </div>

          {/* Owner and Due Date */}
          <div className="flex items-center gap-6 mt-6 text-zinc-400">
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
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* RACI Matrix */}
          <div className="col-span-2">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4">
                🎯 RACI Matrix
              </h2>

              {raciUsers.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-700">
                        <th className="text-left py-3 px-4 text-zinc-300 font-semibold">
                          Team Member
                        </th>
                        <th className="text-center py-3 px-4 text-zinc-300 font-semibold">
                          <div className="flex flex-col items-center">
                            <span className="text-red-400 font-bold">R</span>
                            <span className="text-xs text-zinc-500">Responsible</span>
                          </div>
                        </th>
                        <th className="text-center py-3 px-4 text-zinc-300 font-semibold">
                          <div className="flex flex-col items-center">
                            <span className="text-orange-400 font-bold">A</span>
                            <span className="text-xs text-zinc-500">Accountable</span>
                          </div>
                        </th>
                        <th className="text-center py-3 px-4 text-zinc-300 font-semibold">
                          <div className="flex flex-col items-center">
                            <span className="text-blue-400 font-bold">C</span>
                            <span className="text-xs text-zinc-500">Consulted</span>
                          </div>
                        </th>
                        <th className="text-center py-3 px-4 text-zinc-300 font-semibold">
                          <div className="flex flex-col items-center">
                            <span className="text-green-400 font-bold">I</span>
                            <span className="text-xs text-zinc-500">Informed</span>
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {raciUsers.map((user) => (
                        <tr key={user.id} className="border-b border-zinc-800 hover:bg-zinc-800/50">
                          <td className="py-3 px-4 text-white font-medium">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-zinc-700 rounded-full flex items-center justify-center text-xs">
                                {(user.name || user.email || "?")[0].toUpperCase()}
                              </div>
                              <div>
                                <div className="font-medium">{user.name || user.email}</div>
                                <div className="text-xs text-zinc-500">
                                  {epic.members?.find((m: any) => m.userId === user.id)?.role || "Team Member"}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="text-center py-3 px-4">
                            {user.roles.includes("RESPONSIBLE") ? (
                              <span className="inline-flex items-center justify-center w-8 h-8 bg-red-500/20 text-red-400 rounded font-bold text-sm">
                                ✓
                              </span>
                            ) : (
                              <span className="inline-flex items-center justify-center w-8 h-8 bg-zinc-800 text-zinc-600 rounded text-sm">
                                ―
                              </span>
                            )}
                          </td>
                          <td className="text-center py-3 px-4">
                            {user.roles.includes("ACCOUNTABLE") ? (
                              <span className="inline-flex items-center justify-center w-8 h-8 bg-orange-500/20 text-orange-400 rounded font-bold text-sm">
                                ✓
                              </span>
                            ) : (
                              <span className="inline-flex items-center justify-center w-8 h-8 bg-zinc-800 text-zinc-600 rounded text-sm">
                                ―
                              </span>
                            )}
                          </td>
                          <td className="text-center py-3 px-4">
                            {user.roles.includes("CONSULTED") ? (
                              <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-500/20 text-blue-400 rounded font-bold text-sm">
                                ✓
                              </span>
                            ) : (
                              <span className="inline-flex items-center justify-center w-8 h-8 bg-zinc-800 text-zinc-600 rounded text-sm">
                                ―
                              </span>
                            )}
                          </td>
                          <td className="text-center py-3 px-4">
                            {user.roles.includes("INFORMED") ? (
                              <span className="inline-flex items-center justify-center w-8 h-8 bg-green-500/20 text-green-400 rounded font-bold text-sm">
                                ✓
                              </span>
                            ) : (
                              <span className="inline-flex items-center justify-center w-8 h-8 bg-zinc-800 text-zinc-600 rounded text-sm">
                                ―
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-zinc-500">
                  <div className="text-4xl mb-4">📊</div>
                  <div className="text-lg font-medium mb-2">No RACI assignments yet</div>
                  <div className="text-sm">
                    Add team members to this epic and assign RACI roles to see the matrix.
                  </div>
                </div>
              )}

              {/* RACI Legend */}
              <div className="mt-6 p-4 bg-zinc-800/50 rounded-lg">
                <h3 className="text-white font-medium mb-3">RACI Role Definitions:</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-red-400 font-bold">R</span>
                    <span className="text-zinc-300">
                      <strong>Responsible</strong> - Does the work
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-orange-400 font-bold">A</span>
                    <span className="text-zinc-300">
                      <strong>Accountable</strong> - Ultimately answerable
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-blue-400 font-bold">C</span>
                    <span className="text-zinc-300">
                      <strong>Consulted</strong> - Provides input
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-400 font-bold">I</span>
                    <span className="text-zinc-300">
                      <strong>Informed</strong> - Needs to know
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Subtasks */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mt-6">
              <h2 className="text-xl font-bold text-white mb-4">📋 Subtasks</h2>
              <div className="space-y-2">
                {epic.subtasks.length > 0 ? (
                  epic.subtasks.map((subtask: any) => (
                    <div
                      key={subtask.id}
                      className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={subtask.status === "DONE"}
                          readOnly
                          className="w-4 h-4"
                        />
                        <span
                          className={`${subtask.status === "DONE" ? "line-through text-zinc-500" : "text-white"}`}
                        >
                          {subtask.title}
                        </span>
                        {subtask.isBlocked && (
                          <span className="text-red-400 text-xs flex items-center gap-1">
                            <IconAlertTriangle size={14} />
                            Blocked
                          </span>
                        )}
                      </div>
                      {subtask.assignedUser && (
                        <span className="text-zinc-400 text-sm">
                          {subtask.assignedUser.name}
                        </span>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-zinc-500 text-center py-8">
                    No subtasks yet
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stakeholders */}
          <div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4">
                👥 Stakeholders
              </h2>
              <div className="space-y-3">
                {epic.stakeholders.length > 0 ? (
                  epic.stakeholders.map((stakeholder: any) => (
                    <div
                      key={stakeholder.id}
                      className="p-3 bg-zinc-800 rounded-lg"
                    >
                      <div className="font-medium text-white">
                        {stakeholder.user?.name || stakeholder.user?.email}
                      </div>
                      <div className="text-sm text-zinc-400 mt-1">
                        {stakeholder.stakeholderType}
                      </div>
                      <div className="text-xs text-zinc-500 mt-1">
                        Notify: {stakeholder.notificationPreference}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-zinc-500 text-center py-8">
                    No stakeholders assigned
                  </div>
                )}
              </div>
            </div>

            {/* Epic Team Members */}
            <div className="mt-6">
              <EpicTeamMembers epicId={params.id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
