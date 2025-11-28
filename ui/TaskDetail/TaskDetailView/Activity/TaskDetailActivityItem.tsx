"use client";
import { toast } from "sonner";
import { format } from "date-fns";
import { ActivityWithUser } from "@/types/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { IconEdit, IconMoodPlus, IconTrash } from "@tabler/icons-react";
import { handleDeleteActivity } from "@/server-actions/ActivityServerActions";

interface TaskDetailActivityItemProps {
  activity: ActivityWithUser;
  columnTitle: string;
  boardId: string;
}

export default function TaskDetailActivityItem({
  activity,
  boardId,
}: TaskDetailActivityItemProps) {
  const formattedDate = format(
    new Date(activity.createdAt),
    "MM/dd/yyyy, HH:mm:ss"
  );

  const formatDate = (date: Date | null) => {
    return date ? format(new Date(date), "dd/MM/yyyy") : "N/A";
  };

  const getActivityMessage = (activity: ActivityWithUser) => {
    switch (activity.type) {
      case "TASK_MOVED":
        return ` moved this card from ${activity.oldColumn?.title} to ${activity.newColumn?.title}`;
      case "TASK_CREATED":
        return ` added this card to ${activity.originalColumn?.title}`;
      case "START_DATE_ADDED":
        return ` set the start date to ${formatDate(activity.startDate)}`;
      case "START_DATE_UPDATED":
        return ` changed the start date to ${formatDate(activity.startDate)}`;
      case "START_DATE_REMOVED":
        return ` removed the start date`;
      case "DUE_DATE_ADDED":
        return ` set the due date to ${formatDate(activity.dueDate)}`;
      case "DUE_DATE_UPDATED":
        return ` changed the due date to ${formatDate(activity.dueDate)}`;
      case "DUE_DATE_REMOVED":
        return ` removed the due date`;
      default:
        return activity.content;
    }
  };

  const handleEdit = () => {
    console.log("Edit comment");
    // Implement edit functionality
  };

  const handleReaction = () => {
    console.log("Add reaction");
    // Implement reaction functionality
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this activity?")) {
      const deletionData = {
        boardId: boardId,
        activityId: activity.id,
      };
      const response = await handleDeleteActivity(deletionData);
      if (response.success) {
        toast.success("Activity Deleted");
      } else {
        toast.error(response.message);
      }
    }
  };

  return (
    <li className="flex items-start">
      <div className="w-[40px]">
        <Avatar className="w-8 h-8">
          <AvatarImage
            src={activity.user.image ?? undefined}
            alt={activity.user.name ?? "Unknown"}
          />
          <AvatarFallback className="text-xs">
            {(activity.user.name ?? "?").charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </div>
      <div>
        {activity.type === "COMMENT_ADDED" ? (
          <div className="bg-muted px-3 py-1 rounded-xl">
            <span className="font-semibold">{activity.user.name} </span>
            <span className="text-muted-foreground text-xs">
              {formattedDate}
            </span>
            <div className="text-sm">{activity.content}</div>
            <div className="flex gap-2">
              <button onClick={handleReaction}>
                <IconMoodPlus className="text-muted-foreground" size={16} />
              </button>
              <button onClick={handleEdit}>
                <IconEdit className="text-muted-foreground" size={16} />
              </button>
              <button onClick={handleDelete}>
                <IconTrash className="text-destructive" size={16} />
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-card border border-border px-4 py-3 rounded-md">
            <div>
              <span className="font-semibold text-sm">
                {activity.user.name}{" "}
              </span>
              {getActivityMessage(activity)}
            </div>
            <div className="text-xs text-muted-foreground">{formattedDate}</div>
          </div>
        )}
      </div>
    </li>
  );
}
