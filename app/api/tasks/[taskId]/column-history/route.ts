import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { taskId } = await params;

    // Get task creation date and current column
    const { data: task, error: taskError } = await supabaseAdmin
      .from("Task")
      .select("createdAt, columnId, column:Column(id, title)")
      .eq("id", taskId)
      .single();

    if (taskError || !task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Get all TASK_MOVED activities for this task
    const { data: activities } = await supabaseAdmin
      .from("Activity")
      .select("createdAt, oldColumnId, newColumnId")
      .eq("taskId", taskId)
      .eq("type", "TASK_MOVED")
      .order("createdAt", { ascending: true });

    // Get column names for all referenced columns
    const columnIds = [
      ...(activities || [])
        .flatMap((a: any) => [a.oldColumnId, a.newColumnId])
        .filter(Boolean),
      task.columnId,
    ].filter(Boolean);

    const { data: columns } = await supabaseAdmin
      .from("Column")
      .select("id, title")
      .in("id", [...new Set(columnIds)]);

    const columnMap = Object.fromEntries(
      (columns || []).map((c: any) => [c.id, c.title])
    );

    // Build column history
    const events: Array<{
      date: Date;
      columnName: string;
      duration: number;
      isCurrent: boolean;
    }> = [];
    let previousDate = new Date(task.createdAt);

    // Add initial creation event
    events.push({
      date: previousDate,
      columnName: columnMap[task.columnId] || "Unknown",
      duration: 0, // Will be calculated
      isCurrent: (activities || []).length === 0, // If no moves, this is current
    });

    // Add movement events
    (activities || []).forEach((activity: any, index: number) => {
      const toColumn = columnMap[activity.newColumnId] || "Unknown";

      // Update duration for previous event
      const duration = Math.ceil(
        (new Date(activity.createdAt).getTime() - previousDate.getTime()) /
          (1000 * 60 * 60 * 24)
      );
      events[events.length - 1].duration = duration;

      // Add new column event
      events.push({
        date: new Date(activity.createdAt),
        columnName: toColumn,
        duration: 0, // Will be calculated for next event
        isCurrent: index === (activities || []).length - 1, // Last move is current
      });

      previousDate = new Date(activity.createdAt);
    });

    // Calculate duration for the last/current column
    if (events.length > 0) {
      const lastEvent = events[events.length - 1];
      const now = new Date();
      const duration = Math.ceil(
        (now.getTime() - lastEvent.date.getTime()) / (1000 * 60 * 60 * 24)
      );
      lastEvent.duration = duration;
      lastEvent.isCurrent = true;
    }

    return NextResponse.json({ events });
  } catch (error) {
    console.error("Failed to fetch column history:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
