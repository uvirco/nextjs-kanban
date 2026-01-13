"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { ActivityType } from "@/types/types";
import { supabaseAdmin } from "@/lib/supabase";
import { auth } from "@/auth";
import { logActivity, formatActivityContent } from "@/lib/activity-logger";
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
    description: z.string().optional(),
    parentTaskId: z.string().optional(),
    assignedUserId: z.string().optional(),
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
        description: parse.data.description || null,
        columnId: parse.data.columnId,
        order: newOrder,
        createdByUserId: userId,
        parentTaskId: parse.data.parentTaskId || null,
      })
      .select()
      .single();

    if (taskError) {
      console.error("Error creating task:", taskError);
      return { success: false, message: MESSAGES.TASK.CREATE_FAILURE };
    }

    // Create task assignment if assignedUserId is provided
    if (parse.data.assignedUserId && createdTask) {
      const { error: assignmentError } = await supabaseAdmin
        .from("TaskAssignment")
        .insert({
          userId: parse.data.assignedUserId,
          taskId: createdTask.id,
        });

      if (assignmentError) {
        console.error("Error creating task assignment:", assignmentError);
        // Don't fail the whole operation for assignment errors
      }
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

    revalidatePath(`/projects/boards/${parse.data.boardId}`);

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
      console.error("Update data:", {
        title: parse.data.title,
        description: parse.data.description,
        id: parse.data.id,
      });
      return { success: false, message: MESSAGES.TASK.UPDATE_FAILURE };
    }

    revalidatePath(`/projects/boards/${parse.data.boardId}`);
    revalidatePath(`/projects/tasks/${parse.data.id}`);

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

    revalidatePath(`/projects/boards/${parse.data.boardId}`);
    return { success: true, message: MESSAGES.TASK.DELETE_SUCCESS };
  } catch (e) {
    return { success: false, message: MESSAGES.TASK.DELETE_FAILURE };
  }
}

// Update Task Position (for drag and drop)
export async function handleUpdateTaskPosition(data: {
  id: string;
  columnId?: string;
  order?: number;
  boardId?: string;
}) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { success: false, message: MESSAGES.AUTH.REQUIRED };
  }

  const UpdatePositionSchema = z.object({
    id: z.string().min(1, MESSAGES.COMMON.TASK_ID_REQUIRED),
    columnId: z.string().optional(),
    order: z.number().optional(),
    boardId: z.string().optional(),
  });

  const parse = UpdatePositionSchema.safeParse(data);

  if (!parse.success) {
    return {
      success: false,
      message: parse.error.errors.map((e) => e.message).join(", "),
    };
  }

  try {
    // Get the current task data including title and column info
    const { data: currentTask, error: fetchError } = await supabaseAdmin
      .from("Task")
      .select("columnId, order, title, Column:Column!Task_columnId_fkey(title)")
      .eq("id", parse.data.id)
      .single();

    if (fetchError || !currentTask) {
      console.error("Error fetching task:", fetchError);
      return { success: false, message: "Task not found" };
    }

    const updateData: any = {};
    if (parse.data.columnId !== undefined) {
      updateData.columnId = parse.data.columnId;
    }
    if (parse.data.order !== undefined) {
      updateData.order = parse.data.order;
    }

    // Update the task position
    const { error } = await supabaseAdmin
      .from("Task")
      .update(updateData)
      .eq("id", parse.data.id);

    if (error) {
      console.error("Error updating task position:", error);
      return { success: false, message: "Failed to update task position" };
    }

    // If boardId is provided, revalidate the board path
    if (parse.data.boardId) {
      revalidatePath(`/projects/boards/${parse.data.boardId}`);
    }

    // If column changed, create activity with proper content
    if (parse.data.columnId && parse.data.columnId !== currentTask.columnId) {
      // Fetch new column info
      const { data: newColumn } = await supabaseAdmin
        .from("Column")
        .select("title")
        .eq("id", parse.data.columnId)
        .single();

      // Get user info
      const { data: user } = await supabaseAdmin
        .from("User")
        .select("name, email")
        .eq("id", userId)
        .single();

      await logActivity({
        type: ActivityType.TASK_MOVED,
        content: formatActivityContent({
          action: "moved",
          userName: user?.name || user?.email || "User",
          entityType: "task",
          entityName: currentTask.title,
          details: `from "${(currentTask as any).Column?.title || 'Unknown'}" to "${newColumn?.title || 'Unknown'}"`,
        }),
        userId: userId,
        taskId: parse.data.id,
        oldColumnId: currentTask.columnId,
        newColumnId: parse.data.columnId,
        boardId: parse.data.boardId,
      });
    }

    return { success: true, message: "Task position updated" };
  } catch (e) {
    console.error("Error in handleUpdateTaskPosition:", e);
    return { success: false, message: "Failed to update task position" };
  }
}
