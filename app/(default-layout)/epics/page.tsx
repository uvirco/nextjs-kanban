import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { redirect } from "next/navigation";
import EpicPortfolioClient from "./components/EpicPortfolioClient";

export default async function EpicPortfolioPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/login");
  }

  // Fetch all epics with their metrics
  const { data: epics, error } = await supabaseAdmin
    .from("Task")
    .select(
      `
      id,
      title,
      description,
      taskType,
      priority,
      businessValue,
      estimatedEffort,
      budgetEstimate,
      riskLevel,
      strategicAlignment,
      roiEstimate,
      stageGate,
      dueDate,
      startDate,
      createdAt,
      updatedAt,
      columnId,
      readinessScore,
      department:Department(id, name),
      column:Column(id, title, board:Board(id, title))
    `
    )
    .eq("taskType", "EPIC")
    .order("createdAt", { ascending: false }); // Order by creation date instead of priority

  if (error) {
    console.error("Error fetching epics:", error);
  }

  // Fetch subtasks count and completion for each epic
  const epicsWithMetrics = await Promise.all(
    (epics || []).map(async (epic: any) => {
      // Get subtask counts
      const { data: subtasks } = await supabaseAdmin
        .from("Task")
        .select("id, columnId, column:Column(title)")
        .eq("parentTaskId", epic.id);

      const totalTasks = subtasks?.length || 0;
      const completedTasks =
        subtasks?.filter(
          (t: any) =>
            t.column?.title?.toLowerCase().includes("done") ||
            t.column?.title?.toLowerCase().includes("complete")
        ).length || 0;
      const blockedTasks =
        subtasks?.filter((t: any) =>
          t.column?.title?.toLowerCase().includes("blocked")
        ).length || 0;

      // Get RACI assignments
      const { data: raciAssignments } = await supabaseAdmin
        .from("RACIMatrix")
        .select("role, user:User(id, name, email, image)")
        .eq("taskId", epic.id);

      // Get Stakeholders
      const { data: stakeholders } = await supabaseAdmin
        .from("Stakeholder")
        .select("stakeholderType, user:User(id, name, email, image)")
        .eq("taskId", epic.id);

      // Get owner (accountable person)
      const owner =
        raciAssignments?.find((r: any) => r.role === "ACCOUNTABLE")?.user ||
        null;

      return {
        ...epic,
        metrics: {
          totalTasks,
          completedTasks,
          blockedTasks,
          progress:
            totalTasks > 0
              ? Math.round((completedTasks / totalTasks) * 100)
              : 0,
        },
        owner,
        raciAssignments: raciAssignments || [],
        stakeholders: stakeholders || [],
      };
    })
  );

  // Fetch the Epic board
  const { data: epicBoardBasic } = await supabaseAdmin
    .from("Board")
    .select("id, title, backgroundUrl")
    .eq("title", "Epics")
    .single();

  if (!epicBoardBasic) {
    console.error("Epic board not found");
  }

  let epicBoard = null;

  if (epicBoardBasic) {
    // Fetch columns
    const { data: columnsData } = await supabaseAdmin
      .from("Column")
      .select("*")
      .eq("boardId", epicBoardBasic.id)
      .order("order", { ascending: true });

    // Fetch all epic tasks for the board columns
    const columnIds = (columnsData || []).map((col: any) => col.id);
    const { data: tasksData } = await supabaseAdmin
      .from("Task")
      .select(
        `
        id,
        title,
        description,
        dueDate,
        startDate,
        coverImage,
        order,
        priority,
        businessValue,
        riskLevel,
        departmentId,
        readinessScore,
        taskType,
        columnId,
        department:Department(id, name),
        assignedUsers:TaskAssignment(user:User(id, name, image))
      `
      )
      .in("columnId", columnIds)
      .eq("taskType", "EPIC")
      .order("order", { ascending: true });

    // Group tasks by column
    const columnsWithTasks = (columnsData || []).map((column: any) => ({
      ...column,
      tasks: (tasksData || []).filter(
        (task: any) => task.columnId === column.id
      ),
    }));

    epicBoard = {
      ...epicBoardBasic,
      columns: columnsWithTasks,
    };
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="container mx-auto py-8 px-4">
        <EpicPortfolioClient
          epics={epicsWithMetrics || []}
          epicBoard={epicBoard || null}
        />
      </div>
    </main>
  );
}
