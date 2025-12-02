import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { BoardMember, Board } from "@/types/types";
import { Sidebar, Menu, SubMenu, MenuItem } from "./SidebarComponent";
import {
  IconLayoutKanban,
  IconUser,
  IconInbox,
  IconMessage,
  IconCircle,
  IconShield,
  IconTarget,
} from "@tabler/icons-react";
import SidebarHeader from "./SidebarHeader";
import SidebarSearch from "./SidebarSearch";

type BoardWithDetails = BoardMember & {
  board: Pick<Board, "id" | "title" | "backgroundUrl">;
};

export default async function SidebarMenu() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return [];
  }

  const { data: boardMembers, error } = await supabaseAdmin
    .from("BoardMember")
    .select(
      `
      *,
      board:Board (
        id,
        title,
        backgroundUrl
      )
    `
    )
    .eq("userId", userId)
    .order("createdAt", { ascending: true });

  if (error || !boardMembers) {
    console.error("Failed to fetch boards:", error);
    return (
      <Sidebar>
        <SidebarHeader />
        <SidebarSearch />
        <hr className="border-zinc-900 my-3" />
        <Menu>
          <MenuItem
            path="/profile"
            title="Profile"
            icon={<IconUser stroke={1.5} size={20} />}
          />
        </Menu>
      </Sidebar>
    );
  }

  const boards: BoardWithDetails[] = boardMembers as BoardWithDetails[];

  const submenuBoardItems = boards.map((boardMember) => ({
    id: boardMember.board.id,
    path: `/board/${boardMember.board.id}`,
    title: boardMember.board.title,
    icon: <IconCircle stroke={2} size={14} />,
  }));

  return (
    <Sidebar>
      <SidebarHeader />
      <SidebarSearch />
      <hr className="border-zinc-900 my-3" />
      <Menu>
        <MenuItem
          path="/profile"
          title="Profile"
          icon={<IconUser stroke={1.5} size={20} />}
        />
        <MenuItem
          path="/board"
          title="All Boards"
          icon={<IconLayoutKanban stroke={1.5} size={20} />}
          submenuItems={submenuBoardItems}
        />
        <MenuItem
          path="/epics"
          title="Epic Portfolio"
          icon={<IconTarget stroke={1.5} size={20} />}
        />
        <MenuItem
          path="/inbox"
          title="Inbox"
          icon={<IconInbox stroke={1.5} size={20} />}
        />
        <MenuItem
          path="/chat"
          title="Chat"
          icon={<IconMessage stroke={1.5} size={20} />}
        />
        {session?.user?.role === "ADMIN" && (
          <MenuItem
            path="/admin"
            title="Admin Dashboard"
            icon={<IconShield stroke={1.5} size={20} />}
          />
        )}
        <hr className="border-zinc-900" />
      </Menu>
    </Sidebar>
  );
}
