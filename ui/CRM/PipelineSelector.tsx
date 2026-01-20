"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CRMBoard } from "@/types/crm";

export default function PipelineSelector() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [boards, setBoards] = useState<CRMBoard[]>([]);
  const [selectedBoardId, setSelectedBoardId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // Only show on deals/pipeline pages
  const isDealsPage = pathname?.includes("/crm/deals");

  useEffect(() => {
    if (isDealsPage) {
      fetchBoards();
    }
  }, [isDealsPage]);

  const fetchBoards = async () => {
    try {
      const response = await fetch("/api/crm/boards?type=deals");
      if (response.ok) {
        const data = await response.json();
        const boardsList = data.boards || [];
        setBoards(boardsList);

        // Get boardId from URL or use default
        const urlBoardId = searchParams?.get("boardId");
        if (urlBoardId) {
          setSelectedBoardId(urlBoardId);
        } else {
          const defaultBoard = boardsList.find((b: CRMBoard) => b.isDefault);
          if (defaultBoard) {
            setSelectedBoardId(defaultBoard.id);
          } else if (boardsList.length > 0) {
            setSelectedBoardId(boardsList[0].id);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching boards:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBoardChange = (boardId: string) => {
    setSelectedBoardId(boardId);
    // Update URL with boardId parameter
    router.push(`/crm/deals?boardId=${boardId}`);
  };

  // Don't render if not on deals page or only one board
  if (!isDealsPage || boards.length <= 1 || loading) {
    return null;
  }

  const selectedBoard = boards.find((b) => b.id === selectedBoardId);

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-zinc-500">Pipeline:</span>
      <Select value={selectedBoardId} onValueChange={handleBoardChange}>
        <SelectTrigger className="w-[180px] h-9 bg-zinc-800 border-zinc-700 text-white text-sm">
          <SelectValue placeholder="Select pipeline" />
        </SelectTrigger>
        <SelectContent className="bg-zinc-800 border-zinc-700">
          {boards.map((board) => (
            <SelectItem
              key={board.id}
              value={board.id}
              className="text-white hover:bg-zinc-700"
            >
              {board.title}
              {board.isDefault && (
                <span className="ml-2 text-xs text-zinc-400">(Default)</span>
              )}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
