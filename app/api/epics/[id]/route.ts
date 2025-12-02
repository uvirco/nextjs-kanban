import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const epicId = params.id;
    const body = await request.json();

    const {
      title,
      description,
      departmentId,
      businessValue,
      riskLevel,
      priority,
      estimatedEffort,
      budgetEstimate,
      strategicAlignment,
      roiEstimate,
      stageGate,
      dueDate,
      startDate,
    } = body;

    // Validate required fields
    if (!title) {
      return NextResponse.json(
        { error: "Missing required field: title" },
        { status: 400 }
      );
    }

    // Update the epic
    const updateData = {
      title,
      description: description || null,
      departmentId: departmentId || null,
      businessValue: businessValue || null,
      riskLevel: riskLevel || null,
      priority: priority || null,
      estimatedEffort: estimatedEffort || null,
      budgetEstimate: budgetEstimate || null,
      strategicAlignment: strategicAlignment || null,
      roiEstimate: roiEstimate || null,
      stageGate: stageGate || null,
      dueDate: dueDate || null,
      startDate: startDate || null,
      updatedAt: new Date().toISOString(),
    };

    const { data: epic, error: epicError } = await supabaseAdmin
      .from("Task")
      .update(updateData)
      .eq("id", epicId)
      .eq("taskType", "EPIC") // Ensure we're only updating epics
      .select()
      .single();

    if (epicError) {
      console.error("Error updating epic:", epicError);
      return NextResponse.json(
        { error: "Failed to update epic" },
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
