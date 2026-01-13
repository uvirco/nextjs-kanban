"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase";
import { auth } from "@/auth";
import { MESSAGES } from "@/utils/messages";

// Edit Task Description
export async function handleEditTaskDescription(
  taskId: string,
  boardId: string,
  description: string
) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { success: false, message: MESSAGES.AUTH.REQUIRED };
  }

  const EditTaskDescriptionSchema = z.object({
    taskId: z.string().min(1, MESSAGES.COMMON.TASK_ID_REQUIRED),
    boardId: z.string().min(1, MESSAGES.COMMON.BOARD_ID_REQUIRED),
    description: z.string(),
  });

  const parse = EditTaskDescriptionSchema.safeParse({
    taskId,
    boardId,
    description,
  });

  if (!parse.success) {
    return {
      success: false,
      message: parse.error.errors.map((e) => e.message).join(", "),
    };
  }

  try {
    const { error } = await supabaseAdmin
      .from("Task")
      .update({ description: parse.data.description })
      .eq("id", parse.data.taskId);

    if (error) {
      console.error("Error updating description:", error);
      return { success: false, message: MESSAGES.DESCRIPTION.UPDATE_FAILURE };
    }

    revalidatePath(`/projects/boards/${parse.data.boardId}`);
    revalidatePath(`/projects/tasks/${parse.data.taskId}`);

    return { success: true, message: MESSAGES.DESCRIPTION.UPDATE_SUCCESS };
  } catch (e) {
    return { success: false, message: MESSAGES.DESCRIPTION.UPDATE_FAILURE };
  }
}

// Delete Task Description
export async function handleDeleteTaskDescription(
  taskId: string,
  boardId: string
) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { success: false, message: MESSAGES.AUTH.REQUIRED };
  }

  const DeleteTaskDescriptionSchema = z.object({
    taskId: z.string().min(1, MESSAGES.COMMON.TASK_ID_REQUIRED),
    boardId: z.string().min(1, MESSAGES.COMMON.BOARD_ID_REQUIRED),
  });

  const parse = DeleteTaskDescriptionSchema.safeParse({ taskId, boardId });

  if (!parse.success) {
    return {
      success: false,
      message: parse.error.errors.map((e) => e.message).join(", "),
    };
  }

  try {
    const { error } = await supabaseAdmin
      .from("Task")
      .update({ description: null })
      .eq("id", parse.data.taskId);

    if (error) {
      console.error("Error deleting description:", error);
      return { success: false, message: MESSAGES.DESCRIPTION.DELETE_FAILURE };
    }

    revalidatePath(`/projects/boards/${parse.data.boardId}`);
    revalidatePath(`/projects/tasks/${parse.data.taskId}`);

    return { success: true, message: MESSAGES.DESCRIPTION.DELETE_SUCCESS };
  } catch (e) {
    return { success: false, message: MESSAGES.DESCRIPTION.DELETE_FAILURE };
  }
}
