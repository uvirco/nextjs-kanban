import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase";
import Link from "next/link";
import Image from "next/image";
import { IconList } from "@tabler/icons-react";
import ProfileSignOutButton from "./ProfileSignOutButton";

export default async function ProfileBoards() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return <p>Please log in to view your favorite boards.</p>;
  }

  const { data: user, error: userError } = await supabaseAdmin
    .from("User")
    .select(`
      *,
      favoriteBoards:Board!UserFavoriteBoard (
        *,
        columns:Column (
          *,
          tasks:Task (*)
        )
      )
    `)
    .eq("id", userId)
    .single();

  if (userError || !user) {
    console.error("Failed to fetch user:", userError);
    return (
      <div className="text-center p-4">
        <p className="text-red-400 mb-2">User data not found in database.</p>
        <p className="text-sm text-zinc-400 mb-4">
          This might happen after a database reset. Please log out and log back
          in.
        </p>
        <ProfileSignOutButton />
      </div>
    );
  }

  const boards = (user.favoriteBoards || []).map((board: any) => ({
    ...board,
    tasksCount: (board.columns || []).reduce(
      (sum: number, column: any) => sum + (column.tasks?.length || 0),
      0
    ),
    isFavorited: true,
  }));

  if (boards.length === 0) {
    return <p>No favorite boards found.</p>;
  }

  return (
    <>
      {boards.map((board: any) => (
        <Link key={board.id} href={`/board/${board.id}`}>
          <div className="h-32 flex flex-col justify-end rounded-xl shadow-md bg-zinc-800 hover:bg-zinc-950 relative overflow-hidden">
            {/* <div className="absolute top-0 bottom-0 left-0 right-0 bg-white/40 backdrop-blur-md z-10"></div> */}
            {board.backgroundUrl && (
              <Image
                className="object-cover object-center z-0"
                src={board.backgroundUrl}
                alt="Board Wallpaper"
                fill
              />
            )}

            <span
              className="
                            absolute top-2 right-2 
                            flex items-center justify-center gap-1
                            text-xs text-primary bg-white
                            p-1 rounded-md z-20
                        "
            >
              <IconList size={16} />
              <span>{board.tasksCount}</span>
            </span>

            <h4
              className="
                        font-semibold
                        z-20
                        drop-shadow-lg 
                        p-2 
                        overflow-ellipsis overflow-x-hidden whitespace-nowrap block
                        "
            >
              {board.title}
            </h4>
          </div>
        </Link>
      ))}
    </>
  );
}
