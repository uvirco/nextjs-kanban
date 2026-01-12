"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import {
  IconClock,
  IconFileDescription,
  IconGripVertical,
  IconPlus,
  IconX,
} from "@tabler/icons-react";
import Link from "next/link";
import { useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import {
  handleUpdateTaskPosition,
  handleCreateTask,
} from "@/server-actions/TaskServerActions";

interface BoardProps {
  boardId: string;
  epicId?: string; // Optional filter for epic-specific tasks
}

interface Column {
  id: string;
  title: string;
  order: number;
  tasks: Task[];
}

interface Task {
  id: string;
  title: string;
  description?: string;
  columnId: string;
  order: number;
  parentTaskId?: string;
  startDate?: string;
  dueDate?: string;
  labels?: Array<{
    label: {
      id: string;
      title: string;
      color: string;
    };
  }>;
  assignments?: Array<{
    user: {
      id: string;
      name: string;
      email: string;
      image?: string;
    };
  }>;
}

interface BoardData {
  id: string;
  title: string;
  columns: Column[];
}

export default function Board({ boardId, epicId }: BoardProps) {
  const [board, setBoard] = useState<BoardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [addingTaskToColumn, setAddingTaskToColumn] = useState<string | null>(
    null
  );
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const router = useRouter();

  const handleTaskClick = (taskId: string) => {
    // If this board is part of an epic, preserve that context in the URL
    if (epicId) {
      router.push(`/projects/tasks/${taskId}`);
    } else {
      router.push(`/projects/tasks/${taskId}`);
    }
  };

  const handleAddTask = async (columnId: string) => {
    if (!newTaskTitle.trim()) {
      toast.error("Task title is required");
      return;
    }

    setIsCreatingTask(true);
    try {
      const response = await handleCreateTask({
        taskTitle: newTaskTitle,
        columnId,
        boardId,
        parentTaskId: epicId, // If epicId is provided, associate task with epic
      });

      if (response.success) {
        toast.success("Task created");
        setNewTaskTitle("");
        setAddingTaskToColumn(null);
        await fetchBoard(); // Refresh board to show new task
      } else {
        toast.error(response.message || "Failed to create task");
      }
    } catch (error) {
      console.error("Error creating task:", error);
      toast.error("Failed to create task");
    } finally {
      setIsCreatingTask(false);
    }
  };

  useEffect(() => {
    fetchBoard();
  }, [boardId, epicId]);

  const fetchBoard = async () => {
    try {
      // First fetch the board basic info
      const { data: boardBasic, error: boardBasicError } = await supabase
        .from("Board")
        .select("id, title")
        .eq("id", boardId)
        .single();

      if (boardBasicError) throw boardBasicError;

      // Fetch columns for this board
      const { data: columnsData, error: columnsError } = await supabase
        .from("Column")
        .select("id, title, order")
        .eq("boardId", boardId)
        .order("order", { ascending: true });

      if (columnsError) throw columnsError;

      // Fetch all tasks for the board columns
      const columnIds = (columnsData || []).map((col: any) => col.id);
      let tasksQuery = supabase
        .from("Task")
        .select(
          `
          id,
          title,
          description,
          columnId,
          order,
          parentTaskId,
          startDate,
          dueDate,
          assignments:TaskAssignment(user:User(id, name, email, image))
        `
        )
        .in("columnId", columnIds)
        .order("order", { ascending: true });

      // If epicId is provided, filter tasks to only show those belonging to this epic
      if (epicId) {
        tasksQuery = tasksQuery.eq("parentTaskId", epicId);
      }

      const { data: tasksData, error: tasksError } = await tasksQuery;

      if (tasksError) throw tasksError;

      // Fetch labels for all tasks
      const taskIds = (tasksData || []).map((t: any) => t.id);
      let labelAssignments = [];
      if (taskIds.length > 0) {
        const { data: relations } = await supabase
          .from("_LabelToTask")
          .select("A, B")
          .in("B", taskIds);

        if (relations && relations.length > 0) {
          const labelIds = relations.map((rel: any) => rel.A);
          const { data: labels } = await supabase
            .from("Label")
            .select("id, title, color")
            .in("id", labelIds);

          // Combine relations with label data
          labelAssignments = (relations || []).map((rel: any) => ({
            ...rel,
            label: (labels || []).find((l: any) => l.id === rel.A),
          })).filter((la: any) => la.label);
        }
      }

      // Combine the data
      const enrichedTasks = (tasksData || []).map((task: any) => ({
        ...task,
        labels: (labelAssignments || [])
          .filter((la: any) => la.B === task.id)
          .map((la: any) => ({ label: la.label })),
      }));

      const boardData = {
        ...boardBasic,
        columns: (columnsData || []).map((column: any) => ({
          ...column,
          tasks: enrichedTasks.filter(
            (task: any) => task.columnId === column.id
          ),
        })),
      };

      // Sort columns by order (already sorted from query)
      // Sort tasks within each column by order (already sorted from query)

      setBoard(boardData);
    } catch (error) {
      console.error("Error fetching board:", error);
      toast.error("Failed to load board");
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId, type } = result;

    if (!destination || !board) {
      return;
    }

    if (type === "COLUMN") {
      // Handle column reordering
      const newColumns = Array.from(board.columns);
      const [removed] = newColumns.splice(source.index, 1);
      newColumns.splice(destination.index, 0, removed);

      const updatedColumns = newColumns.map((col, index) => ({
        ...col,
        order: index + 1,
      }));

      setBoard({ ...board, columns: updatedColumns });
      return;
    }

    if (source.droppableId === destination.droppableId) {
      // Same column, reorder tasks
      const column = board.columns.find((col) => col.id === source.droppableId);
      if (!column) return;

      const newTasks = Array.from(column.tasks);
      const [removed] = newTasks.splice(source.index, 1);
      newTasks.splice(destination.index, 0, removed);

      const updatedTasks = newTasks.map((task, index) => ({
        ...task,
        order: index + 1,
      }));

      const updatedColumns = board.columns.map((col) =>
        col.id === source.droppableId ? { ...col, tasks: updatedTasks } : col
      );

      setBoard({ ...board, columns: updatedColumns });

      // Update task order in database
      try {
        await handleUpdateTaskPosition({
          id: draggableId,
          order: destination.index + 1,
          boardId,
        });
      } catch (error) {
        console.error("Error updating task order:", error);
        toast.error("Failed to update task order");
        fetchBoard(); // Revert on error
      }
    } else {
      // Different column, move task
      const sourceColumn = board.columns.find(
        (col) => col.id === source.droppableId
      );
      const destColumn = board.columns.find(
        (col) => col.id === destination.droppableId
      );

      if (!sourceColumn || !destColumn) return;

      const sourceTasks = Array.from(sourceColumn.tasks);
      const destTasks = Array.from(destColumn.tasks);
      const [movedTask] = sourceTasks.splice(source.index, 1);

      // Update task properties
      const updatedTask = {
        ...movedTask,
        columnId: destination.droppableId,
        order: destination.index + 1,
      };

      destTasks.splice(destination.index, 0, updatedTask);

      // Update orders for remaining tasks in source column
      const updatedSourceTasks = sourceTasks.map((task, index) => ({
        ...task,
        order: index + 1,
      }));

      // Update orders for tasks in destination column
      const updatedDestTasks = destTasks.map((task, index) => ({
        ...task,
        order: index + 1,
      }));

      const updatedColumns = board.columns.map((col) => {
        if (col.id === source.droppableId) {
          return { ...col, tasks: updatedSourceTasks };
        }
        if (col.id === destination.droppableId) {
          return { ...col, tasks: updatedDestTasks };
        }
        return col;
      });

      setBoard({ ...board, columns: updatedColumns });

      // Update task in database
      try {
        await handleUpdateTaskPosition({
          id: draggableId,
          columnId: destination.droppableId,
          order: destination.index + 1,
          boardId,
        });
      } catch (error) {
        console.error("Error moving task:", error);
        toast.error("Failed to move task");
        fetchBoard(); // Revert on error
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-zinc-400">Loading board...</div>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-zinc-400">Board not found</div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto max-w-full">
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-6 pb-4 min-h-[400px]">
          {board.columns.map((column) => (
            <div
              key={column.id}
              className="bg-zinc-800 rounded-lg p-4 min-w-[300px] max-w-[300px] flex flex-col"
            >
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-zinc-600">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <h3 className="text-white font-medium">{column.title}</h3>
                <span className="text-zinc-400 text-sm ml-auto">
                  ({column.tasks.length})
                </span>
              </div>

              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 space-y-2 min-h-[200px] rounded-lg p-2 transition-colors ${
                      snapshot.isDraggingOver ? "bg-zinc-700/50" : ""
                    }`}
                  >
                    {column.tasks.map((task, index) => (
                      <Draggable
                        key={task.id}
                        draggableId={task.id}
                        index={index}
                      >
                        {(provided, snapshot) => {
                          const renderDateInfo = useMemo(() => {
                            const startDate = task.startDate
                              ? format(new Date(task.startDate), "d MMM")
                              : null;
                            const dueDate = task.dueDate
                              ? format(new Date(task.dueDate), "d MMM")
                              : null;

                            if (startDate && dueDate) {
                              return `${startDate} - ${dueDate}`;
                            } else if (startDate) {
                              return `Started: ${startDate}`;
                            } else if (dueDate) {
                              return dueDate;
                            } else {
                              return null;
                            }
                          }, [task.startDate, task.dueDate]);

                          const showInfo = useMemo(() => {
                            return (
                              task.description ||
                              task.startDate ||
                              task.dueDate ||
                              (task.assignments && task.assignments.length > 0)
                            );
                          }, [
                            task.description,
                            task.startDate,
                            task.dueDate,
                            task.assignments?.length,
                          ]);

                          return (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className="bg-zinc-900 text-white flex select-none rounded-md hover:shadow-md hover:ring-2 hover:ring-primary"
                            >
                              <div
                                className="pl-1 pr-1 flex items-center cursor-grab touch-none"
                                {...provided.dragHandleProps}
                              >
                                <IconGripVertical
                                  className="text-primary"
                                  size={24}
                                />
                              </div>

                              <Link
                                className="flex-grow pr-3 py-2"
                                href={`/projects/tasks/${task.id}`}
                              >
                                {/* Labels would go here if available */}
                                {task.labels && task.labels.length > 0 && (
                                  <div className="grid grid-cols-5 gap-1 w-full mb-1">
                                    {task.labels.map((labelOnTask) => (
                                      <span
                                        key={labelOnTask.label.id}
                                        className={`bg-${labelOnTask.label.color}-500 text-xs h-2 w-full rounded-full`}
                                      />
                                    ))}
                                  </div>
                                )}

                                <div className="text-sm cursor-pointer">
                                  {task.title}
                                </div>

                                {showInfo && (
                                  <div className="flex gap-3 items-center justify-between mt-1">
                                    <div className="flex gap-3 items-center">
                                      {renderDateInfo && (
                                        <div className="flex items-center gap-1 text-xs text-zinc-400">
                                          <IconClock size={14} />{" "}
                                          {renderDateInfo}
                                        </div>
                                      )}

                                      {task.description && (
                                        <div className="text-zinc-500">
                                          <IconFileDescription size={14} />
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}

                                <div className="flex justify-between items-center mt-3">
                                  {task.assignments &&
                                  task.assignments.length > 0 ? (
                                    <div className="flex -space-x-2">
                                      {task.assignments
                                        .slice(0, 3)
                                        .map((assignment) => (
                                          <div
                                            key={assignment.user.id}
                                            className="w-6 h-6 rounded-full border-2 border-zinc-900 bg-zinc-700 flex items-center justify-center overflow-hidden"
                                            title={
                                              assignment.user.name || "Unknown"
                                            }
                                          >
                                            {assignment.user.image ? (
                                              <img
                                                src={assignment.user.image}
                                                alt={
                                                  assignment.user.name ||
                                                  "Unknown"
                                                }
                                                className="w-full h-full object-cover"
                                              />
                                            ) : (
                                              <span className="text-xs text-zinc-300">
                                                {(assignment.user.name || "?")
                                                  .charAt(0)
                                                  .toUpperCase()}
                                              </span>
                                            )}
                                          </div>
                                        ))}
                                      {task.assignments.length > 3 && (
                                        <div
                                          className="w-6 h-6 rounded-full border-2 border-zinc-900 bg-zinc-700 flex items-center justify-center"
                                          title={`+${task.assignments.length - 3} more`}
                                        >
                                          <span className="text-xs text-zinc-300">
                                            +{task.assignments.length - 3}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <div />
                                  )}
                                </div>
                              </Link>
                            </div>
                          );
                        }}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>

              {/* Add Task Button/Form */}
              {addingTaskToColumn === column.id ? (
                <div className="mt-2 p-2 bg-zinc-700 rounded-lg">
                  <input
                    type="text"
                    placeholder="Enter task title..."
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleAddTask(column.id);
                      } else if (e.key === "Escape") {
                        setAddingTaskToColumn(null);
                        setNewTaskTitle("");
                      }
                    }}
                    className="w-full bg-zinc-600 text-white px-3 py-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                    disabled={isCreatingTask}
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleAddTask(column.id)}
                      disabled={isCreatingTask}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isCreatingTask ? "Adding..." : "Add Task"}
                    </button>
                    <button
                      onClick={() => {
                        setAddingTaskToColumn(null);
                        setNewTaskTitle("");
                      }}
                      disabled={isCreatingTask}
                      className="bg-zinc-600 hover:bg-zinc-500 text-white px-3 py-1.5 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <IconX size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setAddingTaskToColumn(column.id)}
                  className="mt-2 flex items-center gap-2 text-zinc-400 hover:text-white hover:bg-zinc-700 px-3 py-2 rounded text-sm transition-colors w-full"
                >
                  <IconPlus size={16} />
                  Add Task
                </button>
              )}
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
