"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  handleAddDate,
  handleRemoveDate,
} from "@/server-actions/DateServerActions";
import { toast } from "sonner";
import { format } from "date-fns";

interface AddToCardDatesCalendarProps {
  taskId: string;
  boardId: string;
  startDate: Date | null;
  dueDate: Date | null;
}

interface AddToCardDatesCalendarProps {
  taskId: string;
  boardId: string;
  startDate: Date | null;
  dueDate: Date | null;
}

export default function AddToCardDatesCalendar({
  taskId,
  boardId,
  startDate,
  dueDate,
}: AddToCardDatesCalendarProps) {
  const [startDateValue, setStartDateValue] = useState(
    startDate ? format(startDate, "yyyy-MM-dd") : ""
  );
  const [dueDateValue, setDueDateValue] = useState(
    dueDate ? format(dueDate, "yyyy-MM-dd") : ""
  );
  const [isLoading, setIsLoading] = useState(false);

  const sendDateRequest = async (
    newDate: string,
    dateType: "startDate" | "dueDate",
  ) => {
    if (!newDate) return;

    setIsLoading(true);
    try {
      const data = {
        taskId: taskId,
        date: newDate,
        boardId: boardId,
        dateType: dateType,
      };

      const response = await handleAddDate(data);

      if (response.success) {
        toast.success(response.message);
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      toast.error(
        `Failed to Update ${dateType === "dueDate" ? "Due Date" : "Start Date"}`,
      );
    } finally {
      setIsLoading(false);
    }
  };

  const removeDates = async () => {
    setIsLoading(true);
    try {
      const dataStartDate = {
        taskId: taskId,
        boardId: boardId,
        dateType: "startDate" as "startDate",
      };
      const dataDueDate = {
        taskId: taskId,
        boardId: boardId,
        dateType: "dueDate" as "dueDate",
      };

      const responseStartDate = await handleRemoveDate(dataStartDate);
      const responseDueDate = await handleRemoveDate(dataDueDate);

      if (responseStartDate.success && responseDueDate.success) {
        toast.success("Dates removed successfully");
        setStartDateValue("");
        setDueDateValue("");
      } else {
        throw new Error(responseStartDate.message || responseDueDate.message);
      }
    } catch (error) {
      toast.error(`Failed to Remove Dates`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-4 min-w-64">
      <div className="space-y-2">
        <label htmlFor="start-date" className="text-sm font-medium">Start Date</label>
        <Input
          id="start-date"
          type="date"
          value={startDateValue}
          onChange={(e) => {
            setStartDateValue(e.target.value);
            sendDateRequest(e.target.value, "startDate");
          }}
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="due-date" className="text-sm font-medium">Due Date</label>
        <Input
          id="due-date"
          type="date"
          value={dueDateValue}
          onChange={(e) => {
            setDueDateValue(e.target.value);
            sendDateRequest(e.target.value, "dueDate");
          }}
          disabled={isLoading}
        />
      </div>

      <Button
        onClick={removeDates}
        disabled={isLoading}
        variant="destructive"
        size="sm"
        className="w-full"
      >
        Remove Dates
      </Button>
    </div>
  );
}
