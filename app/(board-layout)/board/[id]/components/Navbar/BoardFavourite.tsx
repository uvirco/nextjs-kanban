import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase";
import BoardFavouriteClient from "./BoardFavourite.client";

export default async function BoardFavourite({ boardId }: { boardId: string }) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return <div>User not authenticated</div>;
  }

  // Get board with favorited users
  const { data: boardData } = await supabaseAdmin
    .from("Board")
    .select(`
      id,
      favoritedBy:UserFavoriteBoard (userId)
    `)
    .eq("id", boardId)
    .single();

  const isFavorite = boardData?.favoritedBy?.some(
    (fav: { userId: string }) => fav.userId === userId
  ) || false;

  return <BoardFavouriteClient isFavorite={isFavorite} boardId={boardId} />;
}
