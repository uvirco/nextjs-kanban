import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: epicId } = await params;

    // Get all subtasks for this epic
    const { data: subtasks, error: subtasksError } = await supabaseAdmin
      .from("Task")
      .select("id, title, createdAt, columnId")
      .eq("parentTaskId", epicId)
      .order("createdAt", { ascending: true });

    if (subtasksError) {
      console.error("Error fetching subtasks:", subtasksError);
      return NextResponse.json({ error: "Failed to fetch subtasks" }, { status: 500 });
    }

    if (!subtasks || subtasks.length === 0) {
      return NextResponse.json({ timelines: [] });
    }

    const taskIds = subtasks.map((t) => t.id);

    // Get all TASK_MOVED activities for these tasks in one query
    const { data: activities } = await supabaseAdmin
      .from("Activity")
      .select("taskId, createdAt, oldColumnId, newColumnId")
      .in("taskId", taskIds)
      .eq("type", "TASK_MOVED")
      .order("createdAt", { ascending: true });

    // Collect all column IDs we need to look up
    const allColumnIds = new Set<string>();
    subtasks.forEach((t) => {
      if (t.columnId) allColumnIds.add(t.columnId);
    });
    (activities || []).forEach((a: any) => {
      if (a.oldColumnId) allColumnIds.add(a.oldColumnId);
      if (a.newColumnId) allColumnIds.add(a.newColumnId);
    });

    // Fetch all columns in one query
    const { data: columns } = await supabaseAdmin
      .from("Column")
      .select("id, title")
      .in("id", Array.from(allColumnIds));

    const columnMap: Record<string, string> = {};
    (columns || []).forEach((c: any) => {
      columnMap[c.id] = c.title;
    });

    // Group activities by task
    const activitiesByTask: Record<string, any[]> = {};
    (activities || []).forEach((a: any) => {
      if (!activitiesByTask[a.taskId]) {
        activitiesByTask[a.taskId] = [];
      }
      activitiesByTask[a.taskId].push(a);
    });

    // Build timeline for each task
    const timelines = subtasks.map((task) => {
      const taskActivities = activitiesByTask[task.id] || [];
      const segments: Array<{
        columnName: string;
        startDate: string;
        endDate: string;
        durationDays: number;
        isCurrent: boolean;
      }> = [];

      if (taskActivities.length === 0) {
        // No moves - task has been in initial column since creation
        const now = new Date();
        const created = new Date(task.createdAt);
        const days = Math.max(1, Math.ceil((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)));
        
        segments.push({
          columnName: columnMap[task.columnId] || "Unknown",
          startDate: task.createdAt,
          endDate: now.toISOString(),
          durationDays: days,
          isCurrent: true,
        });
      } else {
        // Build segments from activity history
        let currentDate = new Date(task.createdAt);
        
        // First segment: from creation to first move
        const firstActivity = taskActivities[0];
        const firstColumnId = firstActivity.oldColumnId;
        const firstMoveDate = new Date(firstActivity.createdAt);
        const firstDays = Math.max(1, Math.ceil((firstMoveDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)));
        
        segments.push({
          columnName: columnMap[firstColumnId] || "Unknown",
          startDate: task.createdAt,
          endDate: firstActivity.createdAt,
          durationDays: firstDays,
          isCurrent: false,
        });

        // Middle segments: between moves
        for (let i = 0; i < taskActivities.length; i++) {
          const activity = taskActivities[i];
          const startDate = new Date(activity.createdAt);
          const endDate = i < taskActivities.length - 1 
            ? new Date(taskActivities[i + 1].createdAt)
            : new Date(); // current time for last segment
          
          const days = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
          
          segments.push({
            columnName: columnMap[activity.newColumnId] || "Unknown",
            startDate: activity.createdAt,
            endDate: endDate.toISOString(),
            durationDays: days,
            isCurrent: i === taskActivities.length - 1,
          });
        }
      }

      return {
        taskId: task.id,
        taskTitle: task.title,
        createdAt: task.createdAt,
        segments,
      };
    });

    return NextResponse.json({ timelines });
  } catch (error) {
    console.error("Failed to fetch task timelines:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
