import TaskDetail from "@/ui/TaskDetail/TaskDetail";
import TaskDetailWrapper from "@/app/(board-layout)/task/[id]/ui/TaskDetailWrapper";
import FetchTask from "@/app/(board-layout)/task/[id]/FetchTask";

interface TaskPageProps {
  params: Promise<{ id: string }>;
}

export default async function TaskPage({ params }: TaskPageProps) {
  const { id: taskId } = await params;
  const task = await FetchTask({ taskId });

  if (!task) {
    return (
      <main className="flex flex-col grow bg-zinc-950">
        <div className="p-3 md:p-5 flex flex-col grow relative">
          <div className="text-zinc-400">Task not found or access denied.</div>
        </div>
      </main>
    );
  }

  // If task has parentTaskId, it's a subtask of an epic
  const backHref = task.parentTaskId
    ? `/epics/${task.parentTaskId}`
    : `/board/${task.column.boardId}`;
  const backText = task.parentTaskId ? "Back to epic" : "Back to board";

  return (
    <main className="flex flex-col h-screen bg-zinc-950">
      <div className="p-3 md:p-5 flex flex-col h-full relative">
        <TaskDetailWrapper>
          <div>
            <a
              href={backHref}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
              {backText}
            </a>
          </div>
          <TaskDetail task={task} />
        </TaskDetailWrapper>
      </div>
    </main>
  );
}
