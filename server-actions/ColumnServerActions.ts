"use server";
import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { MESSAGES } from "@/utils/messages";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Create Column
export async function handleCreateColumn(data: {
  boardId: string;
  title: string;
}) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { success: false, message: MESSAGES.AUTH.REQUIRED };
  }

  const CreateColumnSchema = z.object({
    boardId: z.string().min(1, MESSAGES.COMMON.COLUMN_ID_REQUIRED),
    title: z.string().min(3, MESSAGES.COLUMN.TITLE_TOO_SHORT),
  });

  const parse = CreateColumnSchema.safeParse(data);

  if (!parse.success) {
    return {
      success: false,
      message: parse.error.errors.map((e) => e.message).join(", "),
    };
  }

  try {
    const { data: maxOrderColumn, error: maxError } = await supabaseAdmin
      .from("Column")
      .select("order")
      .eq("boardId", parse.data.boardId)
      .order("order", { ascending: false })
      .limit(1)
      .single();

    if (maxError && maxError.code !== "PGRST116") {
      console.error("Error finding max order:", maxError);
      return { success: false, message: MESSAGES.COLUMN.CREATE_FAILURE };
    }

    const newOrder = (maxOrderColumn?.order || 0) + 1;

    const { error: createError } = await supabaseAdmin.from("Column").insert({
      title: parse.data.title,
      boardId: parse.data.boardId,
      order: newOrder,
    });

    if (createError) {
      console.error("Error creating column:", createError);
      return { success: false, message: MESSAGES.COLUMN.CREATE_FAILURE };
    }

    revalidatePath(`/board/${parse.data.boardId}`);

    return { success: true, message: MESSAGES.COLUMN.CREATE_SUCCESS };
  } catch (e) {
    console.error("Error creating column:", e);
    return { success: false, message: MESSAGES.COLUMN.CREATE_FAILURE };
  }
}

// Edit Column
export async function handleEditColumn(data: {
  columnId: string;
  boardId: string;
  title: string;
}) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { success: false, message: MESSAGES.AUTH.REQUIRED };
  }

  const EditColumnSchema = z.object({
    columnId: z.string().min(1, MESSAGES.COMMON.COLUMN_ID_REQUIRED),
    boardId: z.string().min(1, MESSAGES.COMMON.BOARD_ID_REQUIRED),
    title: z.string().min(3, MESSAGES.COLUMN.TITLE_TOO_SHORT),
  });

  const parse = EditColumnSchema.safeParse(data);

  if (!parse.success) {
    return {
      success: false,
      message: parse.error.errors.map((e) => e.message).join(", "),
    };
  }

  try {
    const { error } = await supabaseAdmin
      .from("Column")
      .update({ title: parse.data.title })
      .eq("id", parse.data.columnId);

    if (error) {
      console.error("Error updating column:", error);
      return { success: false, message: MESSAGES.COLUMN.UPDATE_FAILURE };
    }

    revalidatePath(`/board/${parse.data.boardId}`);

    return { success: true, message: MESSAGES.COLUMN.UPDATE_SUCCESS };
  } catch (e) {
    console.error("Error updating column:", e);
    return { success: false, message: MESSAGES.COLUMN.UPDATE_FAILURE };
  }
}

// Delete Column
export async function handleDeleteColumn(data: {
  columnId: string;
  boardId: string;
}) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { success: false, message: MESSAGES.AUTH.REQUIRED };
  }

  const DeleteColumnSchema = z.object({
    columnId: z.string().min(1, MESSAGES.COMMON.COLUMN_ID_REQUIRED),
    boardId: z.string().min(1, MESSAGES.COMMON.BOARD_ID_REQUIRED),
  });

  const parse = DeleteColumnSchema.safeParse(data);

  if (!parse.success) {
    return {
      success: false,
      message: parse.error.errors.map((e) => e.message).join(", "),
    };
  }

  try {
    const { data: deletedColumn, error: fetchError } = await supabaseAdmin
      .from("Column")
      .select("order")
      .eq("id", parse.data.columnId)
      .single();

    if (fetchError) {
      console.error("Error fetching column:", fetchError);
      return { success: false, message: MESSAGES.COLUMN.DELETE_FAILURE };
    }

    const { error: deleteError } = await supabaseAdmin
      .from("Column")
      .delete()
      .eq("id", parse.data.columnId);

    if (deleteError) {
      console.error("Error deleting column:", deleteError);
      return { success: false, message: MESSAGES.COLUMN.DELETE_FAILURE };
    }

    if (deletedColumn) {
      const { data: columnsToUpdate, error: fetchColsError } =
        await supabaseAdmin
          .from("Column")
          .select("id, order")
          .eq("boardId", parse.data.boardId)
          .gt("order", deletedColumn.order);

      if (!fetchColsError && columnsToUpdate) {
        for (const col of columnsToUpdate) {
          await supabaseAdmin
            .from("Column")
            .update({ order: col.order - 1 })
            .eq("id", col.id);
        }
      }
    }

    revalidatePath(`/board/${parse.data.boardId}`);

    return { success: true, message: MESSAGES.COLUMN.DELETE_SUCCESS };
  } catch (e) {
    console.error("Error deleting column:", e);
    return { success: false, message: MESSAGES.COLUMN.DELETE_FAILURE };
  }
}

// Delete Tasks Within a Column
export async function handleDeleteColumnTasks(data: {
  columnId: string;
  boardId: string;
}) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { success: false, message: MESSAGES.AUTH.REQUIRED };
  }

  const DeleteColumnTasksSchema = z.object({
    columnId: z.string().min(1, MESSAGES.COMMON.COLUMN_ID_REQUIRED),
    boardId: z.string().min(1, MESSAGES.COMMON.BOARD_ID_REQUIRED),
  });

  const parse = DeleteColumnTasksSchema.safeParse(data);

  if (!parse.success) {
    return {
      success: false,
      message: parse.error.errors.map((e) => e.message).join(", "),
    };
  }

  try {
    const { error } = await supabaseAdmin
      .from("Task")
      .delete()
      .eq("columnId", parse.data.columnId);

    if (error) {
      console.error("Error deleting tasks within column:", error);
      return {
        success: false,
        message: MESSAGES.COLUMN.DELETE_COLUMN_TASKS_FAILURE,
      };
    }

    revalidatePath(`/board/${parse.data.boardId}`);

    return {
      success: true,
      message: MESSAGES.COLUMN.DELETE_COLUMN_TASKS_SUCCESS,
    };
  } catch (e) {
    console.error("Error deleting tasks within column:", e);
    return {
      success: false,
      message: MESSAGES.COLUMN.DELETE_COLUMN_TASKS_FAILURE,
    };
  }
}
