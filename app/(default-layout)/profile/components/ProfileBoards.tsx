import { auth } from "@/auth";
import prisma from "@/prisma/prisma";
import Link from "next/link";
import Image from "next/image";
import { IconList } from "@tabler/icons-react";

export default async function ProfileBoards() {
  const session = await auth();
  const userId = session?.user?.id;

  console.log('ProfileBoards - Session user ID:', userId);
  console.log('ProfileBoards - Session user:', session?.user);

  if (!userId) {
    return <p>Please log in to view your favorite boards.</p>;
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      favoriteBoards: {
        include: {
          columns: {
            include: {
              tasks: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    console.log('ProfileBoards - User not found for ID:', userId);
    return (
      <div className="text-center p-4">
        <p className="text-red-400 mb-2">User data not found in database.</p>
        <p className="text-sm text-zinc-400 mb-4">
          This might happen after a database reset. Please log out and log back in.
        </p>
        <form action="/api/auth/signout" method="post" className="inline">
          <button
            type="submit"
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm"
          >
            Sign Out
          </button>
        </form>
      </div>
    );
  }

  const boards = user.favoriteBoards.map((board) => ({
    ...board,
    tasksCount: board.columns.reduce(
      (sum: number, column) => sum + column.tasks.length,
      0,
    ),
    isFavorited: true,
  }));

  if (boards.length === 0) {
    return <p>No favorite boards found.</p>;
  }

  return (
    <>
      {boards.map((board) => (
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
