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

    // First, get all subtasks for this epic
    const { data: subtasks, error: subtasksError } = await supabaseAdmin
      .from("Task")
      .select("id")
      .eq("parentTaskId", epicId);

    if (subtasksError) {
      console.error("Error fetching subtasks:", subtasksError);
      return NextResponse.json(
        { error: "Failed to fetch subtasks" },
        { status: 500 }
      );
    }

    if (!subtasks || subtasks.length === 0) {
      return NextResponse.json({ comments: [] });
    }

    const subtaskIds = subtasks.map((task: any) => task.id);

    // Get all comments for these tasks
    const { data: comments, error: commentsError } = await supabaseAdmin
      .from("Activity")
      .select(
        `
        *,
        user:User!Activity_userId_fkey(id, name, image),
        task:Task(id, title)
      `
      )
      .eq("type", "COMMENT_ADDED")
      .in("taskId", subtaskIds)
      .order("createdAt", { ascending: false });

    if (commentsError) {
      console.error("Error fetching comments:", commentsError);
      return NextResponse.json(
        { error: "Failed to fetch comments" },
        { status: 500 }
      );
    }

    return NextResponse.json({ comments: comments || [] });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
