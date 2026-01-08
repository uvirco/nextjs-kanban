import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase";

export async function PUT(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    console.log("PUT /api/epics/[id] - Starting request");

    const session = await auth();
    if (!session?.user?.id) {
      console.log("PUT /api/epics/[id] - Unauthorized");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const epicId = params.id;
    console.log("PUT /api/epics/[id] - Epic ID:", epicId);

    const body = await request.json();
    console.log("PUT /api/epics/[id] - Request body:", body);

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
      acceptanceCriteria,
      defaultTaskPriority,
      autoAssignOwner,
      requireAcceptanceCriteria,
      enableTimeTracking,
      defaultTaskTemplate,
      workflowAutomation,
    } = body;

    // Validate required fields - only require title if it's being updated
    if (body.title !== undefined && !title) {
      return NextResponse.json(
        { error: "Missing required field: title" },
        { status: 400 }
      );
    }

    // Build update data dynamically - only include fields that are provided
    const updateData: any = {
      updatedAt: new Date().toISOString(),
    };

    // Only add fields that are explicitly provided in the request
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description || null;
    if (departmentId !== undefined) updateData.departmentId = departmentId || null;
    if (businessValue !== undefined) updateData.businessValue = businessValue || null;
    if (riskLevel !== undefined) updateData.riskLevel = riskLevel || null;
    if (priority !== undefined) updateData.priority = priority || null;
    if (estimatedEffort !== undefined) updateData.estimatedEffort = estimatedEffort || null;
    if (budgetEstimate !== undefined) updateData.budgetEstimate = budgetEstimate || null;
    if (strategicAlignment !== undefined) updateData.strategicAlignment = strategicAlignment || null;
    if (roiEstimate !== undefined) updateData.roiEstimate = roiEstimate || null;
    if (stageGate !== undefined) updateData.stageGate = stageGate || null;
    if (dueDate !== undefined) updateData.dueDate = dueDate || null;
    if (startDate !== undefined) updateData.startDate = startDate || null;
    if (acceptanceCriteria !== undefined) updateData.acceptanceCriteria = acceptanceCriteria || null;
    if (defaultTaskPriority !== undefined) updateData.defaultTaskPriority = defaultTaskPriority || null;
    if (autoAssignOwner !== undefined) updateData.autoAssignOwner = autoAssignOwner || false;
    if (requireAcceptanceCriteria !== undefined) updateData.requireAcceptanceCriteria = requireAcceptanceCriteria || false;
    if (enableTimeTracking !== undefined) updateData.enableTimeTracking = enableTimeTracking || false;
    if (defaultTaskTemplate !== undefined) updateData.defaultTaskTemplate = defaultTaskTemplate || null;
    if (workflowAutomation !== undefined) updateData.workflowAutomation = workflowAutomation || null;

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

    console.log("PUT /api/epics/[id] - Successfully updated epic:", epic.id);
    return NextResponse.json(epic);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
