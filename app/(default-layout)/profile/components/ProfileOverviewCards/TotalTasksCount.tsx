import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase";

export default async function TotalTasksCount() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    throw new Error("User not authenticated");
  }

  // Get boards where user is a member
  const { data: boardMembers } = await supabaseAdmin
    .from("BoardMember")
    .select("boardId")
    .eq("userId", userId);

  const boardIds = boardMembers?.map(b => b.boardId) || [];

  if (boardIds.length === 0) {
    return 0;
  }

  // Get columns for those boards
  const { data: columns } = await supabaseAdmin
    .from("Column")
    .select("id")
    .in("boardId", boardIds);

  const columnIds = columns?.map(c => c.id) || [];

  if (columnIds.length === 0) {
    return 0;
  }

  // Count tasks created by user in those columns
  const { count, error } = await supabaseAdmin
    .from("Task")
    .select("*", { count: "exact", head: true })
    .eq("createdByUserId", userId)
    .in("columnId", columnIds);

  if (error) {
    console.error("Failed to count tasks:", error);
    return 0;
  }

  return count || 0;
}
