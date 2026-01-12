import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase";

export default async function TotalBoardsCount() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    throw new Error("User not authenticated");
  }

  const { count, error } = await supabaseAdmin
    .from("BoardMember")
    .select("*", { count: "exact", head: true })
    .eq("userId", userId);

  if (error) {
    console.error("Failed to count boards:", error);
    return 0;
  }

  return count || 0;
}
