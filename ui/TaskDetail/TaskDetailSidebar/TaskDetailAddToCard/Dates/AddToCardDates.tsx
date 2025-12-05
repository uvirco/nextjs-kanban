"use client";
import { DetailedTask } from "@/types/types";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { IconCalendar } from "@tabler/icons-react";
import AddToCardDatesCalendar from "./AddToCardDatesCalendar";

export default function AddToCardDates({
  taskId,
  boardId,
  startDate,
  dueDate,
}: {
  taskId: string;
  boardId: string;
  startDate: Date | null;
  dueDate: Date | null;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="w-8 h-8 flex items-center justify-center rounded-md bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-600 transition-colors"
          title="Add Dates"
        >
          <IconCalendar size={16} className="text-zinc-400" />
        </button>
      </PopoverTrigger>
      <PopoverContent side="left" align="start">
        <AddToCardDatesCalendar
          taskId={taskId}
          boardId={boardId}
          startDate={startDate}
          dueDate={dueDate}
        />
      </PopoverContent>
    </Popover>
  );
}
