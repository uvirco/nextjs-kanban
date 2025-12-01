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

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="container mx-auto py-8 px-4">
        <EpicPortfolioClient epics={epicsWithMetrics || []} />
      </div>
    </main>
  );
}
