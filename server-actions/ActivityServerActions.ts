"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ActivityType } from "@/types/types";
import { supabaseAdmin } from "@/lib/supabase";
import { auth } from "@/auth";
import { MESSAGES } from "@/utils/messages";

// Create Activity
export async function handleCreateActivity(
  taskId: string,
  boardId: string,
  content: string
) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { success: false, message: MESSAGES.AUTH.REQUIRED };
  }

  const data = { taskId, boardId, content };

  const CreateActivitySchema = z.object({
    taskId: z.string().min(1, MESSAGES.COMMON.TASK_ID_REQUIRED),
    boardId: z.string().min(1, MESSAGES.COMMON.BOARD_ID_REQUIRED),
    content: z
      .string()
      .trim()
      .min(1, MESSAGES.ACTIVITY.CONTENT_TOO_SHORT)
      .max(10000, "Content too long (max 10000 chars)"),
  });

  const parse = CreateActivitySchema.safeParse(data);

  if (!parse.success) {
    return {
      success: false,
      message: parse.error.errors.map((e) => e.message).join(", "),
    };
  }

  try {
    const { error } = await supabaseAdmin.from("Activity").insert({
      type: ActivityType.COMMENT_ADDED,
      content: parse.data.content,
      userId: userId,
      taskId: parse.data.taskId,
      boardId: parse.data.boardId,
    });

    if (error) {
      console.error("[Activity Create Error]", error);
      return { success: false, message: MESSAGES.ACTIVITY.CREATE_FAILURE };
    }

    // Revalidate multiple paths to ensure page updates
    revalidatePath(`/projects/tasks/${taskId}`);
    revalidatePath(`/projects/tasks`);
    revalidatePath("/");

    return { success: true, message: MESSAGES.ACTIVITY.CREATE_SUCCESS };
  } catch (e) {
    console.error("[Activity Create Exception]", e);
    return { success: false, message: MESSAGES.ACTIVITY.CREATE_FAILURE };
  }
}

// Delete Activity
export async function handleDeleteActivity(data: {
  boardId: string;
  activityId: string;
}) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { success: false, message: MESSAGES.AUTH.REQUIRED };
  }

  const DeleteActivitySchema = z.object({
    boardId: z.string().min(1, MESSAGES.COMMON.BOARD_ID_REQUIRED),
    activityId: z.string().min(1, MESSAGES.COMMON.ACTIVITY_ID_REQUIRED),
  });

  const parse = DeleteActivitySchema.safeParse(data);

  if (!parse.success) {
    return {
      success: false,
      message: parse.error.errors.map((e) => e.message).join(", "),
    };
  }

  try {
    const { error } = await supabaseAdmin
      .from("Activity")
      .delete()
      .eq("id", parse.data.activityId);

    if (error) {
      return { success: false, message: MESSAGES.ACTIVITY.DELETE_FAILURE };
    }

    revalidatePath(`/board/${parse.data.boardId}`);
    return { success: true, message: MESSAGES.ACTIVITY.DELETE_SUCCESS };
  } catch (e) {
    return { success: false, message: MESSAGES.ACTIVITY.DELETE_FAILURE };
  }
}

// Fetch Activities
export async function handleFetchActivities(taskId: string) {
  try {
    console.log("[handleFetchActivities] Fetching for taskId:", taskId);
    const { data: activities, error } = await supabaseAdmin
      .from("Activity")
      .select("*, user:User!userId(*)")
      .eq("taskId", taskId)
      .order("createdAt", { ascending: false });

    console.log("[handleFetchActivities] Error:", error);
    console.log("[handleFetchActivities] Activities:", activities);

    if (error) {
      console.error("[Activity Fetch Error]", error);
      return { success: false, activities: [], message: error.message || MESSAGES.ACTIVITY.CREATE_FAILURE };
    }

    return { success: true, activities: activities || [], message: "" };
  } catch (e) {
    console.error("[Activity Fetch Exception]", e);
    return { success: false, activities: [], message: (e as any).message || MESSAGES.ACTIVITY.CREATE_FAILURE };
  }
}
