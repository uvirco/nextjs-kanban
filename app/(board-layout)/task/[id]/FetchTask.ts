import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { DetailedTask } from "@/types/types";

export default async function FetchTask({
  taskId,
}: {
  taskId: string;
}): Promise<DetailedTask | null> {
  const session = await auth();
  const userId = session?.user?.id;
  const userRole = session?.user?.role;

  // Allow admins to access all tasks
  if (userRole !== "ADMIN") {
    // Check if user is a member of the board that contains this task
    const { data: task, error: taskError } = await supabaseAdmin
      .from("Task")
      .select("id, columnId, column:Column(boardId)")
      .eq("id", taskId)
      .single();

    if (taskError || !task) {
      return null;
    }

    const { data: boardMember, error: memberError } = await supabaseAdmin
      .from("BoardMember")
      .select("userId")
      .eq("boardId", (task.column as any).boardId)
      .eq("userId", userId)
      .single();

    if (memberError || !boardMember) {
      return null;
    }
  }

  // Fetch the task with all related data
  const { data: task, error: taskError } = await supabaseAdmin
    .from("Task")
    .select("*")
    .eq("id", taskId)
    .single();

  if (taskError || !task) {
    return null;
  }

  // Fetch column details
  const { data: column } = await supabaseAdmin
    .from("Column")
    .select("title, boardId, board:Board(backgroundUrl)")
    .eq("id", task.columnId)
    .single();

  // Fetch labels for the task
  const { data: labelAssignments } = await supabaseAdmin
    .from("LabelOnTask")
    .select("labelId, label:Label(*)")
    .eq("taskId", taskId);

  // Fetch checklists with items
  const { data: checklists } = await supabaseAdmin
    .from("Checklist")
    .select("*")
    .eq("taskId", taskId);

  const checklistsWithItems = await Promise.all(
    (checklists || []).map(async (checklist: any) => {
      const { data: items } = await supabaseAdmin
        .from("ChecklistItem")
        .select("*")
        .eq("checklistId", checklist.id)
        .order("createdAt", { ascending: true });

      return {
        ...checklist,
        items: items || [],
      };
    })
  );

  // Fetch activities
  const { data: activities } = await supabaseAdmin
    .from("Activity")
    .select("*")
    .eq("taskId", taskId)
    .order("createdAt", { ascending: false });

  // Fetch user details for activities
  const activitiesWithDetails = await Promise.all(
    (activities || []).map(async (activity: any) => {
      const { data: user } = await supabaseAdmin
        .from("User")
        .select("*")
        .eq("id", activity.userId)
        .single();

      let oldColumn = null;
      let newColumn = null;
      let originalColumn = null;

      if (activity.oldColumnId) {
        const { data } = await supabaseAdmin
          .from("Column")
          .select("*")
          .eq("id", activity.oldColumnId)
          .single();
        oldColumn = data;
      }

      if (activity.newColumnId) {
        const { data } = await supabaseAdmin
          .from("Column")
          .select("*")
          .eq("id", activity.newColumnId)
          .single();
        newColumn = data;
      }

      if (activity.originalColumnId) {
        const { data } = await supabaseAdmin
          .from("Column")
          .select("*")
          .eq("id", activity.originalColumnId)
          .single();
        originalColumn = data;
      }

      const { data: activityTask } = await supabaseAdmin
        .from("Task")
        .select("*")
        .eq("id", taskId)
        .single();

      const { data: board } = activity.boardId
        ? await supabaseAdmin
            .from("Board")
            .select("*")
            .eq("id", activity.boardId)
            .single()
        : { data: null };

      return {
        ...activity,
        user,
        oldColumn,
        newColumn,
        originalColumn,
        task: activityTask,
        board,
      };
    })
  );

  // Fetch assigned users
  const { data: assignedUsers } = await supabaseAdmin
    .from("TaskAssignment")
    .select("userId, taskId, user:User(*)")
    .eq("taskId", taskId);

  // Fetch attachments
  const { data: attachments } = await supabaseAdmin
    .from("Attachment")
    .select("*")
    .eq("taskId", taskId);

  // Fetch watchers
  const { data: watchers } = await supabaseAdmin
    .from("TaskWatcher")
    .select("userId, taskId, user:User(*)")
    .eq("taskId", taskId);

  // Fetch dependencies
  const { data: dependencies } = await supabaseAdmin
    .from("TaskDependency")
    .select("id, taskId, dependsOnTaskId, dependsOnTask:Task(*)")
    .eq("taskId", taskId);

  // Fetch subtasks
  const { data: subtasks } = await supabaseAdmin
    .from("Task")
    .select("*")
    .eq("parentTaskId", taskId);

  const detailedTask: DetailedTask = {
    ...task,
    column: {
      title: column?.title || "",
      boardId: column?.boardId || "",
      board: {
        backgroundUrl: (column?.board as any)?.backgroundUrl || null,
      },
    },
    labels: (labelAssignments || []).map((la: any) => la.label),
    checklists: checklistsWithItems,
    activities: activitiesWithDetails,
    assignedUsers: assignedUsers || [],
    attachments: attachments || [],
    watchers: watchers || [],
    dependencies: dependencies || [],
    subtasks: subtasks || [],
  };

  return detailedTask;
}
