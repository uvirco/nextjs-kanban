"use client";
import { useState, useEffect } from "react";
import { IconChevronDown, IconChevronRight } from "@tabler/icons-react";
import Board from "@/ui/Board/Board.client";
import { supabase } from "@/lib/supabase";

interface EpicTaskboardSectionProps {
  epic: any;
  params: { id: string };
}

export default function EpicTaskboardSection({
  epic,
  params,
}: EpicTaskboardSectionProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [boardId, setBoardId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load collapsed state from localStorage on mount
  useEffect(() => {
    const storageKey = `epic-${epic.id}-taskboard-collapsed`;
    const savedState = localStorage.getItem(storageKey);
    if (savedState !== null) {
      setIsCollapsed(JSON.parse(savedState));
    }
  }, [epic.id]);

  // Function to toggle collapsed state and save to localStorage
  const toggleCollapsed = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    const storageKey = `epic-${epic.id}-taskboard-collapsed`;
    localStorage.setItem(storageKey, JSON.stringify(newState));
  };

  useEffect(() => {
    const fetchBoardId = async () => {
      // First try to get boardId from epic's column
      if (epic.columnId) {
        try {
          const { data: column, error } = await supabase
            .from("Column")
            .select("boardId")
            .eq("id", epic.columnId)
            .single();

          if (!error && column) {
            setBoardId(column.boardId);
            setLoading(false);
            return;
          }
        } catch (error) {
          console.error("Error fetching column:", error);
        }
      }

      // If epic doesn't have a column, try to find a board from its subtasks
      try {
        const { data: subtasks, error } = await supabase
          .from("Task")
          .select(
            `
            columnId,
            column:Column(boardId)
          `
          )
          .eq("parentTaskId", epic.id)
          .limit(1);

        if (!error && subtasks && subtasks.length > 0 && subtasks[0].column) {
          setBoardId(subtasks[0].column.boardId);
        }
      } catch (error) {
        console.error("Error fetching subtasks:", error);
      }

      setLoading(false);
    };

    fetchBoardId();
  }, [epic.columnId, epic.id]);

  if (loading) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
        <div className="text-zinc-400">Loading task board...</div>
      </div>
    );
  }

  if (!boardId) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
        <button
          onClick={toggleCollapsed}
          className="flex items-center gap-2 w-full text-left hover:bg-zinc-800/50 -m-2 p-2 rounded transition-colors"
        >
          {isCollapsed ? (
            <IconChevronRight size={20} className="text-zinc-400" />
          ) : (
            <IconChevronDown size={20} className="text-zinc-400" />
          )}
          <h2 className="text-xl font-bold text-white">📋 Task Board</h2>
        </button>

        {!isCollapsed && (
          <div className="mt-4 text-zinc-400">
            No task board available. Create some tasks within this epic to see
            the board.
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 overflow-hidden">
      <button
        onClick={toggleCollapsed}
        className="flex items-center gap-2 w-full text-left hover:bg-zinc-800/50 -m-2 p-2 rounded transition-colors"
      >
        {isCollapsed ? (
          <IconChevronRight size={20} className="text-zinc-400" />
        ) : (
          <IconChevronDown size={20} className="text-zinc-400" />
        )}
        <h2 className="text-xl font-bold text-white">📋 Task Board</h2>
      </button>

      {!isCollapsed && (
        <div className="mt-4">
          <Board boardId={boardId} epicId={epic.id} />
        </div>
      )}
    </div>
  );
}
