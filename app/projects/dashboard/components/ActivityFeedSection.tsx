"use client";

import { useState, useEffect } from "react";
import {
  IconActivity,
  IconPlus,
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
  IconLayout,
  IconFilter,
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

interface ActivityFeedSectionProps {
  dateRange: { start: Date; end: Date } | null;
}

export default function ActivityFeedSection({
  dateRange,
}: ActivityFeedSectionProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterEntity, setFilterEntity] = useState<string>("all");
  const [filterTimeRange, setFilterTimeRange] = useState<string>("all");
  const [filterDepartment, setFilterDepartment] = useState<string>("all");
  const [filterProject, setFilterProject] = useState<string>("all");
  const [departments, setDepartments] = useState<
    { id: string; name: string }[]
  >([]);
  const [projects, setProjects] = useState<{ id: string; title: string }[]>([]);
  const [expandedActivities, setExpandedActivities] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchActivities();
    fetchDepartments();
  }, [dateRange, filterType, filterEntity, filterTimeRange, filterDepartment, filterProject]);

  useEffect(() => {
    fetchProjects(filterDepartment);
  }, [filterDepartment]);

  const fetchDepartments = async () => {
    try {
      const response = await fetch("/api/departments");
      const data = await response.json();
      setDepartments(data);
    } catch (error) {
      console.error("Failed to fetch departments:", error);
    }
  };

  const fetchProjects = async (departmentId: string) => {
    try {
      let url = "/api/epics";
      if (departmentId !== "all") {
        url += `?departmentId=${departmentId}`;
      }
      const response = await fetch(url);
      const data = await response.json();
      setProjects(data);
      // Reset project filter when department changes
      setFilterProject("all");
    } catch (error) {
      console.error("Failed to fetch projects:", error);
    }
  };

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("limit", "100");

      if (filterType !== "all") {
        params.set("type", filterType);
      }

      if (filterDepartment !== "all") {
        params.set("departmentId", filterDepartment);
      }

      if (filterProject !== "all") {
        params.set("epicId", filterProject);
      }

      // Apply time range filter
      let startDate = dateRange?.start;
      let endDate = dateRange?.end;

      if (filterTimeRange !== "all" && !dateRange) {
        const now = new Date();
        endDate = now;

        switch (filterTimeRange) {
          case "today":
            startDate = new Date(now.setHours(0, 0, 0, 0));
            break;
          case "week":
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case "month":
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
        }
      }

      if (startDate) {
        params.set("startDate", startDate.toISOString());
      }
      if (endDate) {
        params.set("endDate", endDate.toISOString());
      }

      const response = await fetch(`/api/activities?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        let filtered = data.activities || [];

        // Client-side filter by entity type
        if (filterEntity !== "all") {
          filtered = filtered.filter((activity: Activity) => {
            switch (filterEntity) {
              case "tasks":
                return [
                  "TASK_CREATED",
                  "TASK_UPDATED",
                  "TASK_MOVED",
                  "TASK_DELETED",
                  "TASK_ASSIGNED",
                  "TASK_UNASSIGNED",
                ].includes(activity.type);
              case "epics":
                return ["EPIC_CREATED", "EPIC_UPDATED"].includes(activity.type);
              case "notes":
                return ["MEETING_NOTE_ADDED", "QUICK_NOTE_ADDED"].includes(
                  activity.type,
                );
              case "dates":
                return [
                  "START_DATE_ADDED",
                  "START_DATE_UPDATED",
                  "START_DATE_REMOVED",
                  "DUE_DATE_ADDED",
                  "DUE_DATE_UPDATED",
                  "DUE_DATE_REMOVED",
                ].includes(activity.type);
              default:
                return true;
            }
          });
        }

        setActivities(filtered);
      }
    } catch (error) {
      console.error("Failed to fetch activities:", error);
    } finally {
      setLoading(false);
    }
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
      case "START_DATE_ADDED":
      case "DUE_DATE_ADDED":
        return <IconCalendarPlus {...iconProps} />;
      case "START_DATE_UPDATED":
      case "DUE_DATE_UPDATED":
        return <IconCalendarEvent {...iconProps} />;
      case "START_DATE_REMOVED":
      case "DUE_DATE_REMOVED":
        return <IconCalendarMinus {...iconProps} />;
      case "TASK_ASSIGNED":
      case "MEMBER_ADDED":
        return <IconUserPlus {...iconProps} />;
      case "TASK_UNASSIGNED":
      case "MEMBER_REMOVED":
        return <IconUserMinus {...iconProps} />;
      case "EPIC_CREATED":
      case "EPIC_UPDATED":
        return <IconStar {...iconProps} />;
      case "MEETING_NOTE_ADDED":
        return <IconNotes {...iconProps} />;
      case "QUICK_NOTE_ADDED":
        return <IconNote {...iconProps} />;
      case "BOARD_UPDATED":
        return <IconLayout {...iconProps} />;
      default:
        return <IconActivity {...iconProps} />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "TASK_CREATED":
      case "START_DATE_ADDED":
      case "DUE_DATE_ADDED":
      case "TASK_ASSIGNED":
      case "MEMBER_ADDED":
        return "text-green-400";
      case "TASK_UPDATED":
      case "START_DATE_UPDATED":
      case "DUE_DATE_UPDATED":
      case "BOARD_UPDATED":
      case "EPIC_UPDATED":
        return "text-blue-400";
      case "TASK_MOVED":
      case "EPIC_CREATED":
        return "text-purple-400";
      case "TASK_DELETED":
      case "START_DATE_REMOVED":
      case "DUE_DATE_REMOVED":
      case "TASK_UNASSIGNED":
      case "MEMBER_REMOVED":
        return "text-red-400";
      case "COMMENT_ADDED":
        return "text-yellow-400";
      case "MEETING_NOTE_ADDED":
      case "QUICK_NOTE_ADDED":
        return "text-cyan-400";
      default:
        return "text-zinc-400";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  const activityTypes = [
    { value: "all", label: "All Activities" },
    { value: "TASK_CREATED", label: "Tasks Created" },
    { value: "TASK_MOVED", label: "Tasks Moved" },
    { value: "TASK_UPDATED", label: "Tasks Updated" },
    { value: "MEETING_NOTE_ADDED", label: "Meeting Notes" },
    { value: "QUICK_NOTE_ADDED", label: "Quick Notes" },
    { value: "COMMENT_ADDED", label: "Comments" },
    { value: "EPIC_CREATED", label: "Epics Created" },
    { value: "EPIC_UPDATED", label: "Epics Updated" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
      <style jsx global>{quillReadOnlyStyles}</style>
      {/* Left Sidebar - Compact Filters */}
      <div className="lg:col-span-1">
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 sticky top-8 space-y-3">
          {/* Department Filter */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase">
              Department
            </label>
            <div className="space-y-1">
              <button
                onClick={() => setFilterDepartment("all")}
                className={`w-full text-left px-2 py-1 rounded text-xs transition-colors ${
                  filterDepartment === "all"
                    ? "bg-blue-600 text-white"
                    : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                }`}
              >
                All Depts
              </button>
              {departments.map((dept) => (
                <button
                  key={dept.id}
                  onClick={() => setFilterDepartment(dept.id)}
                  className={`w-full text-left px-2 py-1 rounded text-xs transition-colors truncate ${
                    filterDepartment === dept.id
                      ? "bg-blue-600 text-white"
                      : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                  }`}
                  title={dept.name}
                >
                  {dept.name}
                </button>
              ))}
            </div>
          </div>

          {/* Project Filter */}
          <div className="pt-2 border-t border-zinc-800">
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase">
              Project
            </label>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              <button
                onClick={() => setFilterProject("all")}
                className={`w-full text-left px-2 py-1 rounded text-xs transition-colors ${
                  filterProject === "all"
                    ? "bg-blue-600 text-white"
                    : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                }`}
              >
                All Projects
              </button>
              {projects.map((proj) => (
                <button
                  key={proj.id}
                  onClick={() => setFilterProject(proj.id)}
                  className={`w-full text-left px-2 py-1 rounded text-xs transition-colors truncate ${
                    filterProject === proj.id
                      ? "bg-blue-600 text-white"
                      : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                  }`}
                  title={proj.title}
                >
                  {proj.title}
                </button>
              ))}
            </div>
          </div>

          {/* Entity Type Filter */}
          <div className="pt-2 border-t border-zinc-800">
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase">
              Entity
            </label>
            <div className="space-y-1">
              {[
                { value: "all", label: "All" },
                { value: "tasks", label: "Tasks" },
                { value: "epics", label: "Projects" },
                { value: "notes", label: "Notes" },
                { value: "dates", label: "Dates" },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFilterEntity(option.value)}
                  className={`w-full text-left px-2 py-1 rounded text-xs transition-colors ${
                    filterEntity === option.value
                      ? "bg-blue-600 text-white"
                      : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Activity Type Filter */}
          <div className="pt-2 border-t border-zinc-800">
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase">
              Type
            </label>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {activityTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setFilterType(type.value)}
                  className={`w-full text-left px-2 py-1 rounded text-xs transition-colors truncate ${
                    filterType === type.value
                      ? "bg-blue-600 text-white"
                      : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                  }`}
                  title={type.label}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Time Range Filter */}
          <div className="pt-2 border-t border-zinc-800">
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase">
              Time
            </label>
            <div className="space-y-1">
              {[
                { value: "all", label: "All" },
                { value: "today", label: "Today" },
                { value: "week", label: "7 Days" },
                { value: "month", label: "30 Days" },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFilterTimeRange(option.value)}
                  className={`w-full text-left px-2 py-1 rounded text-xs transition-colors ${
                    filterTimeRange === option.value
                      ? "bg-blue-600 text-white"
                      : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Clear Filters */}
          {(filterEntity !== "all" ||
            filterType !== "all" ||
            filterTimeRange !== "all" ||
            filterProject !== "all" ||
            filterDepartment !== "all") && (
            <button
              onClick={() => {
                setFilterEntity("all");
                setFilterType("all");
                setFilterTimeRange("all");
                setFilterProject("all");
                setFilterDepartment("all");
              }}
              className="w-full mt-2 px-2 py-1 bg-zinc-800 text-zinc-400 hover:text-white rounded text-xs transition-colors border border-zinc-700"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Right Content - Activities List */}
      <div className="lg:col-span-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg">
          {loading ? (
            <div className="p-8">
              <div className="animate-pulse space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-zinc-800 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-zinc-800 rounded w-3/4" />
                      <div className="h-3 bg-zinc-800 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : activities.length === 0 ? (
            <div className="p-12 text-center">
              <IconActivity size={48} className="mx-auto text-zinc-600 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">
                No activity yet
              </h3>
              <p className="text-zinc-400">
                Activities will appear here as you and your team work on tasks
                and epics.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-800">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="p-4 hover:bg-zinc-800/50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    {/* User Avatar */}
                    <div className="flex-shrink-0">
                      {activity.user.image ? (
                        <img
                          src={activity.user.image}
                          alt={activity.user.name}
                          className="w-10 h-10 rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center text-white font-medium">
                          {activity.user.name[0].toUpperCase()}
                        </div>
                      )}
                    </div>

                    {/* Activity Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={`flex items-center gap-1 ${getActivityColor(
                                activity.type,
                              )}`}
                            >
                              {getActivityIcon(activity.type)}
                            </span>
                            {activity.type === "MEETING_NOTE_ADDED" ||
                            activity.type === "QUICK_NOTE_ADDED" ? (
                              <div className="flex-1">
                                {!expandedActivities.has(activity.id) && (
                                  <>
                                    <div
                                      className="text-sm text-zinc-300 ql-editor ql-disabled line-clamp-3"
                                      dangerouslySetInnerHTML={{
                                        __html: activity.content,
                                      }}
                                    />
                                    <button
                                      onClick={() => toggleExpanded(activity.id)}
                                      className="mt-1 text-xs text-blue-400 hover:text-blue-300"
                                    >
                                      ▼ Read More
                                    </button>
                                  </>
                                )}
                                {expandedActivities.has(activity.id) && (
                                  <div>
                                    <div
                                      className="text-sm text-zinc-300 ql-editor ql-disabled max-h-60 overflow-y-auto"
                                      dangerouslySetInnerHTML={{
                                        __html: activity.content,
                                      }}
                                    />
                                    <button
                                      onClick={() => toggleExpanded(activity.id)}
                                      className="mt-2 text-xs text-blue-400 hover:text-blue-300"
                                    >
                                      ▲ Show Less
                                    </button>
                                  </div>
                                )}
                              </div>
                            ) : activity.type === "COMMENT_ADDED" ? (
                              <div
                                className="text-sm text-zinc-300 line-clamp-3 prose prose-invert prose-sm max-w-none"
                                dangerouslySetInnerHTML={{
                                  __html: activity.content
                                    .replace(/&amp;/g, "&")
                                    .replace(/&lt;/g, "<")
                                    .replace(/&gt;/g, ">")
                                    .replace(/&nbsp;/g, " "),
                                }}
                              />
                            ) : (
                              <p className="text-sm text-zinc-300">
                                {activity.content}
                              </p>
                            )}
                          </div>

                          {/* Task/Epic Info */}
                          {activity.task && (
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs text-zinc-500">
                                {activity.task.taskType === "EPIC"
                                  ? "Epic:"
                                  : "Task:"}
                              </span>
                              <a
                                href={
                                  activity.task.taskType === "EPIC"
                                    ? `/epics/${activity.task.id}`
                                    : `/task/${activity.task.id}`
                                }
                                className="text-xs text-blue-400 hover:text-blue-300 hover:underline font-medium"
                              >
                                {activity.task.title}
                              </a>
                            </div>
                          )}

                          {/* Board Info */}
                          {activity.board && !activity.task && (
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs text-zinc-500">
                                Board:
                              </span>
                              <a
                                href={`/board/${activity.board.id}`}
                                className="text-xs text-blue-400 hover:text-blue-300 hover:underline font-medium"
                              >
                                {activity.board.title}
                              </a>
                            </div>
                          )}
                        </div>
                        <span className="text-xs text-zinc-500 whitespace-nowrap">
                          {formatDate(activity.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Load More */}
      {!loading && activities.length > 0 && activities.length % 100 === 0 && (
        <div className="text-center">
          <button
            onClick={fetchActivities}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
}
