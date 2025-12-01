import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase";

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

    // Get the Epics board's Backlog column (simplified query)
    const { data: backlogColumn, error: columnError } = await supabaseAdmin
      .from("Column")
      .select("id")
      .eq("title", "📋 Backlog")
      .eq("boardId", "63831445-8cb8-4f5e-a190-ed6163b3fa38") // Hardcode the Epics board ID for now
      .single();

    if (columnError || !backlogColumn) {
      console.error("Column query error:", columnError);
      return NextResponse.json(
        {
          error: `Epics board column not found. Error: ${columnError?.message || "Unknown"}`,
        },
        { status: 500 }
      );
    }

    // Create the epic
    const epicData = {
      id: crypto.randomUUID(),
      title,
      description: description || null,
      taskType: taskType || "EPIC",
      businessValue: businessValue || null,
      riskLevel: riskLevel || null,
      priority: priority || null,
      estimatedEffort: estimatedEffort || null,
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

    return NextResponse.json(epic);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
