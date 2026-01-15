import { supabase } from "@/lib/supabase";

export default async function FetchTask({ taskId }: { taskId: string }) {
  // First fetch basic task with column and board
  const { data: task, error } = await supabase
    .from("Task")
    .select(
      `
      *,
      column:Column(
        id,
        title,
        boardId,
        board:Board(id, title, backgroundUrl)
      )
    `
    )
    .eq("id", taskId)
    .single();

  if (error) {
    console.error("Error fetching task:", error);
    return null;
  }

  // Fetch assigned users
  const { data: assignments } = await supabase
    .from("TaskAssignment")
    .select("*, user:User(*)")
    .eq("taskId", taskId);

  // Fetch labels via join table
  const { data: labelRelations } = await supabase
    .from("_LabelToTask")
    .select("label:Label(*)")
    .eq("B", taskId);

  // Fetch checklists with items
  const { data: checklists } = await supabase
    .from("Checklist")
    .select("*, items:ChecklistItem(*)")
    .eq("taskId", taskId);

  // Fetch attachments
  const { data: attachments } = await supabase
    .from("Attachment")
    .select("*")
    .eq("taskId", taskId);

  // Fetch activities
  const { data: activities } = await supabase
    .from("Activity")
    .select("*, user:User(*)")
    .eq("taskId", taskId)
    .order("createdAt", { ascending: false });

  // Fetch watchers
  const { data: watchers } = await supabase
    .from("TaskWatcher")
    .select("*")
    .eq("taskId", taskId);

  // Fetch dependencies
  const { data: dependencies } = await supabase
    .from("TaskDependency")
    .select("*")
    .eq("taskId", taskId);

  // Fetch subtasks
  const { data: subtasks } = await supabase
    .from("Task")
    .select("*")
    .eq("parentTaskId", taskId);

  // Build the detailed task object
  const detailedTask = {
    ...task,
    labels: labelRelations?.map((rel: any) => rel.label) || [],
    assignedUsers: assignments || [],
    checklists: checklists || [],
    attachments: attachments || [],
    activities: activities || [],
    watchers: watchers || [],
    dependencies: dependencies || [],
    subtasks: subtasks || [],
  };

  return detailedTask;
}
