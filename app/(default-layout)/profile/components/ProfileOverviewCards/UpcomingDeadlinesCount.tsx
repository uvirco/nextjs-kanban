import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase";

export default async function UpcomingDeadlinesCount() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    throw new Error("User not authenticated");
  }

  const today = new Date().toISOString();
  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
  const sevenDaysISO = sevenDaysFromNow.toISOString();

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

  // Count upcoming deadline tasks
  const { count, error } = await supabaseAdmin
    .from("Task")
    .select("*", { count: "exact", head: true })
    .in("columnId", columnIds)
    .gte("dueDate", today)
    .lt("dueDate", sevenDaysISO);

  if (error) {
    console.error("Failed to count upcoming deadlines:", error);
    return 0;
  }

  return count || 0;
}
