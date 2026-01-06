import TaskDetailTitle from "./TaskDetailTitle/TaskModalTitle";
import TaskDetailSidebar from "./TaskDetailSidebar/TaskDetailSidebar";
import TaskDetailView from "./TaskDetailView/TaskDetailView";
import TaskDetailAddToCard from "./TaskDetailSidebar/TaskDetailAddToCard/TaskDetailAddToCard";
import { DetailedTask } from "@/types/types";

export default async function TaskDetail({ task }: { task: DetailedTask }) {
  return (
    <div className="h-full flex flex-col">
      <TaskDetailTitle
        task={task}
        taskId={task.id}
        taskTitle={task.title}
        columnTitle={task.column.title}
        boardId={task.column.boardId}
        columnId={task.columnId}
        taskCreatedAt={task.createdAt}
        taskUpdatedAt={task.updatedAt}
      />
      <div className="grid grid-cols-1 md:grid-cols-4 p-3 md:p-5 gap-x-5 flex-1 overflow-y-auto">
        <TaskDetailView task={task} />
        <TaskDetailSidebar task={task} />
      </div>
    </div>
  );
}
