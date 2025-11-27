"use client";
import { useRouter } from "next/navigation";
import { IconMenu2, IconTrash } from "@tabler/icons-react";
import { toast } from "sonner";
import { handleDeleteBoard } from "@/server-actions/BoardServerActions";
import { useState } from "react";

export default function BoardMenu({ boardId }: { boardId: string }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this board?")) {
      const response = await handleDeleteBoard(boardId);
      if (response.success) {
        router.push("/board/");
        toast.success("Board Deleted");
      } else {
        toast.error(response.message);
      }
    }
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-2 py-1 text-sm text-white bg-zinc-800 hover:bg-zinc-700 rounded-md transition-colors"
      >
        <IconMenu2 size={20} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 z-20 mt-2 w-48 bg-zinc-900 border border-zinc-700 rounded-md shadow-lg overflow-hidden">
            <button
              onClick={handleDelete}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-zinc-800 transition-colors"
            >
              <IconTrash size={18} />
              Delete Board
            </button>
          </div>
        </>
      )}
    </div>
  );
}
