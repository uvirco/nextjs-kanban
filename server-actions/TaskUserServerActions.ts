"use server";
import { supabaseAdmin } from "@/lib/supabase";
import { auth } from "@/auth";
import { z } from "zod";
import { MESSAGES } from "@/utils/messages";
import { revalidatePath } from "next/cache";
import { ActivityType } from "@/types/types";

// Add User to Task
export async function handleAddUserToTask(
  targetUserId: string,
  taskId: string,
  boardId: string
) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { success: false, message: MESSAGES.AUTH.REQUIRED };
  }

  const AddUserToTaskSchema = z.object({
    targetUserId: z.string().min(1, MESSAGES.COMMON.USER_ID_REQUIRED),
    taskId: z.string().min(1, MESSAGES.COMMON.TASK_ID_REQUIRED),
    boardId: z.string().min(1, MESSAGES.COMMON.BOARD_ID_REQUIRED),
  });

  const parse = AddUserToTaskSchema.safeParse({
    targetUserId,
    taskId,
    boardId,
  });

  if (!parse.success) {
    return {
      success: false,
      message: parse.error.errors.map((e) => e.message).join(", "),
    };
  }

  try {
    const { error: assignmentError } = await supabaseAdmin
      .from("TaskAssignment")
      .insert({
        userId: parse.data.targetUserId,
        taskId: parse.data.taskId,
      });

    if (assignmentError) {
      console.error("Error creating task assignment:", assignmentError);
      return { success: false, message: MESSAGES.USER_TO_TASK.CREATE_FAILURE };
    }

    const { error: activityError } = await supabaseAdmin
      .from("Activity")
      .insert({
        type: ActivityType.TASK_ASSIGNED,
        userId: userId,
        taskId: parse.data.taskId,
        boardId: parse.data.boardId,
        targetUserId: parse.data.targetUserId,
      });

    if (activityError) {
      console.error("Error creating activity:", activityError);
      // Don't fail the whole operation for activity errors
    }

    revalidatePath(`/board/${parse.data.boardId}`);

    return {
      success: true,
      message: MESSAGES.USER_TO_TASK.CREATE_SUCCESS,
    };
  } catch (e) {
    return { success: false, message: MESSAGES.USER_TO_TASK.CREATE_FAILURE };
  }
}

// Remove User from Task
export async function handleRemoveUserFromTask(
  targetUserId: string,
  taskId: string,
  boardId: string
) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { success: false, message: MESSAGES.AUTH.REQUIRED };
  }

  const RemoveUserFromTaskSchema = z.object({
    targetUserId: z.string().min(1, MESSAGES.COMMON.USER_ID_REQUIRED),
    taskId: z.string().min(1, MESSAGES.COMMON.TASK_ID_REQUIRED),
    boardId: z.string().min(1, MESSAGES.COMMON.BOARD_ID_REQUIRED),
  });

  const parse = RemoveUserFromTaskSchema.safeParse({
    targetUserId,
    taskId,
    boardId,
  });

  if (!parse.success) {
    return {
      success: false,
      message: parse.error.errors.map((e) => e.message).join(", "),
    };
  }

  try {
    const { error: assignmentError } = await supabaseAdmin
      .from("TaskAssignment")
      .delete()
      .eq("userId", parse.data.targetUserId)
      .eq("taskId", parse.data.taskId);

    if (assignmentError) {
      console.error("Error deleting task assignment:", assignmentError);
      return { success: false, message: MESSAGES.USER_TO_TASK.DELETE_FAILURE };
    }

    const { error: activityError } = await supabaseAdmin
      .from("Activity")
      .insert({
        type: ActivityType.TASK_UNASSIGNED,
        userId: userId,
        taskId: parse.data.taskId,
        boardId: parse.data.boardId,
        targetUserId: parse.data.targetUserId,
      });

    if (activityError) {
      console.error("Error creating activity:", activityError);
      // Don't fail the whole operation for activity errors
    }

    revalidatePath(`/board/${parse.data.boardId}`);

    return {
      success: true,
      message: MESSAGES.USER_TO_TASK.DELETE_SUCCESS,
    };
  } catch (e) {
    return { success: false, message: MESSAGES.USER_TO_TASK.DELETE_FAILURE };
  }
}
