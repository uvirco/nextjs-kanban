"use client";

import { useState, useEffect } from "react";
import {
  IconActivity,
  IconEdit,
  IconTrash,
  IconArrowRight,
  IconMessageCircle,
  IconCalendarPlus,
  IconCalendarEvent,
  IconCalendarMinus,
  IconUserPlus,
  IconUserMinus,
  IconStar,
  IconNotes,
  IconNote,
  IconPlus,
  IconRefresh,
  IconChevronDown,
  IconChevronUp,
} from "@tabler/icons-react";
import "quill/dist/quill.snow.css";

// Inline styles for read-only Quill content
const quillReadOnlyStyles = `
  .ql-editor.ql-disabled {
    color: inherit !important;
    padding: 0 !important;
    background: transparent !important;
    border: none !important;
  }
  
  .ql-editor.ql-disabled p {
    margin: 0.5em 0 !important;
    font-size: inherit !important;
    line-height: 1.4 !important;
  }
  
  .ql-editor.ql-disabled ol, .ql-editor.ql-disabled ul {
    padding-left: 1.5em !important;
    margin: 0.5em 0 !important;
  }
  
  .ql-editor.ql-disabled blockquote {
    border-left: 4px solid currentColor;
    padding-left: 1em;
    margin: 0.5em 0 !important;
    color: #a1a1aa;
  }
  
  .ql-editor.ql-disabled pre {
    background-color: rgba(0,0,0,0.3);
    padding: 0.5em;
    border-radius: 0.25em;
    margin: 0.5em 0 !important;
  }
  
  .ql-editor.ql-disabled a {
    color: #3b82f6;
    text-decoration: underline;
  }
  
  .ql-editor.ql-disabled strong {
    font-weight: 600 !important;
  }
  
  .ql-editor.ql-disabled em {
    font-style: italic !important;
  }
  
  .ql-editor.ql-disabled u {
    text-decoration: underline !important;
  }
  
  .ql-editor.ql-disabled s {
    text-decoration: line-through !important;
  }
`;

interface Activity {
  id: string;
  type: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
  task?: {
    id: string;
    title: string;
    taskType?: string;
  };
  board?: {
    id: string;
    title: string;
  };
  targetUser?: {
    id: string;
    name: string;
    email: string;
  };
}

export default function EpicActivityTab({ epicId }: { epicId: string }) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [expandedActivities, setExpandedActivities] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchActivities();
  }, [epicId]);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("limit", "100");
      params.set("epicId", epicId);
      params.set("t", new Date().getTime().toString()); // Cache bust

      const response = await fetch(`/api/activities?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        console.log("Fetched activities:", data.activities);
        setActivities(data.activities || []);
      }
    } catch (error) {
      console.error("Failed to fetch activities:", error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchActivities();
  };

  const toggleExpanded = (activityId: string) => {
    const newExpanded = new Set(expandedActivities);
    if (newExpanded.has(activityId)) {
      newExpanded.delete(activityId);
    } else {
      newExpanded.add(activityId);
    }
    setExpandedActivities(newExpanded);
  };

  const getActivityIcon = (type: string) => {
    const iconProps = { size: 16 };
    switch (type) {
      case "TASK_CREATED":
        return <IconPlus {...iconProps} />;
      case "TASK_UPDATED":
        return <IconEdit {...iconProps} />;
      case "TASK_MOVED":
        return <IconArrowRight {...iconProps} />;
      case "TASK_DELETED":
        return <IconTrash {...iconProps} />;
      case "COMMENT_ADDED":
        return <IconMessageCircle {...iconProps} />;
      case "MEETING_NOTE_ADDED":
        return <IconNote {...iconProps} />;
      case "QUICK_NOTE_ADDED":
        return <IconNotes {...iconProps} />;
      case "DUE_DATE_ADDED":
      case "DUE_DATE_UPDATED":
        return <IconCalendarPlus {...iconProps} />;
      case "DUE_DATE_REMOVED":
        return <IconCalendarMinus {...iconProps} />;
      case "START_DATE_ADDED":
      case "START_DATE_UPDATED":
        return <IconCalendarEvent {...iconProps} />;
      case "START_DATE_REMOVED":
        return <IconCalendarMinus {...iconProps} />;
      case "TASK_ASSIGNED":
        return <IconUserPlus {...iconProps} />;
      case "TASK_UNASSIGNED":
        return <IconUserMinus {...iconProps} />;
      default:
        return <IconActivity {...iconProps} />;
    }
  };

  const getActivityDescription = (activity: Activity) => {
    const user = activity.user?.name || "Unknown";
    switch (activity.type) {
      case "TASK_CREATED":
        return `${user} created task "${activity.task?.title}"`;
      case "TASK_UPDATED":
        return `${user} updated task "${activity.task?.title}"`;
      case "TASK_MOVED":
        return `${user} moved task "${activity.task?.title}"`;
      case "TASK_DELETED":
        return `${user} deleted task`;
      case "COMMENT_ADDED":
        return `${user} commented on "${activity.task?.title}"`;
      case "MEETING_NOTE_ADDED":
        return `${user} added meeting note to "${activity.task?.title}"`;
      case "QUICK_NOTE_ADDED":
        return `${user} added quick note to "${activity.task?.title}"`;
      case "TASK_ASSIGNED":
        return `${user} assigned "${activity.task?.title}" to ${activity.targetUser?.name}`;
      case "TASK_UNASSIGNED":
        return `${user} unassigned "${activity.task?.title}"`;
      default:
        return `${user} performed action on "${activity.task?.title}"`;
    }
  };

  const decodeHtmlEntities = (text: string) => {
    return text
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .replace(/&nbsp;/g, " ");
  };

  const stripHtmlTags = (text: string) => {
    return text
      .replace(/<p>/g, "")
      .replace(/<\/p>/g, "\n")
      .replace(/<br\s*\/?>/g, "\n")
      .replace(/<[^>]*>/g, "")
      .trim();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <p className="text-zinc-400">Loading activities...</p>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex justify-end">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3 py-1 text-sm bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 rounded text-zinc-300 transition-colors"
            title="Refresh activities"
          >
            <IconRefresh size={16} />
            Refresh
          </button>
        </div>
        <div className="flex justify-center items-center p-8">
          <p className="text-zinc-400">No activities found for this project</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <style jsx global>{quillReadOnlyStyles}</style>
      {/* Refresh button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-3 py-1 text-sm bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 rounded text-zinc-300 transition-colors"
          title="Refresh activities"
        >
          <IconRefresh size={16} />
          Refresh
        </button>
      </div>
      {activities.map((activity) => (
        <div
          key={activity.id}
          className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 hover:bg-zinc-800/50 transition-colors"
        >
          <div className="flex gap-4">
            {/* Icon */}
            <div className="flex-shrink-0 text-zinc-400 mt-1">
              {getActivityIcon(activity.type)}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Description */}
              <p className="text-sm text-white font-medium">
                {getActivityDescription(activity)}
              </p>

              {/* Activity content if available */}
              {activity.content && (
                <div className="mt-2">
                  {activity.type === "QUICK_NOTE_ADDED" || activity.type === "MEETING_NOTE_ADDED" ? (
                    <div className="bg-zinc-800/50 rounded p-3 border border-zinc-700">
                      {!expandedActivities.has(activity.id) && (
                        <>
                          <div className="text-xs text-zinc-300 ql-editor ql-disabled line-clamp-3" dangerouslySetInnerHTML={{ __html: activity.content }} />
                          <button
                            onClick={() => toggleExpanded(activity.id)}
                            className="mt-2 text-xs text-blue-400 hover:text-blue-300 font-medium"
                          >
                            ▼ Read More
                          </button>
                        </>
                      )}
                      {expandedActivities.has(activity.id) && (
                        <>
                          <div className="text-xs text-zinc-300 ql-editor ql-disabled max-h-96 overflow-y-auto" dangerouslySetInnerHTML={{ __html: activity.content }} />
                          <button
                            onClick={() => toggleExpanded(activity.id)}
                            className="mt-2 text-xs text-blue-400 hover:text-blue-300 font-medium"
                          >
                            ▲ Show Less
                          </button>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="mt-2 text-xs text-zinc-400">
                      {activity.content.length > 300 ? (
                        <>
                          {decodeHtmlEntities(activity.content.substring(0, 300))}
                          ...
                        </>
                      ) : (
                        decodeHtmlEntities(activity.content)
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Timestamp and User */}
              <div className="flex items-center gap-2 mt-2 text-xs text-zinc-500">
                {activity.user?.image && (
                  <img
                    src={activity.user.image}
                    alt={activity.user.name}
                    className="w-4 h-4 rounded-full"
                  />
                )}
                <span>{activity.user?.name}</span>
                <span>•</span>
                <span>
                  {new Date(activity.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year:
                      new Date(activity.createdAt).getFullYear() !==
                      new Date().getFullYear()
                        ? "numeric"
                        : undefined,
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
