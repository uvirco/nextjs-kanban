"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { IconFilter, IconZoomIn, IconZoomOut, IconEye, IconEyeOff, IconSortAscending } from "@tabler/icons-react";

interface Subtask {
  id: string;
  title: string;
  createdAt: string;
  columnId: string;
  column?: { id: string; title: string } | null;
}

interface ColumnSegment {
  columnName: string;
  startDate: Date;
  endDate: Date;
  durationDays: number;
  isCurrent: boolean;
}

interface TaskTimeline {
  taskId: string;
  taskTitle: string;
  segments: ColumnSegment[];
  createdAt: Date;
}

interface EpicTasksGanttTimelineProps {
  epicId: string;
  subtasks: Subtask[];
}

const DONE_COLUMNS = ["Done", "✅ Done", "Complete", "Completed", "Closed"];

const COLUMN_COLORS: Record<string, string> = {
  "📋 Backlog": "#64748b",
  "Backlog": "#64748b",
  "To Do": "#f43f5e",
  "🚧 In Progress": "#f97316",
  "In Progress": "#f97316",
  "Review": "#0ea5e9",
  "🔍 Review": "#0ea5e9",
  "Testing": "#a855f7",
  "QA": "#a855f7",
  "✅ Done": "#22c55e",
  "Done": "#22c55e",
  "Complete": "#22c55e",
  "Blocked": "#ef4444",
  "🚫 Blocked": "#ef4444",
  "On Hold": "#eab308",
  "Planning": "#06b6d4",
  "Design": "#ec4899",
  "Development": "#3b82f6",
};

const FALLBACK_COLORS = [
  "#f43f5e", "#f97316", "#eab308", "#22c55e", "#14b8a6", 
  "#0ea5e9", "#3b82f6", "#8b5cf6", "#a855f7", "#ec4899",
];

const dynamicColorMap = new Map<string, string>();

function getColumnColor(columnName: string): string {
  if (COLUMN_COLORS[columnName]) {
    return COLUMN_COLORS[columnName];
  }
  
  if (dynamicColorMap.has(columnName)) {
    return dynamicColorMap.get(columnName)!;
  }
  
  const colorIndex = dynamicColorMap.size % FALLBACK_COLORS.length;
  const color = FALLBACK_COLORS[colorIndex];
  dynamicColorMap.set(columnName, color);
  return color;
}

function isCompleted(timeline: TaskTimeline): boolean {
  const lastSegment = timeline.segments[timeline.segments.length - 1];
  return lastSegment ? DONE_COLUMNS.some(d => 
    lastSegment.columnName.toLowerCase().includes(d.toLowerCase())
  ) : false;
}

type SortOption = "name" | "created" | "duration";
type TimeRange = "all" | "7d" | "30d" | "90d";

export function EpicTasksGanttTimeline({ epicId, subtasks }: EpicTasksGanttTimelineProps) {
  const [timelines, setTimelines] = useState<TaskTimeline[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter & control states
  const [hideCompleted, setHideCompleted] = useState(false);
  const [timeRange, setTimeRange] = useState<TimeRange>("all");
  const [sortBy, setSortBy] = useState<SortOption>("created");
  const [selectedColumns, setSelectedColumns] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (!subtasks.length) {
      setLoading(false);
      return;
    }

    fetch(`/api/epics/${epicId}/tasks-timeline`)
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch timeline data");
        return res.json();
      })
      .then(data => {
        const parsed = (data.timelines || []).map((t: any) => ({
          ...t,
          createdAt: new Date(t.createdAt),
          segments: t.segments.map((s: any) => ({
            ...s,
            startDate: new Date(s.startDate),
            endDate: new Date(s.endDate),
          })),
        }));
        setTimelines(parsed);
        setLoading(false);
      })
      .catch(err => {
        console.error("Timeline fetch error:", err);
        const fallbackTimelines = subtasks.map(task => {
          const created = new Date(task.createdAt);
          const now = new Date();
          const days = Math.max(1, Math.ceil((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)));
          
          return {
            taskId: task.id,
            taskTitle: task.title,
            createdAt: created,
            segments: [{
              columnName: task.column?.title || "Unknown",
              startDate: created,
              endDate: now,
              durationDays: days,
              isCurrent: true,
            }],
          };
        });
        setTimelines(fallbackTimelines);
        setLoading(false);
      });
  }, [epicId, subtasks]);

  // Get all unique columns
  const allColumns = useMemo(() => {
    const cols = new Set<string>();
    timelines.forEach(t => t.segments.forEach(s => cols.add(s.columnName)));
    return Array.from(cols);
  }, [timelines]);

  // Initialize selected columns
  useEffect(() => {
    if (allColumns.length > 0 && selectedColumns.size === 0) {
      setSelectedColumns(new Set(allColumns));
    }
  }, [allColumns, selectedColumns.size]);

  // Filter timelines
  const filteredTimelines = useMemo(() => {
    let filtered = [...timelines];

    // Hide completed
    if (hideCompleted) {
      filtered = filtered.filter(t => !isCompleted(t));
    }

    // Time range filter
    if (timeRange !== "all") {
      const now = new Date();
      const daysMap: Record<TimeRange, number> = { "all": 0, "7d": 7, "30d": 30, "90d": 90 };
      const cutoff = new Date(now.getTime() - daysMap[timeRange] * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(t => {
        const lastSegment = t.segments[t.segments.length - 1];
        return lastSegment && lastSegment.endDate >= cutoff;
      });
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.taskTitle.localeCompare(b.taskTitle);
        case "created":
          return a.createdAt.getTime() - b.createdAt.getTime();
        case "duration":
          const aDur = a.segments.reduce((sum, s) => sum + s.durationDays, 0);
          const bDur = b.segments.reduce((sum, s) => sum + s.durationDays, 0);
          return bDur - aDur;
        default:
          return 0;
      }
    });

    return filtered;
  }, [timelines, hideCompleted, timeRange, sortBy]);

  const { minDate, maxDate, totalDays } = useMemo(() => {
    if (!filteredTimelines.length) {
      return { minDate: new Date(), maxDate: new Date(), totalDays: 1 };
    }

    let min = new Date();
    let max = new Date();

    filteredTimelines.forEach(t => {
      t.segments.forEach(s => {
        if (s.startDate < min) min = new Date(s.startDate);
        if (s.endDate > max) max = new Date(s.endDate);
      });
    });

    const days = Math.max(1, Math.ceil((max.getTime() - min.getTime()) / (1000 * 60 * 60 * 24)));
    return { minDate: min, maxDate: max, totalDays: days };
  }, [filteredTimelines]);

  const uniqueColumns = useMemo(() => {
    const cols = new Set<string>();
    filteredTimelines.forEach(t => t.segments.forEach(s => cols.add(s.columnName)));
    return Array.from(cols);
  }, [filteredTimelines]);

  const getPosition = useCallback((date: Date) => {
    const daysSinceStart = (date.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24);
    return (daysSinceStart / totalDays) * 100;
  }, [minDate, totalDays]);

  const getWidth = useCallback((start: Date, end: Date) => {
    const days = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    return Math.max(0.5, (days / totalDays) * 100);
  }, [totalDays]);

  const timeMarkers = useMemo(() => {
    const markers: { date: Date; label: string }[] = [];
    const interval = totalDays <= 14 ? 1 : totalDays <= 60 ? 7 : 30;
    
    const current = new Date(minDate);
    while (current <= maxDate) {
      markers.push({
        date: new Date(current),
        label: current.toLocaleDateString("en-US", { 
          month: "short", 
          day: "numeric" 
        }),
      });
      current.setDate(current.getDate() + interval);
    }
    return markers;
  }, [minDate, maxDate, totalDays]);

  // Stats
  const stats = useMemo(() => {
    const completed = timelines.filter(t => isCompleted(t)).length;
    const active = timelines.length - completed;
    const avgDuration = filteredTimelines.length > 0
      ? Math.round(filteredTimelines.reduce((sum, t) => 
          sum + t.segments.reduce((s, seg) => s + seg.durationDays, 0), 0) / filteredTimelines.length)
      : 0;
    return { completed, active, avgDuration };
  }, [timelines, filteredTimelines]);

  if (loading) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
        <div className="animate-pulse flex items-center gap-2">
          <div className="w-4 h-4 bg-zinc-700 rounded"></div>
          <div className="h-4 bg-zinc-700 rounded w-32"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 text-red-400">
        Error loading timeline: {error}
      </div>
    );
  }

  if (!subtasks.length) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-2">📊 Task Flow Timeline</h3>
        <div className="text-zinc-500">
          No subtasks to display yet. Create some tasks within this epic to see the timeline.
        </div>
      </div>
    );
  }

  if (!timelines.length) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 text-zinc-500">
        Loading timeline data...
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
      {/* Header with controls */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">📊 Task Flow Timeline</h3>
        
        <div className="flex items-center gap-2">
          {/* Time range selector */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as TimeRange)}
            className="px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded text-sm text-white focus:outline-none focus:border-zinc-600"
          >
            <option value="all">All Time</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>

          {/* Sort selector */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded text-sm text-white focus:outline-none focus:border-zinc-600"
          >
            <option value="created">Sort: Created</option>
            <option value="name">Sort: Name</option>
            <option value="duration">Sort: Duration</option>
          </select>

          {/* Hide completed toggle */}
          <button
            onClick={() => setHideCompleted(!hideCompleted)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm transition-colors ${
              hideCompleted 
                ? "bg-blue-600 text-white" 
                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            }`}
            title={hideCompleted ? "Show completed tasks" : "Hide completed tasks"}
          >
            {hideCompleted ? <IconEyeOff size={16} /> : <IconEye size={16} />}
            {hideCompleted ? "Hidden" : "Completed"}
          </button>

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm transition-colors ${
              showFilters 
                ? "bg-zinc-700 text-white" 
                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            }`}
          >
            <IconFilter size={16} />
            Filters
          </button>
        </div>
      </div>

      {/* Expandable filters panel */}
      {showFilters && (
        <div className="mb-4 p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
          <div className="text-sm text-zinc-400 mb-2">Filter by column:</div>
          <div className="flex flex-wrap gap-2">
            {allColumns.map(col => (
              <button
                key={col}
                onClick={() => {
                  const newSet = new Set(selectedColumns);
                  if (newSet.has(col)) {
                    newSet.delete(col);
                  } else {
                    newSet.add(col);
                  }
                  setSelectedColumns(newSet);
                }}
                className={`flex items-center gap-2 px-2 py-1 rounded text-xs transition-colors ${
                  selectedColumns.has(col)
                    ? "bg-zinc-700 text-white"
                    : "bg-zinc-800 text-zinc-500"
                }`}
              >
                <div 
                  className="w-2 h-2 rounded-sm" 
                  style={{ backgroundColor: getColumnColor(col) }}
                />
                {col}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Stats bar */}
      <div className="flex gap-6 mb-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-zinc-500">Showing:</span>
          <span className="text-white font-medium">{filteredTimelines.length}</span>
          <span className="text-zinc-500">of {timelines.length} tasks</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <span className="text-zinc-400">{stats.completed} completed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
          <span className="text-zinc-400">{stats.active} active</span>
        </div>
        <div className="text-zinc-400">
          <span className="text-zinc-500">Avg duration:</span> {stats.avgDuration} days
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-6">
        {uniqueColumns.map(col => (
          <div key={col} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-sm" 
              style={{ backgroundColor: getColumnColor(col) }}
            />
            <span className="text-xs text-zinc-400">{col}</span>
          </div>
        ))}
      </div>

      {/* Timeline container */}
      <div className="overflow-x-auto">
        <div className="min-w-[600px]">
          {/* Time axis header */}
          <div className="flex mb-2">
            <div className="w-48 shrink-0"></div>
            <div className="flex-1 relative h-6 border-b border-zinc-700">
              {timeMarkers.map((marker, i) => (
                <div
                  key={i}
                  className="absolute text-xs text-zinc-500 transform -translate-x-1/2"
                  style={{ left: `${getPosition(marker.date)}%` }}
                >
                  {marker.label}
                </div>
              ))}
            </div>
          </div>

          {/* Task rows */}
          {filteredTimelines.length === 0 ? (
            <div className="py-8 text-center text-zinc-500">
              No tasks match the current filters
            </div>
          ) : (
            filteredTimelines.map((timeline, idx) => (
              <div 
                key={timeline.taskId} 
                className={`flex items-center py-2 ${idx % 2 === 0 ? "bg-zinc-800/30" : ""}`}
              >
                {/* Task name */}
                <div className="w-48 shrink-0 pr-4 flex items-center gap-2">
                  {isCompleted(timeline) && (
                    <span className="text-green-500 text-xs">✓</span>
                  )}
                  <span 
                    className={`text-sm truncate block ${isCompleted(timeline) ? "text-zinc-500" : "text-zinc-300"}`}
                    title={timeline.taskTitle}
                  >
                    {timeline.taskTitle}
                  </span>
                </div>

                {/* Timeline bar */}
                <div className="flex-1 relative h-8">
                  {timeline.segments.map((segment, segIdx) => {
                    const left = getPosition(segment.startDate);
                    const width = getWidth(segment.startDate, segment.endDate);
                    
                    return (
                      <div
                        key={segIdx}
                        className="absolute h-6 top-1 rounded-sm cursor-pointer hover:opacity-80 transition-opacity"
                        style={{
                          left: `${left}%`,
                          width: `${width}%`,
                          backgroundColor: getColumnColor(segment.columnName),
                          minWidth: "4px",
                        }}
                        title={`${segment.columnName}: ${segment.durationDays} day${segment.durationDays !== 1 ? "s" : ""}${segment.isCurrent ? " (current)" : ""}`}
                      >
                        {width > 8 && (
                          <span className="text-[10px] text-white px-1 truncate block leading-6">
                            {segment.durationDays}d
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}

          {/* Grid lines */}
          <div className="flex mt-2">
            <div className="w-48 shrink-0"></div>
            <div className="flex-1 relative h-2 border-t border-zinc-700">
              {timeMarkers.map((marker, i) => (
                <div
                  key={i}
                  className="absolute w-px h-full bg-zinc-700"
                  style={{ left: `${getPosition(marker.date)}%` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Summary footer */}
      <div className="mt-6 pt-4 border-t border-zinc-800 flex gap-6 text-sm">
        <div className="text-zinc-400">
          <span className="text-zinc-500">Timeline:</span> {totalDays} days
        </div>
        <div className="text-zinc-400">
          <span className="text-zinc-500">From:</span> {minDate.toLocaleDateString()}
        </div>
        <div className="text-zinc-400">
          <span className="text-zinc-500">To:</span> {maxDate.toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}
