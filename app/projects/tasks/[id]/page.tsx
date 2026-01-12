import TaskDetail from "@/ui/TaskDetail/TaskDetail";
import { supabase } from "@/lib/supabase";

interface TaskPageProps {
  params: Promise<{ id: string }>;
}

async function fetchTask(taskId: string) {
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

export default async function TaskPage({ params }: TaskPageProps) {
  const { id: taskId } = await params;
  const task = await fetchTask(taskId);

  if (!task) {
    return (
      <main className="flex flex-col grow bg-zinc-950">
        <div className="p-3 md:p-5 flex flex-col grow relative">
          <div className="text-zinc-400">Task not found or access denied.</div>
        </div>
      </main>
    );
  }

  // If task has parentTaskId, it's a subtask of an epic
  const backHref = task.parentTaskId
    ? `/projects/epics/${task.parentTaskId}?tab=taskboard`
    : `/projects/boards/${task.column.boardId}`;
  const backText = task.parentTaskId ? "Back to epic" : "Back to board";

  return (
    <main className="flex flex-col h-screen bg-zinc-950">
      <div className="p-3 md:p-5 flex flex-col h-full relative">
        <div>
          <a
            href={backHref}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
            {backText}
          </a>
        </div>
        <TaskDetail task={task} />
      </div>
    </main>
  );
}
