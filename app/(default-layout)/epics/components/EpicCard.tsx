"use client";
import Link from "next/link";
import { IconUsers, IconAlertTriangle, IconClock } from "@tabler/icons-react";

interface Epic {
  id: string;
  title: string;
  description: string | null;
  businessValue: string | null;
  riskLevel: string | null;
  dueDate: string | null;
  readinessScore?: number;
  department?: {
    id: string;
    name: string;
  } | null;
  metrics: {
    totalTasks: number;
    completedTasks: number;
    blockedTasks: number;
    progress: number;
  };
  owner: any;
}

interface EpicCardProps {
  epic: Epic;
}

export default function EpicCard({ epic }: EpicCardProps) {
  const formatDate = (date: string | null) => {
    if (!date) return "No due date";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Link
      href={`/epics/${epic.id}`}
      className="block p-4 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-zinc-700 hover:bg-zinc-800 transition-colors"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-white truncate">
              {epic.title}
            </h3>
            {epic.readinessScore !== undefined && (
              <div className="flex items-center gap-1.5 shrink-0">
                <div className="relative w-10 h-10">
                  <svg className="w-10 h-10 transform -rotate-90">
                    <circle
                      cx="20"
                      cy="20"
                      r="16"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                      className="text-zinc-800"
                    />
                    <circle
                      cx="20"
                      cy="20"
                      r="16"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 16}`}
                      strokeDashoffset={`${2 * Math.PI * 16 * (1 - epic.readinessScore / 100)}`}
                      className={`transition-all ${
                        epic.readinessScore >= 80
                          ? "text-green-500"
                          : epic.readinessScore >= 50
                            ? "text-yellow-500"
                            : "text-red-500"
                      }`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-semibold text-white">
                      {epic.readinessScore}%
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
          {epic.description && (
            <p className="text-sm text-zinc-400 line-clamp-2 mt-1">
              {epic.description}
            </p>
          )}
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          {epic.businessValue && (
            <span className="px-2 py-1 text-xs font-medium bg-blue-900/30 text-blue-400 rounded">
              {epic.businessValue}
            </span>
          )}
          {epic.department && (
            <span className="px-2 py-1 text-xs font-medium bg-purple-900/30 text-purple-400 rounded">
              {epic.department.name}
            </span>
          )}
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <span> {epic.metrics.progress}%</span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm">
        <div className="flex items-center gap-4 text-zinc-400">
          {epic.owner && (
            <div className="flex items-center gap-1">
              <IconUsers size={16} />
              <span>{epic.owner.name}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <IconClock size={16} />
            <span>{formatDate(epic.dueDate)}</span>
          </div>
          <div>
            {epic.metrics.totalTasks} tasks | {epic.metrics.completedTasks} done
          </div>
          {epic.metrics.blockedTasks > 0 && (
            <div className="flex items-center gap-1 text-red-400">
              <IconAlertTriangle size={16} />
              <span>{epic.metrics.blockedTasks} blocked</span>
            </div>
          )}
        </div>

        {epic.riskLevel && (
          <span
            className={`px-2 py-1 text-xs font-medium rounded ${
              epic.riskLevel.toUpperCase() === "HIGH"
                ? "bg-red-900/30 text-red-400"
                : epic.riskLevel.toUpperCase() === "MEDIUM"
                  ? "bg-yellow-900/30 text-yellow-400"
                  : "bg-green-900/30 text-green-400"
            }`}
          >
            {epic.riskLevel} Risk
          </span>
        )}
      </div>

      {/* Progress bar */}
      <div className="mt-3">
        <div className="w-full bg-zinc-800 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${epic.metrics.progress}%` }}
          ></div>
        </div>
      </div>
    </Link>
  );
}
