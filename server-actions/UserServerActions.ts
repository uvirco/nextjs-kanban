"use server";
import { supabaseAdmin } from "@/lib/supabase";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function handleFavoriteBoard(boardId: string) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return {
        success: false,
        message: "Authentication required",
        status: 401,
      };
    }

    // Check if the favorite relationship exists
    const { data: existingFavorite, error: checkError } = await supabaseAdmin
      .from("_favorites")
      .select("*")
      .eq("A", boardId)
      .eq("B", userId)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      // PGRST116 is "no rows returned"
      console.error("Error checking favorite:", checkError);
      return { success: false, message: "An error occurred", status: 500 };
    }

    if (existingFavorite) {
      // Remove favorite
      const { error: deleteError } = await supabaseAdmin
        .from("_favorites")
        .delete()
        .eq("A", boardId)
        .eq("B", userId);

      if (deleteError) {
        console.error("Error removing favorite:", deleteError);
        return { success: false, message: "An error occurred", status: 500 };
      }

      revalidatePath(`/board/${boardId}`);

      return {
        success: true,
        favorited: false,
        message: "Board unfavorited",
        status: 200,
      };
    } else {
      // Add favorite
      const { error: insertError } = await supabaseAdmin
        .from("_favorites")
        .insert({
          A: boardId,
          B: userId,
        });

      if (insertError) {
        console.error("Error adding favorite:", insertError);
        return { success: false, message: "An error occurred", status: 500 };
      }

      revalidatePath(`/board/${boardId}`);

      return {
        success: true,
        favorited: true,
        message: "Board favorited",
        status: 200,
      };
    }
  } catch (error) {
    console.error("Error in handleFavoriteBoard:", error);
    return { success: false, message: "An error occurred", status: 500 };
  }
}

export async function handleDeleteAccount() {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return {
        success: false,
        message: "Authentication required",
        status: 401,
      };
    }

    const { error } = await supabaseAdmin
      .from("User")
      .delete()
      .eq("id", userId);

    if (error) {
      console.error("Error deleting user:", error);
      return {
        success: false,
        message: "Error deleting account. Please try again later",
        status: 500,
      };
    }

    return {
      success: true,
      message: "Account and all data successfully deleted",
      status: 200,
    };
  } catch (error) {
    console.error("Failed to delete user:", error);
    return {
      success: false,
      message: "Error deleting account. Please try again later",
      status: 500,
    };
  }
}
