import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase";
import type { BoardMemberWithUser } from "@/types/types";
import BoardAddUsers from "../AddUsers/BoardAddUsers";

export default async function BoardUsers({ boardId }: { boardId: string }) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return <div>User not authenticated</div>;
  }

  const { data: boardMembersData, error } = await supabaseAdmin
    .from("BoardMember")
    .select(
      `
      *,
      user:User (*)
    `
    )
    .eq("boardId", boardId);

  if (error) {
    console.error("Failed to fetch board members:", error);
  }

  const boardMembers = (boardMembersData || []) as BoardMemberWithUser[];

  const owner = boardMembers.find((member: BoardMemberWithUser) => member.role === "owner")?.user ?? null;
  const isOwner = owner?.id === userId;

  const members = boardMembers.filter((member: BoardMemberWithUser) => member.role === "member");

  return (
    <BoardAddUsers
      boardId={boardId}
      owner={owner}
      members={members}
      isOwner={isOwner}
      loggedInUserId={userId}
    />
  );
}
