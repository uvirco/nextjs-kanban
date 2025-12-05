"use client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { handleDeleteTask } from "@/server-actions/TaskServerActions";
import { IconLoader2, IconTrash } from "@tabler/icons-react";
import { useState } from "react";

export default function DeleteTaskForm({
  boardId,
  taskId,
  columnId,
}: {
  boardId: string;
  taskId: string;
  columnId: string;
}) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const onClickDelete = async () => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      setIsDeleting(true);
      const data = { id: taskId, boardId, columnId };

      try {
        const response = await handleDeleteTask(data);

        if (response.success) {
          toast.success("Task Deleted");
          router.back();
        } else {
          toast.error(response.message);
        }
      } catch (e) {
        toast.error("An error occurred while deleting the task.");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <button
      onClick={onClickDelete}
      className="flex items-center justify-center p-2 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-red-400 transition-colors"
      disabled={isDeleting}
      title="Delete Task"
    >
      {isDeleting ? (
        <IconLoader2 size={20} className="animate-spin" />
      ) : (
        <IconTrash size={20} />
      )}
    </button>
  );
}
