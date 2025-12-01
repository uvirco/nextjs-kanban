import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase";
import Link from "next/link";
import Image from "next/image";

type BoardWithDetails = {
  id: string;
  title: string;
  backgroundUrl: string | null;
};

export default async function FetchBoards() {
  const session = await auth();
  const userId = session?.user?.id;
  const userRole = session?.user?.role;

  if (!userId) {
    return [];
  }

  let boards: BoardWithDetails[] = [];

  // If admin, show all boards
  if (userRole === "ADMIN") {
    const { data, error } = await supabaseAdmin
      .from("Board")
      .select("id, title, backgroundUrl")
      .order("createdAt", { ascending: false });

    if (error) {
      console.error("Error fetching boards:", error);
      return <div>Error loading boards</div>;
    }

    boards = data || [];
  } else {
    // Regular users only see their boards
    const { data, error } = await supabaseAdmin
      .from("BoardMember")
      .select(
        `
        board:Board(id, title, backgroundUrl)
      `
      )
      .eq("userId", userId)
      .order("createdAt", { ascending: true });

    if (error) {
      console.error("Error fetching user boards:", error);
      return <div>Error loading boards</div>;
    }

    boards = (data?.map((item: any) => item.board).filter(Boolean) ||
      []) as BoardWithDetails[];
  }

  return (
    <>
      {boards.map((board) => (
        <Link key={board.id} href={`/board/${board.id}`}>
          <div className="h-32 flex flex-col justify-end rounded-xl shadow-lg bg-zinc-950 hover:bg-zinc-800 relative overflow-hidden">
            <h4 className="font-semibold tracking-tight z-20 drop-shadow-lg py-3 px-4 overflow-ellipsis overflow-x-hidden whitespace-nowrap block">
              {board.title}
            </h4>
          </div>
        </Link>
      ))}
    </>
  );
}
