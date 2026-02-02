"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  IconActivity,
  IconX,
  IconChevronDown,
  IconChevronRight,
} from "@tabler/icons-react";
import TaskDetailActivityItem from "./TaskDetailActivityItem";
import { handleCreateActivity, handleFetchActivities } from "@/server-actions/ActivityServerActions";
import TaskDetailItemHeading from "../ui/TaskDetailItemHeading";
import TaskDetailItemContent from "../ui/TaskDetailItemContent";
import { ActivityWithRelations } from "@/types/types";
import RichTextEditor from "@/ui/RichTextEditor";

interface TaskDetailActivityProps {
  taskId: string;
  boardId: string;
  activities: ActivityWithRelations[];
  columnTitle: string;
  userName: string | null;
  userImage: string | null;
}

export default function TaskDetailActivity({
  taskId,
  boardId,
  activities: initialActivities,
  columnTitle,
  userName,
  userImage,
}: TaskDetailActivityProps) {
  const [activities, setActivities] = useState<ActivityWithRelations[]>(initialActivities);
  const [showForm, setShowForm] = useState(false);
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refetch activities when component mounts or taskId changes
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const result = await handleFetchActivities(taskId);
        if (result.success && result.activities) {
          setActivities(result.activities as any);
        }
      } catch (err) {
        console.error("Failed to fetch activities:", err);
      }
    };

    fetchActivities();
  }, [taskId]);

  const handleToggleForm = () => {
    setShowForm(!showForm);
    setContent("");
    setError(null);
  };

  const handleChange = (value: string) => {
    setContent(value);
  };

  const onSubmitForm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await handleCreateActivity(taskId, boardId, content);
      console.log("[Comment Submit] Response:", response);
      
      if (response.success) {
        toast.success(response.message);
        handleToggleForm();
        
        // Refetch activities after successful submission
        try {
          console.log("[Comment Submit] Fetching activities for taskId:", taskId);
          const result = await handleFetchActivities(taskId);
          console.log("[Comment Submit] Fetch result:", result);
          
          if (result.success && result.activities) {
            console.log("[Comment Submit] Setting activities:", result.activities);
            setActivities(result.activities as any);
          }
        } catch (err) {
          console.error("Failed to refetch activities:", err);
        }
      } else {
        toast.error(response.message);
        setError(response.message);
      }
    } catch (error) {
      console.error("[Comment Submit] Exception:", error);
      toast.error("An error occurred while submitting the form");
      setError("An error occurred while submitting the form");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <TaskDetailItemHeading
        title="Comments"
        icon={<IconActivity size={32} />}
      />

      <TaskDetailItemContent indented>
        <div className="flex items-start mb-5 mt-4">
          <div className="w-[40px]">
            <Avatar className="w-8 h-8 border border-zinc-600">
              <AvatarImage
                src={userImage ?? undefined}
                alt={userName ?? "Unknown"}
              />
              <AvatarFallback className="text-xs bg-zinc-700 text-zinc-300">
                {(userName ?? "?").charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="w-full">
            {!showForm ? (
              <div className="flex items-center h-[32px]">
                <p
                  onClick={handleToggleForm}
                  className="cursor-pointer text-zinc-400 hover:text-zinc-300 pl-4"
                >
                  Add a comment
                </p>
              </div>
            ) : (
              <form onSubmit={onSubmitForm} className="w-full">
                <div className="mb-3">
                  <RichTextEditor
                    content={content}
                    onChange={handleChange}
                    placeholder="Add a comment..."
                    className="min-h-[100px]"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    type="submit"
                    disabled={isSubmitting || !content.trim()}
                    variant="secondary"
                  >
                    Save
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleToggleForm}
                    variant="outline"
                  >
                    <IconX size={20} className="text-zinc-600" />
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>

        <ul className="space-y-2">
          {activities &&
            activities
              .filter((activity: any) => activity.type === "COMMENT_ADDED")
              .map((activity: any) => (
                <TaskDetailActivityItem
                  key={activity.id}
                  activity={activity}
                  columnTitle={columnTitle}
                  boardId={boardId}
                />
              ))}
        </ul>
      </TaskDetailItemContent>
    </>
  );
}

export function TaskDetailActivityEntries({
  activities,
  columnTitle,
  boardId,
}: {
  activities: ActivityWithRelations[];
  columnTitle: string;
  boardId: string;
}) {
  const [isCollapsed, setIsCollapsed] = useState(true);

  const toggleCollapsed = () => {
    setIsCollapsed(!isCollapsed);
  };

  const activityEntries =
    activities?.filter((activity: any) => activity.type !== "COMMENT_ADDED") ||
    [];

  if (activityEntries.length === 0) {
    return null;
  }

  return (
    <>
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={toggleCollapsed}
      >
        <TaskDetailItemHeading
          title={`Activity (${activityEntries.length})`}
          icon={<IconActivity size={32} />}
        />
        <Button variant="ghost" size="sm" className="p-1 h-auto">
          {isCollapsed ? (
            <IconChevronRight size={16} className="text-zinc-400" />
          ) : (
            <IconChevronDown size={16} className="text-zinc-400" />
          )}
        </Button>
      </div>

      {!isCollapsed && (
        <TaskDetailItemContent indented>
          <ul className="space-y-2">
            {activityEntries.map((activity: any) => (
              <TaskDetailActivityItem
                key={activity.id}
                activity={activity}
                columnTitle={columnTitle}
                boardId={boardId}
              />
            ))}
          </ul>
        </TaskDetailItemContent>
      )}
    </>
  );
}
