"use client";
import { useState } from "react";
import { IconPlus } from "@tabler/icons-react";
import CreateTaskModal from "./CreateTaskModal";

export default function CreateTaskForm({
  boardId,
  columnId,
}: {
  boardId: string;
  columnId: string;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSuccess = () => {
    // The modal will close itself, and the board should refresh via revalidation
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="text-sm flex items-center gap-2 w-full"
      >
        <IconPlus size={16} />
        Add a task
      </button>

      <CreateTaskModal
        boardId={boardId}
        columnId={columnId}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
      />
    </>
  );
}
