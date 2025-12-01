"use client";
import { useState } from "react";
import {
  IconLayoutGrid,
  IconCalendar,
  IconTable,
  IconPlus,
} from "@tabler/icons-react";
import EpicPriorityView from "./EpicPriorityView";
import Link from "next/link";

interface Epic {
  id: string;
  title: string;
  description: string | null;
  priority: string | null;
  businessValue: string | null;
  riskLevel: string | null;
  dueDate: string | null;
  metrics: {
    totalTasks: number;
    completedTasks: number;
    blockedTasks: number;
    progress: number;
  };
  owner: any;
  raciAssignments: any[];
  stakeholders: any[];
}

interface EpicPortfolioClientProps {
  epics: Epic[];
}

export default function EpicPortfolioClient({
  epics,
}: EpicPortfolioClientProps) {
  const [view, setView] = useState<"priority" | "timeline" | "matrix">(
    "priority"
  );
  const [filter, setFilter] = useState<"all" | "active" | "backlog">("all");

  const filteredEpics = epics.filter((epic) => {
    if (filter === "all") return true;
    if (filter === "active")
      return epic.metrics.progress > 0 && epic.metrics.progress < 100;
    if (filter === "backlog") return epic.metrics.progress === 0;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Epic Portfolio</h1>
          <p className="text-zinc-400 mt-1">{epics.length} epics total</p>
        </div>
        <Link
          href="/epics/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
        >
          <IconPlus size={20} />
          New Epic
        </Link>
      </div>

      {/* View Switcher and Filters */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setView("priority")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              view === "priority"
                ? "bg-zinc-800 text-white"
                : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800"
            }`}
          >
            <IconLayoutGrid size={18} />
            Priority View
          </button>
          <button
            onClick={() => setView("timeline")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              view === "timeline"
                ? "bg-zinc-800 text-white"
                : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800"
            }`}
          >
            <IconCalendar size={18} />
            Timeline
          </button>
          <button
            onClick={() => setView("matrix")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              view === "matrix"
                ? "bg-zinc-800 text-white"
                : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800"
            }`}
          >
            <IconTable size={18} />
            Value Matrix
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === "all"
                ? "bg-zinc-800 text-white"
                : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("active")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === "active"
                ? "bg-zinc-800 text-white"
                : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800"
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilter("backlog")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === "backlog"
                ? "bg-zinc-800 text-white"
                : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800"
            }`}
          >
            Backlog
          </button>
        </div>
      </div>

      {/* View Content */}
      {view === "priority" && <EpicPriorityView epics={filteredEpics} />}
      {view === "timeline" && (
        <div className="text-zinc-400">Timeline view coming soon...</div>
      )}
      {view === "matrix" && (
        <div className="text-zinc-400">Matrix view coming soon...</div>
      )}
    </div>
  );
}
