import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { logActivity, formatActivityContent } from "@/lib/activity-logger";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const epics = await supabaseAdmin
      .from("Task")
      .select(
        `
        id,
        title,
        createdAt,
        updatedAt
      `
      )
      .eq("taskType", "EPIC")
      .order("updatedAt", { ascending: false });

    return NextResponse.json(epics.data || []);
  } catch (error) {
    console.error("Failed to fetch epics:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      description,
      taskType,
      departmentId,
      businessValue,
      riskLevel,
      priority,
      estimatedEffort,
      dueDate,
      userId,
    } = body;

    // Validate required fields
    if (!title) {
      return NextResponse.json(
        { error: "Missing required field: title" },
        { status: 400 }
      );
    }

    // Find the Epics board dynamically
    const { data: epicsBoard, error: boardError } = await supabaseAdmin
      .from("Board")
      .select("id")
      .eq("title", "Epics")
      .single();

    if (boardError || !epicsBoard) {
      console.error("Epics board not found:", boardError);
      return NextResponse.json(
        {
          error: `Epics board not found. Please ensure the database migration has been run. Error: ${boardError?.message || "Unknown"}`,
        },
        { status: 500 }
      );
    }

    // Get the Epics board's Backlog column
    const { data: backlogColumn, error: columnError } = await supabaseAdmin
      .from("Column")
      .select("id")
      .eq("title", "📋 Backlog")
      .eq("boardId", epicsBoard.id)
      .single();

    if (columnError || !backlogColumn) {
      console.error("Backlog column query error:", columnError);
      return NextResponse.json(
        {
          error: `Epics board Backlog column not found. Error: ${columnError?.message || "Unknown"}`,
        },
        { status: 500 }
      );
    }

    // Map effort string values to numeric values
    let estimatedEffortValue = null;
    if (estimatedEffort) {
      const effortMapping: Record<string, number> = {
        SMALL: 2, // 1-2 weeks
        MEDIUM: 8, // 1-3 months (average ~8 weeks)
        LARGE: 20, // 3-6 months (average ~20 weeks)
        XLARGE: 30, // 6+ months (minimum 30 weeks)
      };
      estimatedEffortValue = effortMapping[estimatedEffort] || null;
    }

    // Create the epic
    const epicData = {
      id: crypto.randomUUID(),
      title,
      description: description || null,
      taskType: taskType || "EPIC",
      departmentId: departmentId || null,
      businessValue: businessValue || null,
      riskLevel: riskLevel || null,
      priority: priority || null,
      estimatedEffort: estimatedEffortValue,
      dueDate: dueDate || null,
      createdByUserId: userId,
      columnId: backlogColumn.id, // Assign to Epics board's Backlog column
      order: 0, // Default order
    };

    const { data: epic, error: epicError } = await supabaseAdmin
      .from("Task")
      .insert(epicData)
      .select()
      .single();

    if (epicError) {
      console.error("Error creating epic:", epicError);
      return NextResponse.json(
        { error: "Failed to create epic" },
        { status: 500 }
      );
    }

    // Log activity
    await logActivity({
      type: "EPIC_CREATED",
      content: formatActivityContent({
        action: "created",
        userName: session.user.name || session.user.email || "User",
        entityType: "epic",
        entityName: epic.title,
      }),
      userId: session.user.id,
      taskId: epic.id,
    });

    return NextResponse.json(epic);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
