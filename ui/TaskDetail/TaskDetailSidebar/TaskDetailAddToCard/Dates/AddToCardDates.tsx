"use client";
import { DetailedTask } from "@/types/types";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
    <li className="bg-muted hover:bg-muted/80 border border-border rounded-md hover:border-primary transition-colors">
      <Popover>
        <PopoverTrigger asChild>
          <button className="flex items-center gap-2 px-2 py-2 w-full">
            <IconCalendar size={14} /> Dates
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
    </li>
  );
}
