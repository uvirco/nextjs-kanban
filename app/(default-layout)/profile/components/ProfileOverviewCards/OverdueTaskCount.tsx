import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase";

export default async function OverdueTaskCount() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    throw new Error("User not authenticated");
  }

  const today = new Date().toISOString();

  // Get boards where user is a member
  const { data: boardMembers } = await supabaseAdmin
    .from("BoardMember")
    .select("boardId")
    .eq("userId", userId);

  const boardIds = boardMembers?.map((b: { boardId: string }) => b.boardId) || [];

  if (boardIds.length === 0) {
    return 0;
  }

  // Get columns for those boards
  const { data: columns } = await supabaseAdmin
    .from("Column")
    .select("id")
    .in("boardId", boardIds);

  const columnIds = columns?.map((c: { id: string }) => c.id) || [];

  if (columnIds.length === 0) {
    return 0;
  }

  // Count overdue tasks
  const { count, error } = await supabaseAdmin
    .from("Task")
    .select("*", { count: "exact", head: true })
    .in("columnId", columnIds)
    .lt("dueDate", today);

  if (error) {
    console.error("Failed to count overdue tasks:", error);
    return 0;
  }

  return count || 0;
}
