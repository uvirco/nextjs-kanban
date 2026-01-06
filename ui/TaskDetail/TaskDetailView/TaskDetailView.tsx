import { auth } from "@/auth";
import { DetailedTask } from "@/types/types";
import TaskDetailDescription from "./Description/TaskDetaillDescription";
import TaskDetailActivity, {
  TaskDetailActivityEntries,
} from "./Activity/TaskDetailActivity";
import TaskDetailChecklist from "./Checklist/TaskDetailChecklist";
import TaskDetailDates from "./Dates/TaskDetailDates";
import TaskDetailLabels from "./Labels/TaskDetailLabels";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default async function TaskDetailView({ task }: { task: DetailedTask }) {
  const session = await auth();

  return (
    <div className="col-span-3 text-zinc-100 flex flex-col h-full">
      <TaskDetailLabels
        taskId={task.id}
        boardId={task.column.boardId}
        initialLabels={task.labels}
      />
      <TaskDetailDates
        startDate={task.startDate}
        dueDate={task.dueDate}
        parentEpic={task.parentEpic}
        columnTitle={task.column.title}
        taskType={task.taskType}
        taskTitle={task.title}
      />
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

      <hr className="my-4 border-zinc-700" />

      <TaskDetailActivityEntries
        activities={task.activities}
        columnTitle={task.column.title}
        boardId={task.column.boardId}
      />
    </div>
  );
}
