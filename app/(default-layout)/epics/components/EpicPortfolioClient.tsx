"use client";
import { useState, useEffect } from "react";
import {
  IconLayoutGrid,
  IconCalendar,
  IconTable,
  IconPlus,
  IconList,
} from "@tabler/icons-react";
import EpicPriorityView from "./EpicPriorityView";
import EpicTableView from "./EpicTableView";
import EpicBoard from "./EpicBoard";
import EpicBubbleChart from "./EpicBubbleChart";
import EpicTimeline from "./EpicTimeline";
import Link from "next/link";

interface Epic {
  id: string;
  title: string;
  description: string | null;
  priority: string | null;
  businessValue: string | null;
  riskLevel: string | null;
  dueDate: string | null;
  startDate: string | null;
  readinessScore?: number;
  estimatedEffort?: number | null;
  budgetEstimate?: number | null;
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
  raciAssignments: any[];
  stakeholders: any[];
}

interface EpicPortfolioClientProps {
  epics: Epic[];
  epicBoard: any;
}

const STORAGE_KEY = "epic-portfolio-state";

interface SavedState {
  view: "priority" | "timeline" | "matrix" | "table" | "board";
  filter: "all" | "active" | "backlog";
  departmentFilter: string;
  riskFilter: string;
  businessValueFilter: string;
  dueDateFilter: string;
}

export default function EpicPortfolioClient({
  epics,
  epicBoard,
}: EpicPortfolioClientProps) {
  // Load saved state from localStorage
  const loadSavedState = (): SavedState => {
    if (typeof window === "undefined")
      return {
        view: "priority",
        filter: "all",
        departmentFilter: "all",
        riskFilter: "all",
        businessValueFilter: "all",
        dueDateFilter: "all",
      };

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved
        ? JSON.parse(saved)
        : {
            view: "priority",
            filter: "all",
            departmentFilter: "all",
            riskFilter: "all",
            businessValueFilter: "all",
            dueDateFilter: "all",
          };
    } catch (error) {
      console.error("Error loading saved state:", error);
      return {
        view: "priority",
        filter: "all",
        departmentFilter: "all",
        riskFilter: "all",
        businessValueFilter: "all",
        dueDateFilter: "all",
      };
    }
  };

  const savedState = loadSavedState();

  const [view, setView] = useState<
    "priority" | "timeline" | "matrix" | "table" | "board"
  >(savedState.view);
  const [filter, setFilter] = useState<"all" | "active" | "backlog">(
    savedState.filter
  );
  const [departmentFilter, setDepartmentFilter] = useState<string>(
    savedState.departmentFilter
  );
  const [riskFilter, setRiskFilter] = useState<string>(savedState.riskFilter);
  const [businessValueFilter, setBusinessValueFilter] = useState<string>(
    savedState.businessValueFilter
  );
  const [dueDateFilter, setDueDateFilter] = useState<string>(
    savedState.dueDateFilter
  );

  // Save state to localStorage whenever it changes
  useEffect(() => {
    const stateToSave: SavedState = {
      view,
      filter,
      departmentFilter,
      riskFilter,
      businessValueFilter,
      dueDateFilter,
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (error) {
      console.error("Error saving state:", error);
    }
  }, [
    view,
    filter,
    departmentFilter,
    riskFilter,
    businessValueFilter,
    dueDateFilter,
  ]);

  // Get unique departments for filter dropdown
  const departments = Array.from(
    new Set(epics.map((epic) => epic.department?.name).filter(Boolean))
  ).sort();

  const filteredEpics = epics.filter((epic) => {
    // Status filter
    if (
      filter === "active" &&
      !(epic.metrics.progress > 0 && epic.metrics.progress < 100)
    )
      return false;
    if (filter === "backlog" && epic.metrics.progress !== 0) return false;

    // Department filter
    if (
      departmentFilter !== "all" &&
      epic.department?.name !== departmentFilter
    )
      return false;

    // Risk filter
    if (
      riskFilter !== "all" &&
      epic.riskLevel?.toUpperCase() !== riskFilter.toUpperCase()
    )
      return false;

    // Business value filter
    if (
      businessValueFilter !== "all" &&
      epic.businessValue?.toUpperCase() !== businessValueFilter.toUpperCase()
    )
      return false;

    // Due date filter
    if (dueDateFilter !== "all") {
      const now = new Date();
      const dueDate = epic.dueDate ? new Date(epic.dueDate) : null;

      if (!dueDate) return false;

      switch (dueDateFilter) {
        case "overdue":
          if (dueDate >= now) return false;
          break;
        case "this-week":
          const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
          if (dueDate > weekFromNow || dueDate < now) return false;
          break;
        case "this-month":
          const monthFromNow = new Date(
            now.getTime() + 30 * 24 * 60 * 60 * 1000
          );
          if (dueDate > monthFromNow || dueDate < now) return false;
          break;
        case "next-month":
          const nextMonth = new Date(
            now.getFullYear(),
            now.getMonth() + 1,
            now.getDate()
          );
          const monthAfter = new Date(
            now.getFullYear(),
            now.getMonth() + 2,
            now.getDate()
          );
          if (dueDate < nextMonth || dueDate >= monthAfter) return false;
          break;
      }
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Epic Portfolio</h1>
          <p className="text-zinc-400 mt-1">
            {filteredEpics.length} of {epics.length} epics
            {filteredEpics.length !== epics.length && " (filtered)"}
          </p>
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
            onClick={() => setView("table")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              view === "table"
                ? "bg-zinc-800 text-white"
                : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800"
            }`}
          >
            <IconList size={18} />
            Table View
          </button>
          <button
            onClick={() => setView("board")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              view === "board"
                ? "bg-zinc-800 text-white"
                : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800"
            }`}
          >
            <IconTable size={18} />
            Board View
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

      {/* Advanced Filters */}
      <div className="flex flex-wrap gap-4 p-4 bg-zinc-900 rounded-lg">
        <div className="flex items-center gap-2">
          <label className="text-sm text-zinc-400">Department:</label>
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-3 py-1 bg-zinc-800 border border-zinc-700 rounded text-white text-sm focus:border-zinc-600 focus:outline-none"
          >
            <option value="all">All Departments</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-zinc-400">Risk Level:</label>
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="px-3 py-1 bg-zinc-800 border border-zinc-700 rounded text-white text-sm focus:border-zinc-600 focus:outline-none"
          >
            <option value="all">All Risks</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-zinc-400">Business Value:</label>
          <select
            value={businessValueFilter}
            onChange={(e) => setBusinessValueFilter(e.target.value)}
            className="px-3 py-1 bg-zinc-800 border border-zinc-700 rounded text-white text-sm focus:border-zinc-600 focus:outline-none"
          >
            <option value="all">All Values</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-zinc-400">Due Date:</label>
          <select
            value={dueDateFilter}
            onChange={(e) => setDueDateFilter(e.target.value)}
            className="px-3 py-1 bg-zinc-800 border border-zinc-700 rounded text-white text-sm focus:border-zinc-600 focus:outline-none"
          >
            <option value="all">All Dates</option>
            <option value="overdue">Overdue</option>
            <option value="this-week">This Week</option>
            <option value="this-month">This Month</option>
            <option value="next-month">Next Month</option>
          </select>
        </div>

        {(departmentFilter !== "all" ||
          riskFilter !== "all" ||
          businessValueFilter !== "all" ||
          dueDateFilter !== "all") && (
          <button
            onClick={() => {
              setDepartmentFilter("all");
              setRiskFilter("all");
              setBusinessValueFilter("all");
              setDueDateFilter("all");
            }}
            className="px-3 py-1 text-sm text-zinc-400 hover:text-white transition-colors"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* View Content */}
      {view === "priority" && <EpicPriorityView epics={filteredEpics} />}
      {view === "table" && <EpicTableView epics={filteredEpics} />}
      {view === "board" && epicBoard && (
        <EpicBoard board={epicBoard} epics={filteredEpics} />
      )}
      {view === "board" && !epicBoard && (
        <div className="text-zinc-400">
          Epic board not found. Please create a board named "Epics".
        </div>
      )}
      {view === "timeline" && (
        <EpicTimeline
          epics={filteredEpics.map((epic) => ({
            id: epic.id,
            title: epic.title,
            startDate: epic.startDate ? new Date(epic.startDate) : null,
            dueDate: epic.dueDate ? new Date(epic.dueDate) : null,
            progress: epic.metrics.progress,
            priority: epic.priority as
              | "CRITICAL"
              | "HIGH"
              | "MEDIUM"
              | "LOW"
              | null,
            riskLevel: epic.riskLevel as "HIGH" | "MEDIUM" | "LOW" | null,
            department: epic.department || undefined,
            businessValue: epic.businessValue
              ? parseFloat(epic.businessValue)
              : null,
            // include readiness score (nullable)
            readiness:
              typeof epic.readinessScore === "number"
                ? epic.readinessScore
                : null,
          }))}
        />
      )}
      {view === "matrix" && <EpicBubbleChart epics={filteredEpics} />}
    </div>
  );
}
