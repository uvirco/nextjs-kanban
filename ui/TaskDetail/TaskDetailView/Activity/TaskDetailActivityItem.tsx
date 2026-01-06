"use client";
import { useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ActivityWithUser } from "@/types/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { IconEdit, IconMoodPlus, IconTrash, IconX, IconCheck } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import RichTextEditor from "@/ui/RichTextEditor";
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
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(activity.content || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    setIsEditing(true);
    setEditContent(activity.content || "");
  };

  const handleSave = async () => {
    if (!editContent.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/activities/${activity.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: editContent.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(data.message);
        setIsEditing(false);
        // Refresh the page to show updated content
        window.location.reload();
      } else {
        toast.error(data.error || "Failed to update comment");
      }
    } catch (error) {
      toast.error("Failed to update comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditContent(activity.content || "");
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
        <Avatar className="w-8 h-8 border border-zinc-600">
          <AvatarImage
            src={activity.user.image ?? undefined}
            alt={activity.user.name ?? "Unknown"}
          />
          <AvatarFallback className="text-xs bg-zinc-700 text-zinc-300">
            {(activity.user.name ?? "?").charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </div>
      <div className="flex-1 min-w-0">
        {activity.type === "COMMENT_ADDED" ? (
          <div className="bg-zinc-800 border border-zinc-700 px-3 py-1 rounded-xl w-full">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-zinc-100">
                {activity.user.name}
              </span>
              <span className="text-zinc-400 text-xs">{formattedDate}</span>
            </div>
            {isEditing ? (
              <div className="mt-2 space-y-3">
                <RichTextEditor
                  content={editContent}
                  onChange={setEditContent}
                  placeholder="Edit your comment..."
                  className="min-h-[100px]"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={isSubmitting || !editContent.trim()}
                    variant="secondary"
                  >
                    <IconCheck size={16} />
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleCancel}
                    disabled={isSubmitting}
                    variant="outline"
                  >
                    <IconX size={16} className="text-zinc-600" />
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div
                  className="text-zinc-200 text-sm prose prose-invert prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: activity.content || "" }}
                />
                <div className="flex gap-2">
                  <button onClick={handleReaction}>
                    <IconMoodPlus
                      className="text-zinc-400 hover:text-zinc-300"
                      size={16}
                    />
                  </button>
                  <button onClick={handleEdit}>
                    <IconEdit
                      className="text-zinc-400 hover:text-zinc-300"
                      size={16}
                    />
                  </button>
                  <button onClick={handleDelete}>
                    <IconTrash
                      className="text-red-400 hover:text-red-300"
                      size={16}
                    />
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="bg-zinc-800 border border-zinc-700 px-4 py-2 rounded-md w-full">
            <div className="text-zinc-200 flex items-center gap-2">
              <span className="font-semibold text-sm text-zinc-100">
                {activity.user.name}
              </span>
              <span className="text-xs text-zinc-400">{formattedDate}</span>
              <span className="text-sm text-zinc-200">
                {getActivityMessage(activity)}
              </span>
            </div>
          </div>
        )}
      </div>
    </li>
  );
}
