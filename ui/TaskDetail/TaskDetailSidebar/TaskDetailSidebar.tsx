import { DetailedTask } from "@/types/types";
import TaskDetailActions from "./TaskDetailActions/TaskDetailActions";

export default function TaskDetailSidebar({ task }: { task: DetailedTask }) {
  return (
    <div className="col-span-1">
      <TaskDetailActions task={task} />
    </div>
  );
}
