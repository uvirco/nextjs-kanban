import BoardFilter from "./BoardFilter.client";
import { supabaseAdmin } from "@/lib/supabase";

export default async function BoardFilterFetch({
  boardId,
}: {
  boardId: string;
}) {
  const { data: labels, error } = await supabaseAdmin
    .from("Label")
    .select("*")
    .eq("boardId", boardId);

  if (error) {
    console.error("Failed to fetch labels:", error);
  }

  return <BoardFilter labels={labels || []} />;
}
