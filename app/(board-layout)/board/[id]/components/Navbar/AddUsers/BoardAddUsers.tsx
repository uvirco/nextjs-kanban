"use client";
import { useState } from "react";
import { IconUser, IconX } from "@tabler/icons-react";
import BoardAddUsersList from "./BoardAddUsersList";
import BoardAddUsersLink from "./BoardAddUsersLink";
import BoardAddUsersForm from "./BoardAddUsersForm";
import { BoardMemberWithUser } from "@/types/types";
import { User } from "@prisma/client";

interface BoardAddUsersProps {
  boardId: string;
  owner: User | null;
  members: BoardMemberWithUser[];
  isOwner: boolean;
  loggedInUserId: string;
}

export default function BoardAddUsers({
  boardId,
  owner,
  members,
  isOwner,
  loggedInUserId,
}: BoardAddUsersProps) {
  const [invitationLink, setInvitationLink] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const handleInvitationLinkChange = (newLink: string) => {
    setInvitationLink(newLink);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-2 py-1 text-sm text-white bg-zinc-800 hover:bg-zinc-700 rounded-md transition-colors"
      >
        <IconUser size={16} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 z-20 mt-2 w-64 bg-zinc-900 border border-zinc-700 rounded-md shadow-lg">
            <div className="px-4 py-3">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold">Manage Users</h3>
                <button onClick={() => setIsOpen(false)}>
                  <IconX size={16} />
                </button>
              </div>
              <h4 className="font-semibold mb-2 text-sm">Current Users</h4>
              <BoardAddUsersList
                owner={owner}
                members={members}
                boardId={boardId}
                isOwner={isOwner}
                loggedInUserId={loggedInUserId}
              />
              <h4 className="font-semibold mb-2 mt-4 text-sm">Add Users</h4>
              <BoardAddUsersForm
                boardId={boardId}
                onInvitationLinkChange={handleInvitationLinkChange}
                isOwner={isOwner}
              />
              {invitationLink && (
                <>
                  <BoardAddUsersLink invitationLink={invitationLink} />
                  <p className="mt-1 text-xs text-red-500">
                    Note: emails are not currently sending, please share this
                    link with the recipient.
                  </p>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
