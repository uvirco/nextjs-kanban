import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");
    const activityType = searchParams.get("type");
    const taskId = searchParams.get("taskId");
    const boardId = searchParams.get("boardId");
    const departmentId = searchParams.get("departmentId");
    const epicId = searchParams.get("epicId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // First, get relevant task IDs based on department/epic filters
    let taskIds: string[] | null = null;

    if (departmentId) {
      // Get all tasks in this department
      const { data: deptTasks } = await supabaseAdmin
        .from("Task")
        .select("id")
        .eq("departmentId", departmentId);
      taskIds = deptTasks?.map((t: any) => t.id) || [];
    }

    if (epicId) {
      // If a specific epic is selected, only get activities from that epic and its subtasks
      // First get the epic itself
      const { data: subtasks } = await supabaseAdmin
        .from("Task")
        .select("id")
        .eq("parentTaskId", epicId);
      
      const subTaskIds = subtasks?.map((t: any) => t.id) || [];
      // Include both the epic itself and all its subtasks
      taskIds = [epicId, ...subTaskIds];
    }

    let query = supabaseAdmin
      .from("Activity")
      .select(
        `
        *,
        user:User!Activity_userId_fkey(id, name, email, image),
        task:Task!Activity_taskId_fkey(id, title, taskType),
        board:Board!Activity_boardId_fkey(id, title),
        targetUser:User!Activity_targetUserId_fkey(id, name, email)
      `
      )
      .order("createdAt", { ascending: false });

    // Apply filters
    if (activityType) {
      query = query.eq("type", activityType);
    }

    if (taskId) {
      query = query.eq("taskId", taskId);
    }

    if (boardId) {
      query = query.eq("boardId", boardId);
    }

    // Apply department/epic filter by task IDs
    // If department or epic is selected, MUST filter by taskIds (even if empty)
    if (taskIds !== null) {
      if (taskIds.length > 0) {
        query = query.in("taskId", taskIds);
      } else {
        // No tasks in this department/epic, return empty results
        query = query.in("taskId", [""]);
      }
    }

    if (startDate) {
      query = query.gte("createdAt", startDate);
    }

    if (endDate) {
      query = query.lte("createdAt", endDate);
    }

    // Pagination
    query = query.range(offset, offset + limit - 1);

    const { data: activities, error } = await query;

    if (error) {
      console.error("Error fetching activities:", error);
      return NextResponse.json(
        { error: "Failed to fetch activities" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      activities: activities || [],
      total: activities?.length || 0,
      limit,
      offset,
    });
  } catch (error) {
    console.error("Failed to fetch activities:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
