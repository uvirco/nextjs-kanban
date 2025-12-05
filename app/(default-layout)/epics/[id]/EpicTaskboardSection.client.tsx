"use client";
import { useState } from "react";

interface EpicTaskboardSectionProps {
  epic: any;
  params: { id: string };
}

export default function EpicTaskboardSection({
  epic,
  params,
}: EpicTaskboardSectionProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);

  // Group subtasks by their column
  const tasksByColumn =
    epic.subtasks?.reduce((acc: any, task: any) => {
      const columnId = task.columnId || "unassigned";
      const columnTitle = task.column?.title || "Unassigned";

      if (!acc[columnId]) {
        acc[columnId] = {
          id: columnId,
          title: columnTitle,
          tasks: [],
        };
      }

      acc[columnId].tasks.push(task);
      return acc;
    }, {}) || {};

  const columns = Object.values(tasksByColumn);

  return (
    <div>
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="flex items-center gap-2 w-full text-left p-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
      >
        <span className="text-lg">📋</span>
        <span className="text-white font-medium flex-1">Task Board</span>
        {isCollapsed ? (
          <span className="text-zinc-400 text-sm">▶</span>
        ) : (
          <span className="text-zinc-400 text-sm">▼</span>
        )}
      </button>

      {!isCollapsed && (
        <div className="mt-2 p-4 bg-zinc-900 border border-zinc-800 rounded-lg">
          <div className="space-y-4">
            {columns.length === 0 ? (
              <div className="text-zinc-500 text-center py-8">
                No tasks to display on the board
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {columns.map((column: any) => (
                  <div
                    key={column.id}
                    className="bg-zinc-800 rounded-lg p-4 min-h-[200px] border border-zinc-700"
                  >
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-zinc-600">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <h3 className="text-white font-medium">{column.title}</h3>
                      <span className="text-zinc-400 text-sm ml-auto">
                        ({column.tasks.length})
                      </span>
                    </div>

                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {column.tasks.map((task: any) => (
                        <div
                          key={task.id}
                          className="bg-zinc-700 rounded p-3 hover:bg-zinc-600 transition-colors border border-zinc-600"
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h4 className="text-white text-sm font-medium flex-1 leading-tight">
                              {task.title}
                            </h4>

                            {task.status === "DONE" && (
                              <div className="flex-shrink-0 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs">✓</span>
                              </div>
                            )}
                          </div>

                          {task.description && (
                            <p className="text-zinc-400 text-xs mb-2 line-clamp-2">
                              {task.description}
                            </p>
                          )}

                          {task.assignments && task.assignments.length > 0 && (
                            <div className="flex items-center gap-2">
                              <div className="flex -space-x-1">
                                {task.assignments
                                  .slice(0, 3)
                                  .map((assignment: any, index: number) => (
                                    <div
                                      key={assignment.user.id}
                                      className="w-6 h-6 bg-zinc-600 rounded-full flex items-center justify-center border border-zinc-500"
                                      title={assignment.user.name}
                                    >
                                      <span className="text-zinc-300 text-xs font-medium">
                                        {assignment.user.name
                                          .charAt(0)
                                          .toUpperCase()}
                                      </span>
                                    </div>
                                  ))}
                              </div>
                              {task.assignments.length > 3 && (
                                <span className="text-zinc-400 text-xs">
                                  +{task.assignments.length - 3}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
