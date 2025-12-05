import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { ActivityWithRelations } from "@/types/types";
import { generateActivityMessage } from "./activityMessage";

export default async function ProfileActivity() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    throw new Error("User not authenticated");
  }

  if (!supabaseAdmin) {
    console.error("Supabase admin client not available");
    return (
      <li className="border-b-1 last:border-b-0 border-zinc-700 py-1">
        Unable to load activities
      </li>
    );
  }

  // Query activities with complex joins
  const { data: activities, error } = await supabaseAdmin
    .from("Activity")
    .select(
      `
      *,
      user:User (*),
      task:Task (title),
      board:Board (*),
      oldColumn:Column (*),
      newColumn:Column (*),
      originalColumn:Column (*),
      targetUser:User (id, name)
      `
    )
    .eq("userId", userId)
    .order("createdAt", { ascending: false })
    .limit(5);

  if (error || !activities || activities.length === 0) {
    console.error("Failed to fetch activities:", error);
    return (
      <li className="border-b-1 last:border-b-0 border-zinc-700 py-1">
        No activities found
      </li>
    );
  }

  return (
    <>
      {activities.map((activity: ActivityWithRelations) => (
        <li
          key={activity.id}
          className="border-b-1 last:border-b-0 border-zinc-700 py-1 text-sm"
        >
          {generateActivityMessage(activity)}
        </li>
      ))}
    </>
  );
}
