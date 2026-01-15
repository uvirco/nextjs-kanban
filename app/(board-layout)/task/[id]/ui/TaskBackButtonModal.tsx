"use client";

import { useRouter } from "next/navigation";
import { IconArrowLeft } from "@tabler/icons-react";

interface TaskBackButtonModalProps {
  boardId: string;
}

export default function TaskBackButtonModal({
  boardId,
}: TaskBackButtonModalProps) {
  const router = useRouter();

  const handleBack = () => {
    router.push(`/projects/boards/${boardId}`);
  };

  return (
    <button
      onClick={handleBack}
      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30 rounded-lg transition-colors mb-4"
    >
      <IconArrowLeft size={18} />
      Back to board
    </button>
  );
}
