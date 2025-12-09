"use client";
import { useState, useEffect } from "react";
import { IconFilter, IconX, IconCheck } from "@tabler/icons-react";
import { supabase } from "@/lib/supabase";

interface EpicFilters {
  priority?: string | null;
  assigneeId?: string | null;
  columnId?: string | null;
  dueDateFilter?: string | null;
  departmentId?: string | null;
  businessValue?: string | null;
  riskLevel?: string | null;
}

interface FilterSidebarProps {
  filters: EpicFilters;
  onFiltersChange: (filters: EpicFilters) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  boardId: string;
}

export default function FilterSidebar({
  filters,
  onFiltersChange,
  isCollapsed,
  onToggleCollapse,
  boardId,
}: FilterSidebarProps) {
  const [users, setUsers] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [columns, setColumns] = useState<any[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data } = await supabase
        .from("User")
        .select("id, name, email")
        .order("name");
      if (data) setUsers(data);
    };

    const fetchDepartments = async () => {
      const { data } = await supabase
        .from("Department")
        .select("id, name")
        .order("name");
      if (data) setDepartments(data);
    };

    const fetchColumns = async () => {
      const { data } = await supabase
        .from("Column")
        .select("id, title")
        .eq("boardId", boardId)
        .order("order");
      if (data) setColumns(data);
    };

    fetchUsers();
    fetchDepartments();
    fetchColumns();
  }, [boardId]);

  const updateFilter = (key: keyof EpicFilters, value: string | null) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({});
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  if (isCollapsed) {
    return (
      <div className="w-12 bg-zinc-800 border-l border-zinc-700 flex flex-col items-center py-4">
        <button
          onClick={onToggleCollapse}
          className="p-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700 rounded-lg transition-colors"
          title="Show Filters"
        >
          <IconFilter size={20} />
          {activeFilterCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="w-80 bg-zinc-800 border-l border-zinc-700 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-zinc-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <IconFilter size={20} className="text-zinc-400" />
          <h3 className="font-semibold text-zinc-200">Filters</h3>
          {activeFilterCount > 0 && (
            <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
              {activeFilterCount}
            </span>
          )}
        </div>
        <button
          onClick={onToggleCollapse}
          className="p-1 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700 rounded transition-colors"
          title="Hide Filters"
        >
          <IconX size={16} />
        </button>
      </div>

      {/* Filter Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Quick Filters */}
        <div>
          <h4 className="text-sm font-medium text-zinc-300 mb-3">
            Quick Filters
          </h4>
          <div className="space-y-2">
            <button
              onClick={() => updateFilter("dueDateFilter", "overdue")}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                filters.dueDateFilter === "overdue"
                  ? "bg-red-600 text-white"
                  : "bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
              }`}
            >
              ⏰ Overdue Tasks
            </button>
            <button
              onClick={() => updateFilter("dueDateFilter", "due_soon")}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                filters.dueDateFilter === "due_soon"
                  ? "bg-orange-600 text-white"
                  : "bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
              }`}
            >
              📅 Due Soon (7 days)
            </button>
            <button
              onClick={() => updateFilter("priority", "CRITICAL")}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                filters.priority === "CRITICAL"
                  ? "bg-red-600 text-white"
                  : "bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
              }`}
            >
              🔥 Critical Priority
            </button>
          </div>
        </div>

        {/* Priority Filter */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Priority
          </label>
          <select
            value={filters.priority || ""}
            onChange={(e) => updateFilter("priority", e.target.value || null)}
            className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Priorities</option>
            <option value="CRITICAL">🔥 Critical</option>
            <option value="HIGH">⚠️ High</option>
            <option value="MEDIUM">📊 Medium</option>
            <option value="LOW">✅ Low</option>
          </select>
        </div>

        {/* Assignee Filter */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Assignee
          </label>
          <select
            value={filters.assigneeId || ""}
            onChange={(e) => updateFilter("assigneeId", e.target.value || null)}
            className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Assignees</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                👤 {user.name}
              </option>
            ))}
          </select>
        </div>

        {/* Column/Status Filter */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Column (Status)
          </label>
          <select
            value={filters.columnId || ""}
            onChange={(e) => updateFilter("columnId", e.target.value || null)}
            className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Columns</option>
            {columns.map((column) => (
              <option key={column.id} value={column.id}>
                📋 {column.title}
              </option>
            ))}
          </select>
        </div>

        {/* Department Filter */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Department
          </label>
          <select
            value={filters.departmentId || ""}
            onChange={(e) =>
              updateFilter("departmentId", e.target.value || null)
            }
            className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Departments</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                🏢 {dept.name}
              </option>
            ))}
          </select>
        </div>

        {/* Business Value Filter */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Business Value
          </label>
          <select
            value={filters.businessValue || ""}
            onChange={(e) =>
              updateFilter("businessValue", e.target.value || null)
            }
            className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Values</option>
            <option value="HIGH">💎 High</option>
            <option value="MEDIUM">📈 Medium</option>
            <option value="LOW">📉 Low</option>
          </select>
        </div>

        {/* Risk Level Filter */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Risk Level
          </label>
          <select
            value={filters.riskLevel || ""}
            onChange={(e) => updateFilter("riskLevel", e.target.value || null)}
            className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Risks</option>
            <option value="HIGH">🚨 High</option>
            <option value="MEDIUM">⚠️ Medium</option>
            <option value="LOW">✅ Low</option>
          </select>
        </div>
      </div>

      {/* Footer */}
      {activeFilterCount > 0 && (
        <div className="p-4 border-t border-zinc-700">
          <button
            onClick={clearAllFilters}
            className="w-full bg-zinc-700 hover:bg-zinc-600 text-zinc-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            <IconX size={16} />
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
}
