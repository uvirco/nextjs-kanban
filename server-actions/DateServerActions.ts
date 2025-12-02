"use server";
import { supabaseAdmin } from "@/lib/supabase";
import { auth } from "@/auth";
import { z } from "zod";
import { MESSAGES } from "@/utils/messages";
import { revalidatePath } from "next/cache";
import {
  TaskCreationData,
  TaskEditData,
  TaskDeletionData,
} from "@/types/types";
import { ActivityType } from "@/types/types";

// Add/update a date
export async function handleAddDate(data: {
  taskId: string;
  date: string;
  boardId: string;
  dateType: "startDate" | "dueDate";
}) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { success: false, message: MESSAGES.AUTH.REQUIRED };
  }

  const AddDateSchema = z.object({
    taskId: z.string().min(1, MESSAGES.COMMON.TASK_ID_REQUIRED),
    date: z.string().min(1, MESSAGES.COMMON.DATE_REQUIRED),
    boardId: z.string().min(1, MESSAGES.COMMON.BOARD_ID_REQUIRED),
    dateType: z.enum(["startDate", "dueDate"]),
  });

  const parse = AddDateSchema.safeParse(data);

  if (!parse.success) {
    return {
      success: false,
      message: parse.error.errors.map((e) => e.message).join(", "),
    };
  }

  try {
    const dateObject = new Date(data.date);

    const { data: existingTask, error: fetchError } = await supabaseAdmin
      .from("Task")
      .select(data.dateType)
      .eq("id", data.taskId)
      .single();

    if (fetchError) {
      console.error("Error fetching task:", fetchError);
      return { success: false, message: MESSAGES.DATE.CREATE_FAILURE };
    }

    const { error: updateError } = await supabaseAdmin
      .from("Task")
      .update({ [data.dateType]: dateObject.toISOString() })
      .eq("id", data.taskId);

    if (updateError) {
      console.error("Error updating task date:", updateError);
      return { success: false, message: MESSAGES.DATE.CREATE_FAILURE };
    }

    const activityType =
      existingTask && ((existingTask as any)[data.dateType])
        ? data.dateType === "dueDate"
          ? ActivityType.DUE_DATE_UPDATED
          : ActivityType.START_DATE_UPDATED
        : data.dateType === "dueDate"
          ? ActivityType.DUE_DATE_ADDED
          : ActivityType.START_DATE_ADDED;

    const { error: activityError } = await supabaseAdmin
      .from("Activity")
      .insert({
        type: activityType,
        taskId: data.taskId,
        userId: userId,
        [data.dateType]: dateObject.toISOString(),
      });

    if (activityError) {
      console.error("Error creating activity:", activityError);
      // Don't fail the whole operation for activity errors
    }

    revalidatePath(`/board/${data.boardId}`);
    return {
      success: true,
      message: MESSAGES.DATE.CREATE_SUCCESS,
    };
  } catch (e) {
    return {
      success: false,
      message: MESSAGES.DATE.CREATE_FAILURE,
    };
  }
}

// Remove a date
export async function handleRemoveDate(data: {
  taskId: string;
  boardId: string;
  dateType: "startDate" | "dueDate";
}) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { success: false, message: MESSAGES.AUTH.REQUIRED };
  }

  try {
    const { error: updateError } = await supabaseAdmin
      .from("Task")
      .update({ [data.dateType]: null })
      .eq("id", data.taskId);

    if (updateError) {
      console.error("Error removing task date:", updateError);
      return { success: false, message: MESSAGES.DATE.DELETE_FAILURE };
    }

    const activityType =
      data.dateType === "dueDate"
        ? ActivityType.DUE_DATE_REMOVED
        : ActivityType.START_DATE_REMOVED;

    const { error: activityError } = await supabaseAdmin
      .from("Activity")
      .insert({
        type: activityType,
        taskId: data.taskId,
        userId: userId,
      });

    if (activityError) {
      console.error("Error creating activity:", activityError);
      // Don't fail the whole operation for activity errors
    }

    revalidatePath(`/board/${data.boardId}`);
    return {
      success: true,
      message: MESSAGES.DATE.DELETE_SUCCESS,
    };
  } catch (e) {
    return {
      success: false,
      message: MESSAGES.DATE.DELETE_FAILURE,
    };
  }
}
