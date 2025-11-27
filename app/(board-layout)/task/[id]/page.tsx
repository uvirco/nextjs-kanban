import TaskDetail from "@/ui/TaskDetail/TaskDetail";
import TaskDetailWrapper from "./ui/TaskDetailWrapper";
import FetchTask from "@/app/(board-layout)/task/[id]/FetchTask";
import TaskBackButton from "./ui/TaskBackButton";

interface BoardProps {
  params: Promise<{ id: string }>;
}

export default async function Task({ params }: BoardProps) {
  const { id: taskId } = await params;
  const task = await FetchTask({ taskId });

  if (!task) {
    return (
      <main className="flex flex-col grow bg-background">
        <div className="p-3 md:p-5 flex flex-col grow relative">
          <div>Task not found or access denied.</div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col grow bg-background">
      <div className="p-3 md:p-5 flex flex-col grow relative">
        <TaskDetailWrapper>
          <TaskBackButton boardId={task.column.boardId} />
          <TaskDetail task={task} />
        </TaskDetailWrapper>
      </div>
    </main>
  );
}
