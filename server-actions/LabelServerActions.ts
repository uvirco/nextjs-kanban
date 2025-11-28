"use server";
import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function handleSaveLabel({
  labelId,
  taskId,
  boardId,
}: {
  labelId: string;
  taskId: string;
  boardId: string;
}) {
  if (!labelId || !taskId) {
    return { success: false, message: "Label ID or Task ID is missing" };
  }

  try {
    const { error } = await supabaseAdmin
      .from('_LabelToTask')
      .insert({
        A: labelId,
        B: taskId,
      });

    if (error) {
      console.error("Error adding label to task:", error);
      return { success: false, message: "Failed to associate label with task" };
    }

    revalidatePath(`/board/${boardId}`);

    return { success: true, message: "Label added to task" };
  } catch (e) {
    console.error("Error adding label to task:", e);
    return { success: false, message: "Failed to associate label with task" };
  }
}

export async function handleRemoveLabel({
  labelId,
  taskId,
  boardId,
}: {
  labelId: string;
  taskId: string;
  boardId: string;
}) {
  if (!labelId || !taskId) {
    return { success: false, message: "Label ID or Task ID is missing" };
  }

  try {
    const { error } = await supabaseAdmin
      .from('_LabelToTask')
      .delete()
      .eq('A', labelId)
      .eq('B', taskId);

    if (error) {
      console.error("Error removing label from task:", error);
      return { success: false, message: "Failed to remove label from task" };
    }

    revalidatePath(`/board/${boardId}`);

    return { success: true, message: "Label removed from task" };
  } catch (e) {
    console.error("Error removing label from task:", e);
    return { success: false, message: "Failed to remove label from task" };
  }
}

export async function handleUpdateLabel({
  labelId,
  color,
  title,
  boardId,
}: {
  labelId: string;
  color: string;
  title: string;
  boardId: string;
}) {
  if (!labelId || !color) {
    return { success: false, message: "Label ID or Task ID is missing" };
  }

  try {
    const { error } = await supabaseAdmin
      .from('Label')
      .update({
        title: title,
        color: color,
      })
      .eq('id', labelId);

    if (error) {
      console.error("Error updating label:", error);
      return { success: false, message: "Failed to update label" };
    }

    revalidatePath(`/board/${boardId}`);

    return { success: true, message: "Label updated" };
  } catch (e) {
    return { success: false, message: "Failed to update label" };
  }
}

export async function handleCreateLabel({
  color,
  title,
  boardId,
  taskId,
}: {
  color: string;
  title: string;
  boardId: string;
  taskId: string;
}) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { success: false, message: "User not authenticated" };
  }

  if (!color) {
    return { success: false, message: "Color is missing" };
  }

  try {
    const { data: createdLabel, error: createError } = await supabaseAdmin
      .from('Label')
      .insert({
        userId: userId,
        title: title,
        color: color,
        boardId: boardId,
      })
      .select()
      .single();

    if (createError) {
      console.error("Error creating label:", createError);
      return { success: false, message: "Failed to create label" };
    }

    if (taskId && createdLabel) {
      const { error: linkError } = await supabaseAdmin
        .from('_LabelToTask')
        .insert({
          A: createdLabel.id,
          B: taskId,
        });

      if (linkError) {
        console.error("Error linking label to task:", linkError);
      }
    }

    revalidatePath(`/board/${boardId}`);

    return {
      success: true,
      message: "Label created and added to task",
      newLabelId: createdLabel.id,
    };
  } catch (e) {
    console.error("Error creating label:", e);
    return { success: false, message: "Failed to create label" };
  }
}

export async function handleDeleteLabel({
  labelId,
  boardId,
}: {
  labelId: string;
  boardId: string;
}) {
  if (!labelId) {
    return { success: false, message: "Label ID or Task ID is missing" };
  }

  try {
    const { error } = await supabaseAdmin
      .from('Label')
      .delete()
      .eq('id', labelId);

    if (error) {
      console.error("Error deleting label:", error);
      return { success: false, message: "Failed to remove label" };
    }

    revalidatePath(`/board/${boardId}`);

    return { success: true, message: "Label removed" };
  } catch (e) {
    return { success: false, message: "Failed to remove label" };
  }
}
