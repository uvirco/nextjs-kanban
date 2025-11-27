import Link from "next/link";
import { IconArrowLeft } from "@tabler/icons-react";

export default function TaskBackButton({ boardId }: { boardId: string }) {
  return (
    <div>
      <Link
        href={`/board/${boardId}`}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
      >
        <IconArrowLeft size={18} />
        Back to board
      </Link>
    </div>
  );
}
