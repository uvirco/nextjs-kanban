"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { MESSAGES } from "@/utils/messages";
import { supabaseAdmin } from "@/lib/supabase";

// Create a new checklist
export async function handleCreateChecklist({
  title,
  taskId,
  boardId,
}: {
  title?: string;
  taskId: string;
  boardId: string;
}) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { success: false, message: MESSAGES.AUTH.REQUIRED };
  }

  const CreateChecklistSchema = z.object({
    title: z
      .string()
      .trim()
      .max(100, MESSAGES.CHECKLIST.TITLE_TOO_LONG)
      .optional(),
    taskId: z.string().min(1, MESSAGES.COMMON.TASK_ID_REQUIRED),
    boardId: z.string().min(1, MESSAGES.COMMON.BOARD_ID_REQUIRED),
  });

  const parse = CreateChecklistSchema.safeParse({ title, taskId, boardId });

  if (!parse.success) {
    return {
      success: false,
      message: parse.error.errors.map((e) => e.message).join(", "),
    };
  }

  try {
    const { error } = await supabaseAdmin.from("Checklist").insert({
      title: parse.data.title,
      taskId: parse.data.taskId,
    });

    if (error) {
      console.error(error);
      return { success: false, message: MESSAGES.CHECKLIST.CREATE_FAILURE };
    }

    revalidatePath(`/board/${parse.data.boardId}`);

    return { success: true, message: MESSAGES.CHECKLIST.CREATE_SUCCESS };
  } catch (e) {
    console.error(e);
    return { success: false, message: MESSAGES.CHECKLIST.CREATE_FAILURE };
  }
}

// Edit Checklist Name
export async function handleEditChecklistName(formData: FormData) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { success: false, message: MESSAGES.AUTH.REQUIRED };
  }

  const EditChecklistNameSchema = z.object({
    title: z
      .string()
      .trim()
      .max(100, MESSAGES.CHECKLIST.TITLE_TOO_LONG)
      .optional(),
    checklistId: z.string().min(1, MESSAGES.COMMON.CHECKLIST_ID_REQUIRED),
    taskId: z.string().min(1, MESSAGES.COMMON.TASK_ID_REQUIRED),
  });

  const parse = EditChecklistNameSchema.safeParse({
    title: formData.get("title")?.toString(),
    checklistId: formData.get("checklistId")?.toString(),
    taskId: formData.get("taskId")?.toString(),
  });

  if (!parse.success) {
    return {
      success: false,
      message: parse.error.errors.map((e) => e.message).join(", "),
    };
  }

  try {
    const { error } = await supabaseAdmin
      .from("Checklist")
      .update({ title: parse.data.title })
      .eq("id", parse.data.checklistId);

    if (error) {
      console.error(error);
      return { success: false, message: "Failed to update checklist name" };
    }

    revalidatePath(`/task/${parse.data.taskId}`);
    revalidatePath(`/epics/${parse.data.taskId}`); // Also revalidate epic pages

    return { success: true, message: "Checklist title updated" };
  } catch (e) {
    console.error(e);
    return { success: false, message: "Failed to update checklist name" };
  }
}

// Delete a checklist
export async function handleDeleteChecklist({
  checklistId,
  taskId,
}: {
  checklistId: string;
  taskId: string;
}) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { success: false, message: MESSAGES.AUTH.REQUIRED };
  }

  const DeleteChecklistSchema = z.object({
    checklistId: z.string().min(1, MESSAGES.COMMON.CHECKLIST_ID_REQUIRED),
    taskId: z.string().min(1, MESSAGES.COMMON.TASK_ID_REQUIRED),
  });

  const parse = DeleteChecklistSchema.safeParse({ checklistId, taskId });

  if (!parse.success) {
    return {
      success: false,
      message: parse.error.errors.map((e) => e.message).join(", "),
    };
  }

  try {
    const { error } = await supabaseAdmin
      .from("Checklist")
      .delete()
      .eq("id", parse.data.checklistId);

    if (error) {
      console.error(error);
      return { success: false, message: MESSAGES.CHECKLIST.DELETE_FAILURE };
    }

    revalidatePath(`/task/${parse.data.taskId}`);
    revalidatePath(`/epics/${parse.data.taskId}`); // Also revalidate epic pages
    return { success: true, message: MESSAGES.CHECKLIST.DELETE_SUCCESS };
  } catch (e) {
    console.error(e);
    return { success: false, message: MESSAGES.CHECKLIST.DELETE_FAILURE };
  }
}

// Create a new checklist item
export async function handleCreateChecklistItem({
  content,
  checklistId,
  taskId,
}: {
  content: string;
  checklistId: string;
  taskId: string;
}) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { success: false, message: MESSAGES.AUTH.REQUIRED };
  }

  const CreateChecklistItemSchema = z.object({
    content: z
      .string()
      .trim()
      .min(1, MESSAGES.CHECKLIST_ITEM.CONTENT_TOO_SHORT)
      .max(100, MESSAGES.CHECKLIST_ITEM.CONTENT_TOO_LONG),
    checklistId: z.string().min(1, MESSAGES.COMMON.CHECKLIST_ID_REQUIRED),
    taskId: z.string().min(1, MESSAGES.COMMON.TASK_ID_REQUIRED),
  });

  const data = { content, checklistId, taskId };
  const parse = CreateChecklistItemSchema.safeParse(data);

  if (!parse.success) {
    return {
      success: false,
      message: parse.error.errors.map((e) => e.message).join(", "),
    };
  }

  try {
    const { error } = await supabaseAdmin.from("ChecklistItem").insert({
      content: parse.data.content,
      isChecked: false,
      checklistId: parse.data.checklistId,
    });

    if (error) {
      console.error(error);
      return {
        success: false,
        message: MESSAGES.CHECKLIST_ITEM.CREATE_FAILURE,
      };
    }

    revalidatePath(`/task/${parse.data.taskId}`);
    revalidatePath(`/epics/${parse.data.taskId}`); // Also revalidate epic pages

    return { success: true, message: MESSAGES.CHECKLIST.CREATE_SUCCESS };
  } catch (e) {
    console.error(e);
    return { success: false, message: MESSAGES.CHECKLIST_ITEM.CREATE_FAILURE };
  }
}

// Delete a checklist item.
export async function handleDeleteChecklistItem({
  checklistItemId,
  taskId,
}: {
  checklistItemId: string;
  taskId: string;
}) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { success: false, message: MESSAGES.AUTH.REQUIRED };
  }

  const DeleteChecklistItemSchema = z.object({
    checklistItemId: z
      .string()
      .min(1, MESSAGES.COMMON.CHECKLIST_ITEM_ID_REQUIRED),
    taskId: z.string().min(1, MESSAGES.COMMON.TASK_ID_REQUIRED),
  });

  const data = { checklistItemId, taskId };
  const parse = DeleteChecklistItemSchema.safeParse(data);

  if (!parse.success) {
    return {
      success: false,
      message: parse.error.errors.map((e) => e.message).join(", "),
    };
  }

  try {
    const { error } = await supabaseAdmin
      .from("ChecklistItem")
      .delete()
      .eq("id", parse.data.checklistItemId);

    if (error) {
      console.error(error);
      return {
        success: false,
        message: MESSAGES.CHECKLIST_ITEM.DELETE_FAILURE,
      };
    }

    revalidatePath(`/task/${parse.data.taskId}`);
    revalidatePath(`/epics/${parse.data.taskId}`); // Also revalidate epic pages

    return { success: true, message: MESSAGES.CHECKLIST_ITEM.DELETE_SUCCESS };
  } catch (e) {
    console.error(e);
    return { success: false, message: MESSAGES.CHECKLIST_ITEM.DELETE_FAILURE };
  }
}

// Toggle a checklist item.
export async function handleToggleCheckedItem({
  checklistItemId,
  isChecked,
  taskId,
}: {
  checklistItemId: string;
  isChecked: boolean;
  taskId: string;
}) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { success: false, message: MESSAGES.AUTH.REQUIRED };
  }

  const ToggleCheckedItemSchema = z.object({
    checklistItemId: z
      .string()
      .min(1, MESSAGES.COMMON.CHECKLIST_ITEM_ID_REQUIRED),
    isChecked: z.boolean(),
    taskId: z.string().min(1, MESSAGES.COMMON.TASK_ID_REQUIRED),
  });

  const data = { checklistItemId, isChecked, taskId };
  const parse = ToggleCheckedItemSchema.safeParse(data);

  if (!parse.success) {
    return {
      success: false,
      message: parse.error.errors.map((e) => e.message).join(", "),
    };
  }

  try {
    const { error } = await supabaseAdmin
      .from("ChecklistItem")
      .update({ isChecked: parse.data.isChecked })
      .eq("id", parse.data.checklistItemId);

    if (error) {
      console.error(error);
      return {
        success: false,
        message: MESSAGES.CHECKLIST_ITEM.TOGGLE_FAILURE,
      };
    }

    revalidatePath(`/task/${parse.data.taskId}`);
    revalidatePath(`/epics/${parse.data.taskId}`); // Also revalidate epic pages

    return { success: true, message: MESSAGES.CHECKLIST_ITEM.TOGGLE_SUCCESS };
  } catch (e) {
    console.error(e);
    return { success: false, message: MESSAGES.CHECKLIST_ITEM.TOGGLE_FAILURE };
  }
}

export async function handleEditChecklistItemContent(formData: FormData) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { success: false, message: MESSAGES.AUTH.REQUIRED };
  }

  const EditChecklistItemContentSchema = z.object({
    content: z
      .string()
      .trim()
      .min(1, MESSAGES.CHECKLIST_ITEM.CONTENT_TOO_SHORT)
      .max(100, MESSAGES.CHECKLIST_ITEM.CONTENT_TOO_LONG),
    checklistItemId: z
      .string()
      .min(1, MESSAGES.COMMON.CHECKLIST_ITEM_ID_REQUIRED),
    taskId: z.string().min(1, MESSAGES.COMMON.TASK_ID_REQUIRED),
  });

  const parse = EditChecklistItemContentSchema.safeParse({
    content: formData.get("content")?.toString(),
    checklistItemId: formData.get("checklistItemId")?.toString(),
    taskId: formData.get("taskId")?.toString(),
  });

  if (!parse.success) {
    return {
      success: false,
      message: parse.error.errors.map((e) => e.message).join(", "),
    };
  }

  try {
    const { error } = await supabaseAdmin
      .from("ChecklistItem")
      .update({ content: parse.data.content })
      .eq("id", parse.data.checklistItemId);

    if (error) {
      console.error(error);
      return {
        success: false,
        message: MESSAGES.CHECKLIST_ITEM.UPDATE_FAILURE,
      };
    }

    revalidatePath(`/task/${parse.data.taskId}`);
    revalidatePath(`/epics/${parse.data.taskId}`); // Also revalidate epic pages

    return { success: true, message: MESSAGES.CHECKLIST_ITEM.UPDATE_SUCCESS };
  } catch (e) {
    console.error(e);
    return {
      success: false,
      message: MESSAGES.CHECKLIST_ITEM.UPDATE_FAILURE,
    };
  }
}
