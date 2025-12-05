"use client";
import { useState } from "react";
import { IconPlus, IconUser, IconMinus } from "@tabler/icons-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import TaskPopoverWrapper from "../components/TaskPopoverWrapper";
import TaskPopoverHeading from "../components/TaskPopoverHeading";
import TaskPopoverSubtitle from "../components/TaskPopoverSubtitle";

import {
  handleAddUserToTask,
  handleRemoveUserFromTask,
} from "@/server-actions/TaskUserServerActions";
import { BoardMemberWithUser, CardMemberWithUser } from "@/types/types";

interface AddToCardMembersProps {
  boardMembers: BoardMemberWithUser[];
  cardMembers: CardMemberWithUser[];
  taskId: string;
  boardId: string;
}

export default function AddToCardMembers({
  boardMembers,
  cardMembers,
  taskId,
  boardId,
}: AddToCardMembersProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const isMemberInCard = (userId: string) => {
    return cardMembers.some((member) => member.user.id === userId);
  };

  const availableBoardMembers = boardMembers.filter(
    (member) => !isMemberInCard(member.user.id)
  );

  const filteredMembers = availableBoardMembers.filter(
    (member) =>
      member.user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddClick = async (targetUserId: string) => {
    const result = await handleAddUserToTask(targetUserId, taskId, boardId);
  };

  const handleRemoveClick = async (targetUserId: string) => {
    const result = await handleRemoveUserFromTask(
      targetUserId,
      taskId,
      boardId
    );
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="w-8 h-8 flex items-center justify-center rounded-md bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-600 transition-colors"
          title="Add Members"
        >
          <IconUser size={16} className="text-zinc-400" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <TaskPopoverWrapper>
          <TaskPopoverHeading title="Members" />

          <Input
            placeholder="Search Members..."
            className="mb-3"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {cardMembers.length > 0 && (
            <>
              <TaskPopoverSubtitle>Card Members</TaskPopoverSubtitle>
              <ul className="flex flex-col gap-y-3 mb-5">
                {cardMembers.map((cardMember) => (
                  <MemberListItem
                    key={cardMember.user.id}
                    member={cardMember}
                    onAddClick={handleAddClick}
                    onRemoveClick={handleRemoveClick}
                    isCardMember={true}
                  />
                ))}
              </ul>
            </>
          )}

          {filteredMembers.length > 0 && (
            <>
              <TaskPopoverSubtitle>Board Members</TaskPopoverSubtitle>
              <ul className="flex flex-col gap-y-3 mb-5">
                {filteredMembers.map((member) => (
                  <MemberListItem
                    key={member.user.id}
                    member={member}
                    onAddClick={handleAddClick}
                    onRemoveClick={handleRemoveClick}
                    isCardMember={false}
                  />
                ))}
              </ul>
            </>
          )}
        </TaskPopoverWrapper>
      </PopoverContent>
    </Popover>
  );
}

interface MemberListItemProps {
  member: BoardMemberWithUser | CardMemberWithUser;
  onAddClick: (userId: string) => void;
  onRemoveClick: (userId: string) => void;
  isCardMember: boolean;
}

function MemberListItem({
  member,
  onAddClick,
  onRemoveClick,
  isCardMember,
}: MemberListItemProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <li
      key={member.user.id}
      className="flex justify-between items-center grow py-1"
    >
      <div className="flex gap-3">
        <Avatar className="w-10 h-10">
          <AvatarImage
            src={member.user.image || undefined}
            alt={member.user.name || "User"}
          />
          <AvatarFallback>
            {getInitials(member.user.name || "?")}
          </AvatarFallback>
        </Avatar>

        <div className="flex flex-col grow-0 shrink">
          <div className="truncate">{member.user.name || "Unknown"}</div>
          <div className="truncate text-muted-foreground text-xs">
            {member.user.email || "Unknown Email"}
          </div>
        </div>
      </div>

      <div>
        {isCardMember ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemoveClick(member.user.id)}
          >
            <IconMinus size={18} />
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAddClick(member.user.id)}
          >
            <IconPlus size={18} />
          </Button>
        )}
      </div>
    </li>
  );
}
