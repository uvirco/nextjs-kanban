import EditTaskNameForm from "@/ui/Forms/EditTaskNameForm";
import DeleteTaskForm from "@/ui/Forms/DeleteTaskForm";
import TaskDetailAddToCard from "../TaskDetailSidebar/TaskDetailAddToCard/TaskDetailAddToCard";
import { IconCards } from "@tabler/icons-react";
import { DetailedTask } from "@/types/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function TaskDetailTitle({
  task,
  taskId,
  taskTitle,
  columnTitle,
  boardId,
  columnId,
  taskCreatedAt,
  taskUpdatedAt,
}: {
  task: DetailedTask;
  taskId: string;
  taskTitle: string;
  columnTitle: string;
  boardId: string;
  columnId: string;
  taskCreatedAt: Date;
  taskUpdatedAt: Date;
}) {
  return (
    <div className="flex items-center justify-between p-5 bg-zinc-900 border-b border-zinc-800">
      {/* Left: Task icon, name, and members */}
      <div className="flex items-center gap-3">
        <IconCards size={32} className="text-zinc-400" />
        <EditTaskNameForm taskId={taskId} title={taskTitle} boardId={boardId} />
        {/* Member avatars */}
        <div className="flex -space-x-2">
          {task.assignedUsers?.map((assignment) => (
            <Avatar
              key={assignment.userId}
              className="w-8 h-8 border-2 border-zinc-800"
            >
              <AvatarImage
                src={assignment.user.image || ""}
                alt={assignment.user.name || ""}
              />
              <AvatarFallback className="bg-zinc-700 text-zinc-300 text-xs">
                {assignment.user.name?.charAt(0).toUpperCase() ||
                  assignment.user.email?.charAt(0).toUpperCase() ||
                  "?"}
              </AvatarFallback>
            </Avatar>
          ))}
        </div>
      </div>

      {/* Center: Add buttons */}
      <div className="flex justify-center">
        <TaskDetailAddToCard task={task} />
      </div>

      {/* Right: Delete button */}
      <div className="flex justify-end">
        <DeleteTaskForm taskId={taskId} boardId={boardId} columnId={columnId} />
      </div>

      {/* Column info below - spans full width */}
      <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2">
        <div className="text-sm font-normal text-zinc-400">
          <p>
            In column <span className="text-blue-400">{columnTitle}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
