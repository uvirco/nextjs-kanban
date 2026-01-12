import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase";
import {
  ProfileInviteReceivedActions,
  ProfileInviteSentActions,
} from "./ProfileInviteActions";

interface Invitation {
  id: string;
  token: string;
  board: {
    title: string;
    id: string;
  };
  inviter: {
    name: string | null;
    email: string | null;
  };
}

interface SentInvitation {
  id: string;
  email: string;
  token: string;
  board: {
    title: string;
    id: string;
  };
}

export default async function ProfileInvites() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return <div>User is not authenticated or user ID is not available.</div>;
  }

  const { data: user, error: userError } = await supabaseAdmin
    .from("User")
    .select("email")
    .eq("id", userId)
    .single();

  if (userError || !user || !user.email) {
    console.error("Failed to fetch user email:", userError);
    return <div>No invitations found.</div>;
  }

  // Get boards where user is owner, then get invitations for those boards
  const { data: ownedBoards } = await supabaseAdmin
    .from("BoardMember")
    .select("boardId")
    .eq("userId", userId)
    .eq("role", "owner");

  const boardIds =
    ownedBoards?.map((b: { boardId: string }) => b.boardId) || [];

  const { data: sentInvitations, error: sentError } = await supabaseAdmin
    .from("Invitation")
    .select(
      `
      *,
      board:Board (*)
    `
    )
    .in("boardId", boardIds);

  if (sentError) {
    console.error("Failed to fetch sent invitations:", sentError);
  }

  const { data: receivedInvitations, error: receivedError } =
    await supabaseAdmin
      .from("Invitation")
      .select(
        `
      *,
      board:Board (*),
      inviter:User (*)
    `
      )
      .eq("email", user.email);

  if (receivedError) {
    console.error("Failed to fetch received invitations:", receivedError);
  }

  return (
    <div className="grid grid-cols-1">
      <div>
        <h4 className="font-semibold">Sent Invitations</h4>
        {sentInvitations && sentInvitations.length > 0 ? (
          <ul className="mb-2">
            {sentInvitations.map((invite: SentInvitation) => (
              <li
                key={invite.id}
                className="flex gap-1 items-center border-b-1 last:border-b-0 border-zinc-700 py-1 text-zinc-300"
              >
                <ProfileInviteSentActions invite={invite} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-zinc-300">No sent invitations.</p>
        )}
      </div>

      <div>
        <h4 className="font-semibold">Received Invitations</h4>
        {receivedInvitations && receivedInvitations.length > 0 ? (
          <ul>
            {receivedInvitations.map((invite: Invitation) => (
              <ProfileInviteReceivedActions key={invite.id} invite={invite} />
            ))}
          </ul>
        ) : (
          <p>No received invitations.</p>
        )}
      </div>
    </div>
  );
}
