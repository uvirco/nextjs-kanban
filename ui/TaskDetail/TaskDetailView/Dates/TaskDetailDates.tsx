import { format, isSameMonth, isSameYear } from "date-fns";
import TaskDetailItemHeading from "../ui/TaskDetailItemHeading";
import { IconCalendar } from "@tabler/icons-react";
import TaskDetailItemContent from "../ui/TaskDetailItemContent";

interface TaskDetailDatesProps {
  startDate: Date | null;
  dueDate: Date | null;
  parentEpic?: {
    id: string;
    title: string;
  } | null;
  columnTitle: string;
  taskType?: string | null;
  taskTitle?: string;
}

export default function TaskDetailDates({
  startDate,
  dueDate,
  parentEpic,
  columnTitle,
  taskType,
  taskTitle,
}: TaskDetailDatesProps) {
  if (!startDate && !dueDate) {
    return null;
  }

  function formatDateDisplay(
    startDate: Date | null,
    dueDate: Date | null
  ): string {
    if (!startDate && !dueDate) return "";

    if (startDate && dueDate) {
      if (isSameMonth(startDate, dueDate) && isSameYear(startDate, dueDate)) {
        return `${format(startDate, "dd")} - ${format(dueDate, "dd MMM")}`;
      }
      return `${format(startDate, "dd MMM")} - ${format(dueDate, "dd MMM")}`;
    } else if (startDate) {
      return `Start Date: ${format(startDate, "dd MMM")}`;
    } else if (dueDate) {
      return `Due: ${format(dueDate, "dd MMM")}`;
    }
    return "";
  }

  return (
    <>
      <TaskDetailItemHeading title="Dates" icon={<IconCalendar />} />
      <TaskDetailItemContent indented>
        <div className="flex items-center gap-6">
          {(startDate || dueDate) && (
            <p className="text-sm text-zinc-400">
              {formatDateDisplay(startDate, dueDate)}
            </p>
          )}
          <div className="text-sm text-zinc-400">
            Epic:{" "}
            <span className="text-zinc-200">
              {parentEpic ? parentEpic.title : taskType === "EPIC" ? taskTitle : "No Epic selected"}
            </span>
          </div>
          <div className="text-sm text-zinc-400">
            Column: <span className="text-zinc-200">{columnTitle}</span>
          </div>
        </div>
      </TaskDetailItemContent>
    </>
  );
}
