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

    // Get all tasks that belong to this epic
    const { data: subtasks, error } = await supabaseAdmin
      .from("Task")
      .select("id, title, createdAt, updatedAt, columnId")
      .eq("parentTaskId", epicId)
      .order("createdAt", { ascending: true });

    if (error) {
      console.error("Error fetching subtasks:", error);
      return NextResponse.json(
        { error: "Failed to fetch subtasks" },
        { status: 500 }
      );
    }

    return NextResponse.json({ subtasks: subtasks || [] });
  } catch (error) {
    console.error("Failed to fetch subtasks:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
