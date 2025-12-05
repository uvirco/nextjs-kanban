"use server";
import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { BoardMember, Board } from "@/types/types";

type BoardWithDetails = BoardMember & {
  board: Pick<Board, "id" | "title" | "backgroundUrl">;
};

type UserData = {
  name: string;
  image: string;
} | null;

export async function getSidebarBoards(): Promise<BoardWithDetails[]> {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId || !supabaseAdmin) {
      return [];
    }

    const { data: boardMembersData, error } = await supabaseAdmin
      .from("BoardMember")
      .select(
        `
          *,
          board:Board (
            id,
            title,
            backgroundUrl
          )
        `
      )
      .eq("userId", userId)
      .order("createdAt", { ascending: true });

    if (error || !boardMembersData) {
      console.error("Failed to fetch boards:", error);
      return [];
    }

    return boardMembersData as BoardWithDetails[];
  } catch (error) {
    console.error("Error fetching sidebar boards:", error);
    return [];
  }
}

export async function getCurrentUser(): Promise<UserData> {
  try {
    const session = await auth();

    if (!session?.user) {
      return null;
    }

    return {
      name: session.user.name ?? "",
      image: session.user.image ?? "",
    };
  } catch (error) {
    console.error("Error fetching current user:", error);
    return null;
  }
}
