"use client";
import Link from "next/link";
import {
  IconUsers,
  IconAlertTriangle,
  IconClock,
  IconGripVertical,
} from "@tabler/icons-react";

interface EpicTask {
  id: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  startDate: string | null;
  priority: string | null;
  businessValue: string | null;
  riskLevel: string | null;
  departmentId: string | null;
  readinessScore: number;
  department?: {
    id: string;
    name: string;
  } | null;
  assignedUsers?: Array<{
    user: {
      id: string;
      name: string | null;
      image: string | null;
    };
  }>;
}

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

interface EpicTaskItemProps {
  task: EpicTask;
  epic?: Epic;
  dragHandleProps?: any;
}

export default function EpicTaskItem({
  task,
  epic,
  dragHandleProps,
}: EpicTaskItemProps) {
  const formatDate = (date: string | null) => {
    if (!date) return "No due date";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Use epic data if available, otherwise fall back to task data
  const metrics = epic?.metrics || {
    totalTasks: 0,
    completedTasks: 0,
    progress: 0,
  };

  const readinessScore = epic?.readinessScore ?? task.readinessScore ?? 0;
  const businessValue = epic?.businessValue ?? task.businessValue;
  const riskLevel = epic?.riskLevel ?? task.riskLevel;
  const department = epic?.department ?? task.department;
  const dueDate = epic?.dueDate ?? task.dueDate;

  return (
    <div className="bg-zinc-900 text-white flex select-none rounded-md hover:shadow-md hover:ring-2 hover:ring-primary mb-2">
      <div
        className="pl-1 pr-1 flex items-center cursor-grab touch-none"
        {...dragHandleProps}
      >
        <IconGripVertical className="text-primary" size={24} />
      </div>

      <Link className="flex-grow pr-3 py-3" href={`/epics/${task.id}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium text-white text-sm truncate">
                {task.title}
              </h4>
              {readinessScore !== undefined && (
                <div className="flex items-center gap-1 shrink-0">
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
                        strokeDashoffset={`${2 * Math.PI * 10 * (1 - readinessScore / 100)}`}
                        className={`transition-all ${
                          readinessScore >= 80
                            ? "text-green-500"
                            : readinessScore >= 50
                              ? "text-yellow-500"
                              : "text-red-500"
                        }`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-semibold text-white">
                        {readinessScore}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {task.description && (
              <p className="text-xs text-zinc-400 line-clamp-1 mb-2">
                {task.description}
              </p>
            )}

            <div className="flex flex-wrap gap-1 mb-2">
              {task.priority && (
                <span
                  className={`px-1.5 py-0.5 text-xs font-medium rounded ${
                    task.priority === "CRITICAL"
                      ? "bg-red-900/30 text-red-400"
                      : task.priority === "HIGH"
                        ? "bg-orange-900/30 text-orange-400"
                        : task.priority === "MEDIUM"
                          ? "bg-yellow-900/30 text-yellow-400"
                          : "bg-green-900/30 text-green-400"
                  }`}
                >
                  {task.priority}
                </span>
              )}
              {department && (
                <span className="px-1.5 py-0.5 text-xs font-medium bg-purple-900/30 text-purple-400 rounded">
                  {department.name}
                </span>
              )}
              {businessValue && (
                <span className="px-1.5 py-0.5 text-xs font-medium bg-blue-900/30 text-blue-400 rounded">
                  {businessValue}
                </span>
              )}
            </div>

            <div className="flex items-center justify-between text-xs text-zinc-400">
              <div className="flex items-center gap-3">
                <span>{metrics.progress}%</span>
                <span>
                  {metrics.completedTasks}/{metrics.totalTasks} tasks
                </span>
                <div className="flex items-center gap-1">
                  <IconClock size={12} />
                  <span>{formatDate(dueDate)}</span>
                </div>
              </div>

              {riskLevel && (
                <span
                  className={`px-1.5 py-0.5 text-xs font-medium rounded ${
                    riskLevel.toUpperCase() === "HIGH"
                      ? "bg-red-900/30 text-red-400"
                      : riskLevel.toUpperCase() === "MEDIUM"
                        ? "bg-yellow-900/30 text-yellow-400"
                        : "bg-green-900/30 text-green-400"
                  }`}
                >
                  {riskLevel}
                </span>
              )}
            </div>

            {/* Progress bar */}
            <div className="mt-2">
              <div className="w-full bg-zinc-700 rounded-full h-1">
                <div
                  className="bg-blue-600 h-1 rounded-full transition-all"
                  style={{ width: `${metrics.progress}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
