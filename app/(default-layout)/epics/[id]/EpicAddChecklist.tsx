"use client";
import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IconCheckbox, IconPlus, IconX } from "@tabler/icons-react";
import { handleCreateChecklist } from "@/server-actions/ChecklistServerActions";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

interface FormValues {
  title: string;
}

export default function EpicAddChecklist({ epicId }: { epicId: string }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      title: "",
    },
  });

  const [isLoading, setIsLoading] = useState(false);

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true);
    try {
      // Get the epic's board ID
      const { data: epic, error } = await supabase
        .from("Task")
        .select("columnId")
        .eq("id", epicId)
        .single();

      if (error || !epic) {
        toast.error("Could not find epic board");
        setIsLoading(false);
        return;
      }

      // Get the board ID from the column
      const { data: column, error: columnError } = await supabase
        .from("Column")
        .select("boardId")
        .eq("id", epic.columnId)
        .single();

      if (columnError || !column) {
        toast.error("Could not find epic board");
        setIsLoading(false);
        return;
      }

      const response = await handleCreateChecklist({
        title: data.title || undefined,
        taskId: epicId,
        boardId: column.boardId,
      });

      if (response.success) {
        toast.success("Checklist Created");
        reset();
        // Refresh the page to show the new checklist
        window.location.reload();
      } else {
        toast.error(response.message);
      }
    } catch (e) {
      toast.error("An error occurred while creating the checklist.");
    }
    setIsLoading(false);
  };

  return (
    <div className="mt-4">
      <form onSubmit={handleSubmit(onSubmit)} className="flex gap-2">
        <div className="flex-1">
          <Input
            placeholder="Add a checklist..."
            {...register("title")}
            className="bg-zinc-800 border-zinc-700 text-white"
          />
        </div>
        <Button
          type="submit"
          disabled={isLoading}
          size="sm"
          className="flex items-center gap-2 bg-zinc-700 hover:bg-zinc-600 text-white border-zinc-600"
        >
          <IconPlus size={16} />
          Add
        </Button>
      </form>
    </div>
  );
}
