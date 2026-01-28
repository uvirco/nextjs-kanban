"use client";
import React from "react";

interface BudgetActivityTabProps {
  activities: any[];
}

export default function BudgetActivityTab({
  activities,
}: BudgetActivityTabProps) {
  const formatDate = (date: string | Date | null | undefined) => {
    if (!date) return "-";
    try {
      const d = typeof date === "string" ? new Date(date) : date;
      return d.toLocaleDateString() + " " + d.toLocaleTimeString();
    } catch {
      return "-";
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "BUDGET_CREATED":
        return "✨";
      case "BUDGET_UPDATED":
        return "✏️";
      case "BUDGET_STATUS_CHANGED":
        return "📊";
      case "BUDGET_COMMENT_ADDED":
        return "💬";
      default:
        return "📝";
    }
  };

  return (
    <div className="p-4 space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto">
      {activities.length === 0 ? (
        <p className="text-zinc-400 text-sm">No activity yet</p>
      ) : (
        activities.map((activity) => (
          <div
            key={activity.id}
            className="bg-zinc-800/50 rounded p-3 border border-zinc-700"
          >
            <div className="flex items-start gap-2">
              <span className="text-lg">{getActivityIcon(activity.type)}</span>
              <div className="flex-1">
                <p className="text-white text-sm">
                  {activity.user?.name || activity.user?.email || "Unknown"}
                </p>
                <p className="text-zinc-300 text-sm">{activity.description}</p>
                <p className="text-xs text-zinc-500">
                  {formatDate(activity.created_at)}
                </p>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
