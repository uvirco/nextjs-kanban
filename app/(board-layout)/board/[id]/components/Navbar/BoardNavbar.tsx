"use client";

import { Suspense } from "react";
import BoardMenu from "./BoardMenu";
import BoardFavouriteClient from "./BoardFavourite.client";
import BoardTitle from "./BoardTitle";
import BoardFilterClient from "./BoardFilter.client";
import BoardBackgroundImage from "../Wallpaper/BoardBackgroundImage";
import BoardBackgroundImageButton from "../Wallpaper/BoardBackgroundImageButton";
import BoardAddUsers from "./AddUsers/BoardAddUsers";
import { IconLoader2 } from "@tabler/icons-react";

interface BoardNavbarProps {
  boardId: string;
  boardTitle: string;
  isFavorite: boolean;
  boardLabels: any[];
  owner: any;
  members: any[];
  isOwner: boolean;
  loggedInUserId: string;
}

export default function BoardNavbar({
  boardId,
  boardTitle,
  isFavorite,
  boardLabels,
  owner,
  members,
  isOwner,
  loggedInUserId,
}: BoardNavbarProps) {
  return (
    <div className="mb-5 z-10">
      <div className="flex justify-between items-center bg-zinc-950 px-5 py-2 overflow-x-auto no-scrollbar gap-2">
        <div className="flex gap-2 items-center">
          <BoardTitle boardTitle={boardTitle} boardId={boardId} />
          <Suspense
            fallback={<IconLoader2 className="animate-spin mx-3" size={18} />}
          >
            <BoardFavouriteClient isFavorite={isFavorite} boardId={boardId} />
          </Suspense>
          <BoardFilterClient labels={boardLabels} />
          <BoardBackgroundImageButton />
        </div>
        <div className="flex gap-2 items-center">
          <BoardAddUsers
            boardId={boardId}
            owner={owner}
            members={members}
            isOwner={isOwner}
            loggedInUserId={loggedInUserId}
          />
          <BoardMenu boardId={boardId} />
        </div>
      </div>
      <BoardBackgroundImage boardId={boardId} />
    </div>
  );
}
