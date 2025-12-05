"use client";
import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IconPlus, IconX } from "@tabler/icons-react";
import { handleCreateTask } from "@/server-actions/TaskServerActions";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

interface FormValues {
  title: string;
  description?: string;
  assignedUserId?: string;
}

interface EpicAddTaskProps {
  epicId: string;
  availableUsers: Array<{ id: string; name: string; email: string }>;
}

export default function EpicAddTask({
  epicId,
  availableUsers,
}: EpicAddTaskProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormValues>();

  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true);
    try {
      // Get the epic's board and column info
      const { data: epic } = await supabase
        .from("Task")
        .select("columnId")
        .eq("id", epicId)
        .single();

      if (!epic) {
        toast.error("Could not find epic");
        setIsLoading(false);
        return;
      }

      const { data: column } = await supabase
        .from("Column")
        .select("boardId")
        .eq("id", epic.columnId)
        .single();

      if (!column) {
        toast.error("Could not find epic board");
        setIsLoading(false);
        return;
      }

      const response = await handleCreateTask({
        taskTitle: data.title,
        description: data.description,
        boardId: column.boardId,
        columnId: epic.columnId, // Start in same column as epic
        parentTaskId: epicId, // Associate with this epic as parent
        assignedUserId: data.assignedUserId,
      });

      if (response.success) {
        toast.success("Task Created");
        reset();
        setShowForm(false);
        // Refresh the page to show the new task
        window.location.reload();
      } else {
        toast.error(response.message);
      }
    } catch (e) {
      toast.error("An error occurred while creating the task.");
    }
    setIsLoading(false);
  };

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="flex items-center gap-2 p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition-colors mt-4"
      >
        <IconPlus size={16} />
        Add Task
      </button>
    );
  }

  return (
    <div className="mt-4 p-4 bg-zinc-800 rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-white font-medium">Add New Task</h4>
        <button
          onClick={() => setShowForm(false)}
          className="text-zinc-400 hover:text-zinc-300"
        >
          <IconX size={16} />
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div>
          <Input
            placeholder="Task title..."
            {...register("title", { required: "Title is required" })}
            className="bg-zinc-700 border-zinc-600 text-white"
          />
          {errors.title && (
            <p className="text-red-400 text-sm mt-1">{errors.title.message}</p>
          )}
        </div>

        <div>
          <Textarea
            placeholder="Task description (optional)..."
            {...register("description")}
            className="bg-zinc-700 border-zinc-600 text-white"
            rows={3}
          />
        </div>

        <div>
          <Select onValueChange={(value) => setValue("assignedUserId", value)}>
            <SelectTrigger className="bg-zinc-700 border-zinc-600 text-white">
              <SelectValue placeholder="Assign to (optional)" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-800 border-zinc-700">
              {availableUsers.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.name || user.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button
            type="submit"
            disabled={isLoading}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <IconPlus size={16} className="mr-2" />
            {isLoading ? "Creating..." : "Create Task"}
          </Button>
          <Button
            type="button"
            onClick={() => setShowForm(false)}
            size="sm"
            variant="outline"
            className="border-zinc-600 text-zinc-300 hover:bg-zinc-700"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
