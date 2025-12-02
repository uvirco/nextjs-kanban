"use server";
import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { MESSAGES } from "@/utils/messages";
import { ActivityType } from "@/types/types";

// Enums
enum LabelColor {
  GREEN = "green",
  YELLOW = "yellow",
  ORANGE = "orange",
  RED = "red",
  PURPLE = "purple",
  BLUE = "blue",
}

const DEFAULT_LABEL_COLORS: LabelColor[] = [
  LabelColor.GREEN,
  LabelColor.YELLOW,
  LabelColor.ORANGE,
  LabelColor.RED,
  LabelColor.PURPLE,
  LabelColor.BLUE,
];

// Create Board
export async function handleCreateBoard(data: { title: string }) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { success: false, message: MESSAGES.AUTH.REQUIRED };
  }

  const CreateBoardSchema = z.object({
    title: z.string().min(3, MESSAGES.BOARD.TITLE_TOO_SHORT),
  });

  const parse = CreateBoardSchema.safeParse(data);

  if (!parse.success) {
    return {
      success: false,
      message: parse.error.errors.map((e) => e.message).join(", "),
    };
  }

  try {
    // Create board
    const { data: createdBoard, error: boardError } = await supabaseAdmin
      .from("Board")
      .insert({
        title: parse.data.title,
      })
      .select()
      .single();

    if (boardError) {
      console.error("Error creating board:", boardError);
      return { success: false, message: MESSAGES.BOARD.CREATE_FAILURE };
    }

    // Add user as board owner
    const { error: memberError } = await supabaseAdmin
      .from("BoardMember")
      .insert({
        boardId: createdBoard.id,
        userId: userId,
        role: "owner",
      });

    if (memberError) {
      console.error("Error creating board member:", memberError);
      return { success: false, message: MESSAGES.BOARD.CREATE_FAILURE };
    }

    await createDefaultLabelsForBoard(createdBoard.id, userId);

    revalidatePath("/board/");

    return {
      success: true,
      message: MESSAGES.BOARD.CREATE_SUCCESS,
      boardId: createdBoard.id,
    };
  } catch (e) {
    console.error("Error creating board:", e);
    return { success: false, message: MESSAGES.BOARD.CREATE_FAILURE };
  }
}

// Function to create default labels for a board
async function createDefaultLabelsForBoard(boardId: string, userId: string) {
  const labels = DEFAULT_LABEL_COLORS.map((color) => ({
    color: color,
    title: null,
    boardId: boardId,
    isDefault: true,
    userId: userId,
  }));

  const { error } = await supabaseAdmin.from("Label").insert(labels);

  if (error) {
    console.error("Error creating default labels:", error);
  }
}

// Edit Board
export async function handleEditBoard(data: {
  boardId: string;
  title: string;
}) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { success: false, message: MESSAGES.AUTH.REQUIRED };
  }

  const EditBoardSchema = z.object({
    boardId: z.string().min(1, MESSAGES.COMMON.BOARD_ID_REQUIRED),
    title: z.string().min(3, MESSAGES.BOARD.TITLE_TOO_SHORT),
  });

  const parse = EditBoardSchema.safeParse(data);

  if (!parse.success) {
    return {
      success: false,
      message: parse.error.errors.map((e) => e.message).join(", "),
    };
  }

  try {
    const { error } = await supabaseAdmin
      .from("Board")
      .update({
        title: parse.data.title,
      })
      .eq("id", parse.data.boardId);

    if (error) {
      console.error("Error editing board:", error);
      return { success: false, message: MESSAGES.BOARD.UPDATE_FAILURE };
    }

    revalidatePath(`/board/${parse.data.boardId}`);

    return { success: true, message: MESSAGES.BOARD.UPDATE_SUCCESS };
  } catch (e) {
    console.error("Error editing board:", e);
    return { success: false, message: MESSAGES.BOARD.UPDATE_FAILURE };
  }
}

// Delete Board
export async function handleDeleteBoard(boardId: string) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { success: false, message: MESSAGES.AUTH.REQUIRED };
  }

  const DeleteBoardSchema = z
    .string()
    .min(1, MESSAGES.COMMON.BOARD_ID_REQUIRED);

  const parse = DeleteBoardSchema.safeParse(boardId);

  if (!parse.success) {
    return {
      success: false,
      message: parse.error.errors.map((e) => e.message).join(", "),
    };
  }

  try {
    // Check if user is owner
    const { data: owner, error: ownerError } = await supabaseAdmin
      .from("BoardMember")
      .select("*")
      .eq("boardId", parse.data)
      .eq("userId", userId)
      .eq("role", "owner")
      .single();

    if (ownerError || !owner) {
      return { success: false, message: MESSAGES.BOARD.OWNER_ONLY_DELETE };
    }

    // Delete board members first
    const { error: memberDeleteError } = await supabaseAdmin
      .from("BoardMember")
      .delete()
      .eq("boardId", parse.data);

    if (memberDeleteError) {
      console.error("Error deleting board members:", memberDeleteError);
      return { success: false, message: MESSAGES.BOARD.DELETE_FAILURE };
    }

    // Delete the board
    const { error: boardDeleteError } = await supabaseAdmin
      .from("Board")
      .delete()
      .eq("id", parse.data);

    if (boardDeleteError) {
      console.error("Error deleting board:", boardDeleteError);
      return { success: false, message: MESSAGES.BOARD.DELETE_FAILURE };
    }

    revalidatePath(`/board/`);

    return { success: true, message: MESSAGES.BOARD.DELETE_SUCCESS };
  } catch (e) {
    console.error("Error deleting board:", e);
    const error = e as Error;
    return {
      success: false,
      message: error.message || MESSAGES.BOARD.DELETE_FAILURE,
    };
  }
}

// Server action for saving board and task positions.
interface TaskData {
  id: string;
  order: number;
  columnId: string;
}

interface ColumnData {
  id: string;
  order: number;
  tasks: TaskData[];
}

interface BoardData {
  columns: ColumnData[];
  originalColumns: ColumnData[];
}

export async function handleUpdateBoard(boardId: string, boardData: BoardData) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { success: false, message: MESSAGES.AUTH.REQUIRED };
  }

  const taskSchema = z.object({
    id: z.string().min(1, MESSAGES.COMMON.TASK_ID_REQUIRED),
    order: z.number(),
    columnId: z.string().min(1, MESSAGES.COMMON.COLUMN_ID_REQUIRED),
  });

  const columnSchema = z.object({
    id: z.string().min(1, MESSAGES.COMMON.COLUMN_ID_REQUIRED),
    order: z.number(),
    tasks: z.array(taskSchema),
  });

  const UpdateBoardSchema = z.object({
    boardId: z.string().min(1, MESSAGES.COMMON.BOARD_ID_REQUIRED),
    boardData: z.object({
      columns: z.array(columnSchema),
      originalColumns: z.array(columnSchema),
    }),
  });

  const parse = UpdateBoardSchema.safeParse({ boardId, boardData });

  if (!parse.success) {
    return {
      success: false,
      message: parse.error.errors.map((e) => e.message).join(", "),
    };
  }

  try {
    // Update columns
    for (const column of boardData.columns) {
      if (column.id) {
        const { error: columnError } = await supabaseAdmin
          .from("Column")
          .update({ order: column.order })
          .eq("id", column.id);

        if (columnError) {
          console.error("Error updating column:", columnError);
          return { success: false, message: MESSAGES.BOARD.UPDATE_FAILURE };
        }
      }
    }

    // Update tasks and create activity entries if needed
    for (const column of boardData.columns) {
      const originalColumn = boardData.originalColumns.find(
        (col) => col.id === column.id
      );

      for (const task of column.tasks) {
        if (task.id) {
          // Update the task
          const { error: taskError } = await supabaseAdmin
            .from("Task")
            .update({
              order: task.order,
              columnId: column.id,
            })
            .eq("id", task.id);

          if (taskError) {
            console.error("Error updating task:", taskError);
            return { success: false, message: MESSAGES.BOARD.UPDATE_FAILURE };
          }

          // Check if the task has been moved to a different column
          const originalTask = originalColumn?.tasks.find(
            (t) => t.id === task.id
          );

          if (originalTask && originalTask.columnId !== column.id) {
            const { error: activityError } = await supabaseAdmin
              .from("Activity")
              .insert({
                type: ActivityType.TASK_MOVED,
                userId: userId,
                taskId: task.id,
                boardId: boardId,
                oldColumnId: originalTask.columnId,
                newColumnId: column.id,
              });

            if (activityError) {
              console.error("Error creating activity:", activityError);
              // Don't fail the whole operation for activity errors
            }
          }
        }
      }
    }

    revalidatePath(`/board/${parse.data.boardId}`);

    return { success: true, message: MESSAGES.BOARD.UPDATE_SUCCESS };
  } catch (error) {
    console.error("Error updating board:", error);

    return { success: false, message: MESSAGES.BOARD.UPDATE_FAILURE };
  }
}

// Edit Background Image
export async function handleEditBoardImage(url: string, boardId: string) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { success: false, message: MESSAGES.AUTH.REQUIRED };
  }

  const EditBoardImageSchema = z.object({
    url: z.string().min(1, MESSAGES.BG_IMAGE.IMAGE_URL_REQUIRED),
    boardId: z.string().min(1, MESSAGES.COMMON.BOARD_ID_REQUIRED),
  });

  const parse = EditBoardImageSchema.safeParse({ url, boardId });

  if (!parse.success) {
    return {
      success: false,
      message: parse.error.errors.map((e) => e.message).join(", "),
    };
  }

  try {
    const { error } = await supabaseAdmin
      .from("Board")
      .update({
        backgroundUrl: parse.data.url,
      })
      .eq("id", parse.data.boardId);

    if (error) {
      console.error("Error updating board image:", error);
      return { success: false, message: MESSAGES.BG_IMAGE.IMAGE_SAVE_FAILURE };
    }

    revalidatePath(`/board/${parse.data.boardId}`);

    return { success: true, message: MESSAGES.BG_IMAGE.IMAGE_SAVE_SUCCESS };
  } catch (e) {
    console.error("Error updating board image:", e);
    return { success: false, message: MESSAGES.BG_IMAGE.IMAGE_SAVE_FAILURE };
  }
}

// Remove Background Image
export async function handleRemoveBoardImage(boardId: string) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { success: false, message: MESSAGES.AUTH.REQUIRED };
  }

  const RemoveBoardImageSchema = z.object({
    boardId: z.string().min(1, MESSAGES.COMMON.BOARD_ID_REQUIRED),
  });

  const parse = RemoveBoardImageSchema.safeParse({ boardId });

  if (!parse.success) {
    return {
      success: false,
      message: parse.error.errors.map((e) => e.message).join(", "),
    };
  }

  try {
    const { error } = await supabaseAdmin
      .from("Board")
      .update({
        backgroundUrl: null,
      })
      .eq("id", parse.data.boardId);

    if (error) {
      console.error("Error removing board image:", error);
      return {
        success: false,
        message: MESSAGES.BG_IMAGE.IMAGE_REMOVE_FAILURE,
      };
    }

    revalidatePath(`/board/${parse.data.boardId}`);

    return { success: true, message: MESSAGES.BG_IMAGE.IMAGE_REMOVE_SUCCESS };
  } catch (e) {
    console.error("Error removing board image:", e);
    return { success: false, message: MESSAGES.BG_IMAGE.IMAGE_REMOVE_FAILURE };
  }
}
