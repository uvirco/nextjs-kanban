"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { ActivityType } from "@prisma/client";
import { supabaseAdmin } from "@/lib/supabase";
import { auth } from "@/auth";
import {
  TaskCreationData,
  TaskEditData,
  TaskDeletionData,
} from "@/types/types";
import { MESSAGES } from "@/utils/messages";

// Create Task
export async function handleCreateTask(data: TaskCreationData) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { success: false, message: MESSAGES.AUTH.REQUIRED };
  }

  const CreateTaskSchema = z.object({
    taskTitle: z.string().min(1, MESSAGES.TASK.TITLE_TOO_SHORT),
    columnId: z.string().min(1, MESSAGES.COMMON.COLUMN_ID_REQUIRED),
    boardId: z.string().min(1, MESSAGES.COMMON.BOARD_ID_REQUIRED),
  });

  const parse = CreateTaskSchema.safeParse(data);

  if (!parse.success) {
    return {
      success: false,
      message: parse.error.errors.map((e) => e.message).join(", "),
    };
  }

  try {
    // Find the maximum order in the column
    const { data: maxOrderTask, error: maxOrderError } = await supabaseAdmin
      .from("Task")
      .select("order")
      .eq("columnId", parse.data.columnId)
      .order("order", { ascending: false })
      .limit(1)
      .single();

    if (maxOrderError && maxOrderError.code !== "PGRST116") {
      // PGRST116 is "no rows returned"
      console.error("Error finding max order:", maxOrderError);
      return { success: false, message: MESSAGES.TASK.CREATE_FAILURE };
    }

    const newOrder = (maxOrderTask?.order || 0) + 1;

    // Create the task
    const { data: createdTask, error: taskError } = await supabaseAdmin
      .from("Task")
      .insert({
        title: parse.data.taskTitle,
        columnId: parse.data.columnId,
        order: newOrder,
        createdByUserId: userId,
      })
      .select()
      .single();

    if (taskError) {
      console.error("Error creating task:", taskError);
      return { success: false, message: MESSAGES.TASK.CREATE_FAILURE };
    }

    // Create activity entry
    if (createdTask) {
      const { error: activityError } = await supabaseAdmin
        .from("Activity")
        .insert({
          type: ActivityType.TASK_CREATED,
          userId: userId,
          taskId: createdTask.id,
          boardId: parse.data.boardId,
          originalColumnId: parse.data.columnId,
        });

      if (activityError) {
        console.error("Error creating activity:", activityError);
        // Don't fail the whole operation for activity errors
      }
    }

    revalidatePath(`/board/${parse.data.boardId}`);

    return {
      success: true,
      message: MESSAGES.TASK.CREATE_SUCCESS,
    };
  } catch (e) {
    return { success: false, message: MESSAGES.TASK.CREATE_FAILURE };
  }
}

// Edit Task
export async function handleEditTask(data: TaskEditData) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { success: false, message: MESSAGES.AUTH.REQUIRED };
  }

  const EditTaskSchema = z.object({
    id: z.string().min(1, MESSAGES.COMMON.TASK_ID_REQUIRED),
    boardId: z.string().min(1, MESSAGES.COMMON.BOARD_ID_REQUIRED),
    title: z.string().min(1, MESSAGES.TASK.TITLE_TOO_SHORT),
    description: z.union([z.string(), z.null()]).optional(),
    // Advanced project fields
    priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
    businessValue: z.string().optional(),
    estimatedEffort: z.number().positive().optional(),
    budgetEstimate: z.number().positive().optional(),
    riskLevel: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
    strategicAlignment: z.string().optional(),
    roiEstimate: z.number().positive().optional(),
    stageGate: z.string().optional(),
    timeSpent: z.number().min(0).optional(),
    storyPoints: z.number().int().positive().optional(),
  });

  const parse = EditTaskSchema.safeParse(data);

  if (!parse.success) {
    return {
      success: false,
      message: parse.error.errors.map((e) => e.message).join(", "),
    };
  }

  try {
    const { error } = await supabaseAdmin
      .from("Task")
      .update({
        title: parse.data.title,
        description: parse.data.description,
        // Advanced project fields
        priority: parse.data.priority,
        businessValue: parse.data.businessValue,
        estimatedEffort: parse.data.estimatedEffort,
        budgetEstimate: parse.data.budgetEstimate,
        riskLevel: parse.data.riskLevel,
        strategicAlignment: parse.data.strategicAlignment,
        roiEstimate: parse.data.roiEstimate,
        stageGate: parse.data.stageGate,
        timeSpent: parse.data.timeSpent,
        storyPoints: parse.data.storyPoints,
      })
      .eq("id", parse.data.id);

    if (error) {
      console.error("Error updating task:", error);
      return { success: false, message: MESSAGES.TASK.UPDATE_FAILURE };
    }

    revalidatePath(`/board/${parse.data.boardId}`);

    return { success: true, message: MESSAGES.TASK.UPDATE_SUCCESS };
  } catch (e) {
    return { success: false, message: MESSAGES.TASK.UPDATE_FAILURE };
  }
}

// Delete Task
export async function handleDeleteTask(data: TaskDeletionData) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { success: false, message: MESSAGES.AUTH.REQUIRED };
  }

  const DeleteTaskSchema = z.object({
    id: z.string().min(1, MESSAGES.COMMON.TASK_ID_REQUIRED),
    columnId: z.string().min(1, MESSAGES.COMMON.COLUMN_ID_REQUIRED),
    boardId: z.string().min(1, MESSAGES.COMMON.BOARD_ID_REQUIRED),
  });

  const parse = DeleteTaskSchema.safeParse(data);

  if (!parse.success) {
    return {
      success: false,
      message: parse.error.errors.map((e) => e.message).join(", "),
    };
  }

  try {
    // Get the task order before deleting
    const { data: taskToDelete, error: fetchError } = await supabaseAdmin
      .from("Task")
      .select("order")
      .eq("id", parse.data.id)
      .single();

    if (fetchError) {
      console.error("Error fetching task:", fetchError);
      return { success: false, message: MESSAGES.TASK.DELETE_FAILURE };
    }

    // Delete the task
    const { error: deleteError } = await supabaseAdmin
      .from("Task")
      .delete()
      .eq("id", parse.data.id);

    if (deleteError) {
      console.error("Error deleting task:", deleteError);
      return { success: false, message: MESSAGES.TASK.DELETE_FAILURE };
    }

    // Update the order of remaining tasks in the column
    if (taskToDelete) {
      const { data: tasksToUpdate, error: fetchTasksError } =
        await supabaseAdmin
          .from("Task")
          .select("id, order")
          .eq("columnId", parse.data.columnId)
          .gt("order", taskToDelete.order);

      if (fetchTasksError) {
        console.error("Error fetching tasks to update:", fetchTasksError);
      } else if (tasksToUpdate && tasksToUpdate.length > 0) {
        // Decrement order for each task
        for (const task of tasksToUpdate) {
          const { error: updateOrderError } = await supabaseAdmin
            .from("Task")
            .update({ order: task.order - 1 })
            .eq("id", task.id);

          if (updateOrderError) {
            console.error("Error updating task order:", updateOrderError);
          }
        }
      }
    }

    revalidatePath(`/board/${parse.data.boardId}`);
    return { success: true, message: MESSAGES.TASK.DELETE_SUCCESS };
  } catch (e) {
    return { success: false, message: MESSAGES.TASK.DELETE_FAILURE };
  }
}
