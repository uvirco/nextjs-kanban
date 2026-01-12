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

  useEffect(() => {
    fetchActivities();
  }, [dateRange, filterType, filterEntity, filterTimeRange]);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("limit", "100");

      if (filterType !== "all") {
        params.set("type", filterType);
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
                return ["TASK_CREATED", "TASK_UPDATED", "TASK_MOVED", "TASK_DELETED", "TASK_ASSIGNED", "TASK_UNASSIGNED"].includes(activity.type);
              case "epics":
                return ["EPIC_CREATED", "EPIC_UPDATED"].includes(activity.type);
              case "notes":
                return ["MEETING_NOTE_ADDED", "QUICK_NOTE_ADDED"].includes(activity.type);
              case "dates":
                return ["START_DATE_ADDED", "START_DATE_UPDATED", "START_DATE_REMOVED", "DUE_DATE_ADDED", "DUE_DATE_UPDATED", "DUE_DATE_REMOVED"].includes(activity.type);
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
    <div className="space-y-6">
      {/* Filter Section */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <IconFilter size={20} className="text-zinc-400" />
          <span className="text-sm font-medium text-zinc-300">Filters</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Entity Type Filter */}
          <div>
            <label className="block text-xs text-zinc-400 mb-1.5">Entity Type</label>
            <select
              value={filterEntity}
              onChange={(e) => setFilterEntity(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Entities</option>
              <option value="tasks">Tasks Only</option>
              <option value="epics">Epics Only</option>
              <option value="notes">Notes Only</option>
              <option value="dates">Date Changes</option>
            </select>
          </div>

          {/* Activity Type Filter */}
          <div>
            <label className="block text-xs text-zinc-400 mb-1.5">Activity Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {activityTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Time Range Filter */}
          <div>
            <label className="block text-xs text-zinc-400 mb-1.5">Time Range</label>
            <select
              value={filterTimeRange}
              onChange={(e) => setFilterTimeRange(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>
          </div>
        </div>
        
        {/* Active Filters Display */}
        {(filterEntity !== "all" || filterType !== "all" || filterTimeRange !== "all") && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-zinc-800">
            <span className="text-xs text-zinc-400">Active filters:</span>
            <div className="flex flex-wrap gap-1.5">
              {filterEntity !== "all" && (
                <span className="px-2 py-0.5 bg-blue-900/30 text-blue-400 text-xs rounded-full">
                  {filterEntity}
                </span>
              )}
              {filterType !== "all" && (
                <span className="px-2 py-0.5 bg-blue-900/30 text-blue-400 text-xs rounded-full">
                  {activityTypes.find(t => t.value === filterType)?.label}
                </span>
              )}
              {filterTimeRange !== "all" && (
                <span className="px-2 py-0.5 bg-blue-900/30 text-blue-400 text-xs rounded-full">
                  {filterTimeRange === "today" ? "Today" : filterTimeRange === "week" ? "Last 7 Days" : "Last 30 Days"}
                </span>
              )}
              <button
                onClick={() => {
                  setFilterEntity("all");
                  setFilterType("all");
                  setFilterTimeRange("all");
                }}
                className="px-2 py-0.5 text-xs text-zinc-400 hover:text-white transition-colors"
              >
                Clear all
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Activities List */}
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
              Activities will appear here as you and your team work on tasks and epics.
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
                              activity.type
                            )}`}
                          >
                            {getActivityIcon(activity.type)}
                          </span>
                          <p className="text-sm text-zinc-300">
                            {activity.content}
                          </p>
                        </div>
                        
                        {/* Task/Epic Info */}
                        {activity.task && (
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-zinc-500">
                              {activity.task.taskType === "EPIC" ? "Epic:" : "Task:"}
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
                            <span className="text-xs text-zinc-500">Board:</span>
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
