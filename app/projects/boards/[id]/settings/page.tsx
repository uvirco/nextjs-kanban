import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { redirect } from "next/navigation";
import BoardSettingsClient from "./BoardSettingsClient";

interface BoardSettingsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function BoardSettingsPage({
  params,
}: BoardSettingsPageProps) {
  const { id } = await params;
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/login");
  }

  // Check if user is a board member with owner role (only owners can manage members)
  const { data: boardMembership, error: memberError } = await supabaseAdmin
    .from("BoardMember")
    .select("role")
    .eq("userId", userId)
    .eq("boardId", id)
    .eq("role", "owner")
    .single();

  if (memberError || !boardMembership) {
    redirect("/board");
  }

  // Fetch board data
  const { data: board, error: boardError } = await supabaseAdmin
    .from("Board")
    .select("*")
    .eq("id", id)
    .single();

  if (boardError || !board) {
    redirect("/board");
  }

  // Fetch board members
  const { data: members } = await supabaseAdmin
    .from("BoardMember")
    .select(
      "userId, boardId, role, createdAt, user:User(id, name, email, image, role)"
    )
    .eq("boardId", id);

  // Fetch board labels
  const { data: labels } = await supabaseAdmin
    .from("Label")
    .select("*")
    .eq("boardId", id);

  // Fetch board settings
  const { data: settings } = await supabaseAdmin
    .from("BoardSettings")
    .select("*")
    .eq("boardId", id)
    .single();

  // Fetch all users (excluding ADMIN) for member management
  const { data: allUsers } = await supabaseAdmin
    .from("User")
    .select("id, name, email, image, role")
    .neq("role", "ADMIN")
    .eq("isActive", true);

  // Transform board data to match expected structure
  const boardWithRelations = {
    ...board,
    members: (members || []).map((m: any) => ({
      userId: m.userId,
      boardId: m.boardId,
      role: m.role,
      createdAt: m.createdAt,
      user: m.user,
    })),
    labels: labels || [],
    settings: settings || null,
  };

  // Get current board members
  const currentMembers = (members || []).map((member: any) => member.user);

  return (
    <div className="min-h-screen bg-zinc-950 text-foreground">
      <div className="container mx-auto py-8 px-4">
        <BoardSettingsClient
          board={boardWithRelations}
          allUsers={allUsers || []}
          currentMembers={currentMembers}
          labels={labels || []}
        />
      </div>
    </div>
  );
}
