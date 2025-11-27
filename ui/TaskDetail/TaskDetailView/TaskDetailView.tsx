import { auth } from "@/auth";
import { DetailedTask } from "@/types/types";
import TaskDetailDescription from "./Description/TaskDetaillDescription";
import TaskDetailActivity from "./Activity/TaskDetailActivity";
import TaskDetailChecklist from "./Checklist/TaskDetailChecklist";
import TaskDetailDates from "./Dates/TaskDetailDates";
import TaskDetailLabels from "./Labels/TaskDetailLabels";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default async function TaskDetailView({ task }: { task: DetailedTask }) {
  const session = await auth();

  return (
    <div className="col-span-3">
      {task.assignedUsers.length > 0 && (
        <div className="flex -space-x-2 mb-4">
          {task.assignedUsers.map((assignment) => (
            <Avatar key={assignment.user.id} className="w-8 h-8 border-2 border-white">
              <AvatarImage src={assignment.user.image || undefined} alt={assignment.user.name || "Unknown"} />
              <AvatarFallback className="text-xs">
                {(assignment.user.name || "?").charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          ))}
        </div>
      )}

      <TaskDetailLabels labels={task.labels} />
      <TaskDetailDates startDate={task.startDate} dueDate={task.dueDate} />
      <TaskDetailDescription
        taskDescription={task.description}
        taskId={task.id}
        boardId={task.column.boardId}
      />
      <TaskDetailChecklist taskId={task.id} checklists={task.checklists} />
      <TaskDetailActivity
        taskId={task.id}
        boardId={task.column.boardId}
        activities={task.activities}
        columnTitle={task.column.title}
        userName={session?.user?.name ?? null}
        userImage={session?.user?.image ?? null}
      />
    </div>
  );
}
