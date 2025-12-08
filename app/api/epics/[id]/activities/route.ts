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

    // Get all tasks under this epic (including subtasks)
    const { data: tasks, error: tasksError } = await supabaseAdmin
      .from("Task")
      .select("id")
      .or(`id.eq.${epicId},parentTaskId.eq.${epicId}`);

    if (tasksError) {
      console.error("Error fetching tasks:", tasksError);
      return NextResponse.json(
        { error: "Failed to fetch tasks" },
        { status: 500 }
      );
    }

    const taskIds = tasks?.map((task: any) => task.id) || [];

    // Get all activities for these tasks
    const { data: activities, error: activitiesError } = await supabaseAdmin
      .from("Activity")
      .select("*")
      .in("taskId", taskIds)
      .order("createdAt", { ascending: true });

    if (activitiesError) {
      console.error("Error fetching activities:", activitiesError);
      return NextResponse.json(
        { error: "Failed to fetch activities" },
        { status: 500 }
      );
    }

    return NextResponse.json(activities || []);
  } catch (error) {
    console.error("Failed to fetch epic activities:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}