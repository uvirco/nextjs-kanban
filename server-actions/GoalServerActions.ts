"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { MESSAGES } from "@/utils/messages";
import { supabaseAdmin } from "@/lib/supabase";

// Create a new goal
export async function handleCreateGoal({
  title,
  description,
  taskId,
  boardId,
}: {
  title: string;
  description?: string;
  taskId: string;
  boardId: string;
}) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { success: false, message: MESSAGES.AUTH.REQUIRED };
  }

  const CreateGoalSchema = z.object({
    title: z.string().trim().min(1, "Goal title is required").max(200, "Goal title too long"),
    description: z.string().trim().max(1000, "Goal description too long").optional(),
    taskId: z.string().min(1, MESSAGES.COMMON.TASK_ID_REQUIRED),
    boardId: z.string().min(1, MESSAGES.COMMON.BOARD_ID_REQUIRED),
  });

  const parse = CreateGoalSchema.safeParse({ title, description, taskId, boardId });

  if (!parse.success) {
    return {
      success: false,
      message: parse.error.errors.map((e) => e.message).join(", "),
    };
  }

  try {
    // Get the max order for existing goals
    const { data: existingGoals } = await supabaseAdmin
      .from("Goal")
      .select("order")
      .eq("taskId", parse.data.taskId)
      .order("order", { ascending: false })
      .limit(1);

    const newOrder = existingGoals && existingGoals.length > 0 ? existingGoals[0].order + 1 : 0;

    const { error } = await supabaseAdmin.from("Goal").insert({
      title: parse.data.title,
      description: parse.data.description || null,
      taskId: parse.data.taskId,
      order: newOrder,
    });

    if (error) {
      console.error(error);
      return { success: false, message: "Failed to create goal" };
    }

    revalidatePath(`/board/${parse.data.boardId}`);
    revalidatePath(`/task/${parse.data.taskId}`);

    return { success: true, message: "Goal created successfully! 🎯" };
  } catch (e) {
    console.error(e);
    return { success: false, message: "Failed to create goal" };
  }
}

// Update goal text
export async function handleUpdateGoal({
  goalId,
  title,
  description,
  taskId,
  boardId,
}: {
  goalId: string;
  title?: string;
  description?: string;
  taskId: string;
  boardId: string;
}) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { success: false, message: MESSAGES.AUTH.REQUIRED };
  }

  const UpdateGoalSchema = z.object({
    goalId: z.string().min(1, "Goal ID required"),
    title: z.string().trim().min(1, "Goal title is required").max(200, "Goal title too long").optional(),
    description: z.string().trim().max(1000, "Goal description too long").optional().nullable(),
    taskId: z.string().min(1, MESSAGES.COMMON.TASK_ID_REQUIRED),
    boardId: z.string().min(1, MESSAGES.COMMON.BOARD_ID_REQUIRED),
  });

  const parse = UpdateGoalSchema.safeParse({ goalId, title, description, taskId, boardId });

  if (!parse.success) {
    return {
      success: false,
      message: parse.error.errors.map((e) => e.message).join(", "),
    };
  }

  try {
    const updateData: any = {};
    if (parse.data.title !== undefined) updateData.title = parse.data.title;
    if (parse.data.description !== undefined) updateData.description = parse.data.description;

    const { error } = await supabaseAdmin
      .from("Goal")
      .update(updateData)
      .eq("id", parse.data.goalId);

    if (error) {
      console.error(error);
      return { success: false, message: "Failed to update goal" };
    }

    revalidatePath(`/board/${parse.data.boardId}`);
    revalidatePath(`/task/${parse.data.taskId}`);

    return { success: true, message: "Goal updated successfully" };
  } catch (e) {
    console.error(e);
    return { success: false, message: "Failed to update goal" };
  }
}

// Mark goal as achieved
export async function handleMarkGoalAchieved({
  goalId,
  achieved,
  taskId,
  boardId,
}: {
  goalId: string;
  achieved: boolean;
  taskId: string;
  boardId: string;
}) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { success: false, message: MESSAGES.AUTH.REQUIRED };
  }

  try {
    const updateData: any = {
      achieved,
      achievedAt: achieved ? new Date().toISOString() : null,
      achievedByUserId: achieved ? userId : null,
    };

    const { error } = await supabaseAdmin
      .from("Goal")
      .update(updateData)
      .eq("id", goalId);

    if (error) {
      console.error(error);
      return { success: false, message: "Failed to update goal status" };
    }

    revalidatePath(`/board/${boardId}`);
    revalidatePath(`/task/${taskId}`);

    return { 
      success: true, 
      message: achieved ? "🎉 GOAL ACHIEVED!!! 🎉" : "Goal unmarked as achieved" 
    };
  } catch (e) {
    console.error(e);
    return { success: false, message: "Failed to update goal status" };
  }
}

// Delete a goal
export async function handleDeleteGoal({
  goalId,
  taskId,
  boardId,
}: {
  goalId: string;
  taskId: string;
  boardId: string;
}) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { success: false, message: MESSAGES.AUTH.REQUIRED };
  }

  try {
    const { error } = await supabaseAdmin
      .from("Goal")
      .delete()
      .eq("id", goalId);

    if (error) {
      console.error(error);
      return { success: false, message: "Failed to delete goal" };
    }

    revalidatePath(`/board/${boardId}`);
    revalidatePath(`/task/${taskId}`);

    return { success: true, message: "Goal deleted successfully" };
  } catch (e) {
    console.error(e);
    return { success: false, message: "Failed to delete goal" };
  }
}
