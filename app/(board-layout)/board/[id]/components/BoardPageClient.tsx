"use client";
import { BoardWithColumns } from "@/types/types";
import Board from "./Board";
import BoardNavbar from "./Navbar/BoardNavbar";
import Image from "next/image";

interface BoardPageClientProps {
  board: BoardWithColumns;
  isFavorite: boolean;
  boardLabels: any[];
  owner: any;
  members: any[];
  isOwner: boolean;
  loggedInUserId: string;
  epicTasks: Array<{ id: string; title: string }>;
  selectedEpicId: string | null;
  departments: Array<{ id: string; name: string }>;
  selectedDepartmentId: string | null;
}

export default function BoardPageClient({ 
  board: initialBoard, 
  isFavorite, 
  boardLabels,
  owner,
  members,
  isOwner,
  loggedInUserId,
  epicTasks,
  selectedEpicId,
  departments,
  selectedDepartmentId
}: BoardPageClientProps) {
  // Don't use useState - use the prop directly so it updates when filtering changes
  const board = initialBoard;

  return (
    <main className="flex flex-col grow min-w-0 bg-cover bg-center bg-zinc-900 relative min-h-screen">
      {board.backgroundUrl && (
        <Image
          className="object-cover object-center z-0"
          src={board.backgroundUrl}
          alt="Board Wallpaper"
          fill
        />
      )}
      <BoardNavbar 
        boardId={board.id} 
        boardTitle={board.title} 
        isFavorite={isFavorite} 
        boardLabels={boardLabels}
        owner={owner}
        members={members}
        isOwner={isOwner}
        loggedInUserId={loggedInUserId}
        epicTasks={epicTasks}
        selectedEpicId={selectedEpicId}
        departments={departments}
        selectedDepartmentId={selectedDepartmentId}
      />
      <div className="flex flex-1 min-h-0">
        <Board board={board} />
      </div>
    </main>
  );
}