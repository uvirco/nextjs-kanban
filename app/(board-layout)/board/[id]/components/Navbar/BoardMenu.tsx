"use client";
import { useRouter } from "next/navigation";
import { IconSettings } from "@tabler/icons-react";

export default function BoardMenu({ boardId }: { boardId: string }) {
  const router = useRouter();

  const handleSettings = () => {
    router.push(`/board/${boardId}/settings`);
  };

  return (
    <button
      onClick={handleSettings}
      className="px-2 py-1 text-sm text-white bg-zinc-800 hover:bg-zinc-700 rounded-md transition-colors"
      title="Board Settings"
    >
      <IconSettings size={20} />
    </button>
  );
}
