"use client";
import { Menu, MenuItem } from "./SidebarComponent";
import {
  IconLayoutKanban,
  IconUser,
  IconInbox,
  IconMessage,
  IconCircle,
  IconTarget,
  IconChartBar,
  IconSettings,
  IconCalendar,
} from "@tabler/icons-react";
import SidebarHeader from "./SidebarHeader";
import { useEffect, useState } from "react";
import { getSidebarBoards } from "@/server-actions/SidebarServerActions";

type BoardWithDetails = {
  boardId: string;
  board: {
    id: string;
    title: string;
    backgroundUrl: string | null;
  };
};

interface SidebarMenuContentProps {
  isCollapsed: boolean;
}

export default function SidebarMenuContent({
  isCollapsed,
}: SidebarMenuContentProps) {
  const [boardMembers, setBoardMembers] = useState<BoardWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const boardMembersData = await getSidebarBoards();
        setBoardMembers(boardMembersData);
      } catch (error) {
        console.error("Error fetching sidebar data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 px-5 py-3">
          <div className="animate-pulse">
            <div className="h-4 bg-zinc-800 rounded mb-2"></div>
            <div className="h-4 bg-zinc-800 rounded mb-2"></div>
            <div className="h-4 bg-zinc-800 rounded"></div>
          </div>
        </div>
        <div className="mt-auto">
          <hr className="border-zinc-900 my-3" />
          <SidebarHeader isCollapsed={isCollapsed} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Middle section with menu - takes up available space */}
      <div className="flex-1 overflow-y-auto">
        <Menu>
          {/* Main Items */}
          <MenuItem
            path="/dashboard"
            title={isCollapsed ? "" : "Dashboard"}
            icon={<IconChartBar stroke={1.5} size={20} />}
            showTitle={!isCollapsed}
          />
          <MenuItem
            path="/epics"
            title={isCollapsed ? "" : "Epics"}
            icon={<IconTarget stroke={1.5} size={20} />}
            showTitle={!isCollapsed}
          />
          <MenuItem
            path="/meetings"
            title={isCollapsed ? "" : "Meetings"}
            icon={<IconCalendar stroke={1.5} size={20} />}
            showTitle={!isCollapsed}
          />

          {boardMembers.map((boardMember) => (
            <MenuItem
              key={boardMember.boardId}
              path={`/board/${boardMember.boardId}`}
              title={isCollapsed ? "" : boardMember.board.title}
              icon={<IconLayoutKanban stroke={1.5} size={20} />}
              showTitle={!isCollapsed}
            />
          ))}

          <MenuItem
            path="/admin/settings"
            title={isCollapsed ? "" : "Settings"}
            icon={<IconSettings stroke={1.5} size={20} />}
            showTitle={!isCollapsed}
          />

          {/* Communications section hidden */}
          {/* <hr className="border-zinc-900 my-3" />

          <li className="menu-item group">
            <div className="flex items-center gap-2 text-sm text-zinc-400 font-medium px-2 py-1">
              <IconMessage stroke={1.5} size={20} />
              {isCollapsed ? "" : "Communications"}
            </div>
          </li>

          <MenuItem
            path="/inbox"
            title={isCollapsed ? "" : "Inbox"}
            icon={<IconInbox stroke={1.5} size={20} />}
            badgeContent={0}
            showTitle={!isCollapsed}
          />
          <MenuItem
            path="/chat"
            title={isCollapsed ? "" : "Chat"}
            icon={<IconMessage stroke={1.5} size={20} />}
            showTitle={!isCollapsed}
          /> */}
        </Menu>
      </div>

      {/* User section at the bottom */}
      <div className="mt-auto">
        <hr className="border-zinc-900 my-3" />
        <SidebarHeader isCollapsed={isCollapsed} />
      </div>
    </div>
  );
}
