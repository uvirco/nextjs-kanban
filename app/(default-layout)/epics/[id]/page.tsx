import { supabaseAdmin } from "@/lib/supabase";
import { notFound } from "next/navigation";
import EpicDetailPageClient from "./EpicDetailPageClient";

async function getEpicDetails(epicId: string) {
  const supabase = supabaseAdmin;

  // Fetch epic
  const { data: epic, error: epicError } = await supabase
    .from("Task")
    .select(
      "*, department:Department(id, name, description), column:Column(id, title, boardId)"
    )
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
      column:Column(id, title),
      assignments:TaskAssignment(user:User(id, name, email))
    `
    )
    .eq("parentTaskId", epicId);

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
  const inProgressTasks =
    subtasks?.filter(
      (t: any) =>
        t.column?.title?.toLowerCase().includes("active") ||
        t.column?.title?.toLowerCase().includes("in progress") ||
        t.column?.title?.toLowerCase().includes("doing")
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
    metrics: { totalTasks, completedTasks, inProgressTasks, progress },
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

  return <EpicDetailPageClient epic={epic} raciUsers={raciUsers} params={params} />;
}
