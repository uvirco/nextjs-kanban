"use client";

import { useState, useMemo } from "react";
import {
  IconChevronLeft,
  IconChevronRight,
  IconZoomIn,
  IconZoomOut,
  IconFilter,
} from "@tabler/icons-react";

interface TimelineEpic {
  id: string;
  title: string;
  startDate: Date | null;
  dueDate: Date | null;
  progress: number;
  priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | null;
  riskLevel: "HIGH" | "MEDIUM" | "LOW" | null;
  department?: { id: string; name: string };
  businessValue: number | null;
  column?: { title: string };
  readiness?: number | null;
}

interface EpicTimelineProps {
  epics: TimelineEpic[];
}

type ViewMode = "month" | "quarter" | "year";

export default function EpicTimeline({ epics }: EpicTimelineProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("quarter");
  const [currentDate, setCurrentDate] = useState(new Date());

  // Calculate timeline bounds based on view mode and current date
  const timelineBounds = useMemo(() => {
    const allDates = epics
      .flatMap((epic) => [epic.startDate, epic.dueDate])
      .filter(Boolean) as Date[];

    // If no epics with dates, use current date as base
    if (allDates.length === 0) {
      const now = new Date();
      let start, end;

      switch (viewMode) {
        case "month":
          start = new Date(now.getFullYear(), now.getMonth(), 1);
          end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          break;
        case "quarter":
          const quarterStart = Math.floor(now.getMonth() / 3) * 3;
          start = new Date(now.getFullYear(), quarterStart, 1);
          end = new Date(now.getFullYear(), quarterStart + 3, 0);
          break;
        case "year":
          start = new Date(now.getFullYear(), 0, 1);
          end = new Date(now.getFullYear(), 11, 31);
          break;
      }

      return { start, end };
    }

    // Use epic dates but constrain to current view period
    const minDate = new Date(Math.min(...allDates.map((d) => d.getTime())));
    const maxDate = new Date(Math.max(...allDates.map((d) => d.getTime())));

    let start, end;

    switch (viewMode) {
      case "month":
        // Show current month or month containing most epics
        const targetMonth = currentDate.getMonth();
        const targetMonthYear = currentDate.getFullYear();
        start = new Date(targetMonthYear, targetMonth, 1);
        end = new Date(targetMonthYear, targetMonth + 1, 0);
        break;
      case "quarter":
        // Show current quarter or quarter containing most epics
        const targetQuarter = Math.floor(currentDate.getMonth() / 3);
        const quarterYear = currentDate.getFullYear();
        start = new Date(quarterYear, targetQuarter * 3, 1);
        end = new Date(quarterYear, (targetQuarter + 1) * 3, 0);
        break;
      case "year":
        // Show current year or year containing most epics
        const targetYear = currentDate.getFullYear();
        start = new Date(targetYear, 0, 1);
        end = new Date(targetYear, 11, 31);
        break;
    }

    // Expand bounds if epics extend beyond the current view period
    const actualStart = new Date(Math.min(start.getTime(), minDate.getTime()));
    const actualEnd = new Date(Math.max(end.getTime(), maxDate.getTime()));

    return { start: actualStart, end: actualEnd };
  }, [epics, viewMode, currentDate]);

  // Get priority color
  const getPriorityColor = (priority: string | null) => {
    switch (priority?.toUpperCase()) {
      case "CRITICAL":
        return "bg-red-500 border-red-600";
      case "HIGH":
        return "bg-orange-500 border-orange-600";
      case "MEDIUM":
        return "bg-yellow-500 border-yellow-600";
      case "LOW":
        return "bg-green-500 border-green-600";
      default:
        return "bg-gray-500 border-gray-600";
    }
  };

  // Get risk indicator
  const getRiskIndicator = (riskLevel: string | null) => {
    if (!riskLevel) return null;
    const isHighRisk = riskLevel.toUpperCase() === "HIGH";
    return isHighRisk ? "⚠️" : null;
  };

  // Get readiness color classes
  const getReadinessColor = (score: number | null) => {
    if (score === null || typeof score === "undefined")
      return "bg-zinc-600 text-zinc-200";
    if (score >= 80) return "bg-emerald-500 text-emerald-900";
    if (score >= 50) return "bg-yellow-400 text-yellow-900";
    return "bg-red-500 text-red-900";
  };

  // Calculate epic position and width
  const getEpicStyle = (epic: TimelineEpic) => {
    const startDate = epic.startDate || epic.dueDate || new Date();
    const endDate = epic.dueDate || startDate;

    const totalDays =
      (timelineBounds.end.getTime() - timelineBounds.start.getTime()) /
      (1000 * 60 * 60 * 24);
    const startOffset =
      (startDate.getTime() - timelineBounds.start.getTime()) /
      (1000 * 60 * 60 * 24);
    const duration =
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);

    const left = (startOffset / totalDays) * 100;
    const width = Math.max((duration / totalDays) * 100, 2); // Minimum 2% width

    return { left: `${left}%`, width: `${width}%` };
  };

  // Generate timeline headers based on view mode and bounds
  const timelineHeaders = useMemo(() => {
    const headers = [];
    let current = new Date(timelineBounds.start);

    while (current <= timelineBounds.end) {
      const monthName = current.toLocaleDateString("en-US", { month: "short" });
      const year = current.getFullYear();

      headers.push({
        label: viewMode === "year" ? year.toString() : monthName,
        date: new Date(current),
      });

      if (viewMode === "month") {
        current.setMonth(current.getMonth() + 1);
      } else if (viewMode === "quarter") {
        current.setMonth(current.getMonth() + 3);
      } else {
        current.setFullYear(current.getFullYear() + 1);
      }
    }

    return headers;
  }, [timelineBounds, viewMode]);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">
          🗓️ Epic Roadmap Timeline
        </h2>

        <div className="flex items-center gap-4">
          {/* View Mode Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode("month")}
              className={`px-3 py-1 text-sm rounded ${
                viewMode === "month"
                  ? "bg-blue-600 text-white"
                  : "bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setViewMode("quarter")}
              className={`px-3 py-1 text-sm rounded ${
                viewMode === "quarter"
                  ? "bg-blue-600 text-white"
                  : "bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
              }`}
            >
              Quarter
            </button>
            <button
              onClick={() => setViewMode("year")}
              className={`px-3 py-1 text-sm rounded ${
                viewMode === "year"
                  ? "bg-blue-600 text-white"
                  : "bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
              }`}
            >
              Year
            </button>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const newDate = new Date(currentDate);
                if (viewMode === "month")
                  newDate.setMonth(newDate.getMonth() - 1);
                else if (viewMode === "quarter")
                  newDate.setMonth(newDate.getMonth() - 3);
                else newDate.setFullYear(newDate.getFullYear() - 1);
                setCurrentDate(newDate);
              }}
              className="p-2 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 rounded"
            >
              <IconChevronLeft size={16} />
            </button>
            <button
              onClick={() => {
                const newDate = new Date(currentDate);
                if (viewMode === "month")
                  newDate.setMonth(newDate.getMonth() + 1);
                else if (viewMode === "quarter")
                  newDate.setMonth(newDate.getMonth() + 3);
                else newDate.setFullYear(newDate.getFullYear() + 1);
                setCurrentDate(newDate);
              }}
              className="p-2 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 rounded"
            >
              <IconChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Timeline Headers */}
        <div className="flex border-b border-zinc-700 mb-4">
          <div className="w-64 flex-shrink-0 p-4">
            <span className="text-zinc-400 font-medium">Epic</span>
          </div>
          <div className="flex-1 relative">
            <div className="flex">
              {timelineHeaders.map((header, index) => (
                <div
                  key={index}
                  className="flex-1 text-center text-zinc-400 text-sm py-2 border-r border-zinc-700 last:border-r-0"
                >
                  {header.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Timeline Rows */}
        <div className="space-y-3">
          {epics.map((epic) => (
            <div
              key={epic.id}
              className="flex items-center hover:bg-zinc-800/50 rounded-lg p-2 transition-colors"
            >
              {/* Epic Info */}
              <div className="w-64 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-3 h-3 rounded-full ${getPriorityColor(epic.priority)}`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-medium truncate">
                      {epic.title}
                    </div>
                    <div className="text-zinc-400 text-sm">
                      {epic.department?.name}
                      {getRiskIndicator(epic.riskLevel) && (
                        <span className="ml-2">
                          {getRiskIndicator(epic.riskLevel)}
                        </span>
                      )}

                      {/* Readiness circle (styled like Board view) */}
                      {typeof epic.readiness === "number" && (
                        <div className="ml-3 flex items-center gap-1 shrink-0">
                          <div className="relative w-6 h-6">
                            <svg className="w-6 h-6 transform -rotate-90">
                              <circle
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="2"
                                fill="none"
                                className="text-zinc-700"
                              />
                              <circle
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="2"
                                fill="none"
                                strokeDasharray={`${2 * Math.PI * 10}`}
                                strokeDashoffset={`${2 * Math.PI * 10 * (1 - epic.readiness / 100)}`}
                                className={`transition-all ${
                                  epic.readiness >= 80
                                    ? "text-emerald-500"
                                    : epic.readiness >= 50
                                      ? "text-yellow-500"
                                      : "text-red-500"
                                }`}
                                strokeLinecap="round"
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-xs font-semibold text-white">
                                {epic.readiness}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline Bar */}
              <div className="flex-1 relative h-8 bg-zinc-800 rounded">
                <div
                  className={`absolute top-0 h-full rounded border-2 ${getPriorityColor(epic.priority)} cursor-pointer hover:opacity-80 transition-opacity`}
                  style={getEpicStyle(epic)}
                  title={`${epic.title} (${epic.progress}% complete)`}
                >
                  {/* Readiness visual moved to the title area (circle) — keep timeline bar focused on schedule & progress */}

                  {/* Progress Overlay */}
                  <div
                    className="h-full bg-white/20 rounded-l"
                    style={{ width: `${epic.progress}%` }}
                  />

                  {/* Epic Title on Bar (if space allows) */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white text-xs font-medium truncate px-2">
                      {epic.progress}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-6 flex items-center gap-6 text-sm text-zinc-400">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span>Critical Priority</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500" />
            <span>High Priority</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span>Medium Priority</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span>Low Priority</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span>Readiness (higher = more ready)</span>
          </div>
          <div className="flex items-center gap-2">
            <span>⚠️ High Risk</span>
          </div>
        </div>
      </div>
    </div>
  );
}
