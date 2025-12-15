"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  IconChevronUp,
  IconChevronDown,
  IconSettings,
  IconExternalLink,
  IconEdit,
} from "@tabler/icons-react";

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
  column?: {
    id: string;
    title: string;
    board?: {
      id: string;
      title: string;
    };
  } | null;
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

interface EpicTableViewProps {
  epics: Epic[];
}

type SortField =
  | "title"
  | "status"
  | "priority"
  | "readinessScore"
  | "progress"
  | "dueDate"
  | "department"
  | "businessValue"
  | "riskLevel"
  | "totalTasks";

type SortDirection = "asc" | "desc";

interface ColumnConfig {
  key: string;
  label: string;
  visible: boolean;
  sortable: boolean;
}

export default function EpicTableView({ epics }: EpicTableViewProps) {
  const router = useRouter();
  const [sortField, setSortField] = useState<SortField>("title");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [showColumnSettings, setShowColumnSettings] = useState(false);
  const [columns, setColumns] = useState<ColumnConfig[]>([
    { key: "title", label: "Title", visible: true, sortable: true },
    { key: "status", label: "Status", visible: true, sortable: true },
    {
      key: "readinessScore",
      label: "Readiness",
      visible: true,
      sortable: true,
    },
    { key: "priority", label: "Priority", visible: true, sortable: true },
    { key: "department", label: "Department", visible: true, sortable: true },
    {
      key: "businessValue",
      label: "Business Value",
      visible: true,
      sortable: true,
    },
    { key: "riskLevel", label: "Risk", visible: true, sortable: true },
    { key: "progress", label: "Progress", visible: true, sortable: true },
    { key: "totalTasks", label: "Tasks", visible: true, sortable: true },
    { key: "dueDate", label: "Due Date", visible: true, sortable: true },
    { key: "owner", label: "Owner", visible: true, sortable: false },
  ]);

  const handleRowClick = (epicId: string, event: React.MouseEvent) => {
    // Don't navigate if clicking on action buttons or links
    if ((event.target as HTMLElement).closest('a, button')) {
      return;
    }
    router.push(`/epics/${epicId}`);
  };

  const toggleColumn = (key: string) => {
    setColumns((prev) =>
      prev.map((col) =>
        col.key === key ? { ...col, visible: !col.visible } : col
      )
    );
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedEpics = useMemo(() => {
    const sorted = [...epics].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case "title":
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case "status":
          aValue = a.column?.title?.toLowerCase() || "";
          bValue = b.column?.title?.toLowerCase() || "";
          break;
        case "priority":
          const priorityOrder = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
          aValue =
            priorityOrder[
              a.priority?.toUpperCase() as keyof typeof priorityOrder
            ] || 0;
          bValue =
            priorityOrder[
              b.priority?.toUpperCase() as keyof typeof priorityOrder
            ] || 0;
          break;
        case "readinessScore":
          aValue = a.readinessScore || 0;
          bValue = b.readinessScore || 0;
          break;
        case "progress":
          aValue = a.metrics.progress;
          bValue = b.metrics.progress;
          break;
        case "dueDate":
          aValue = a.dueDate ? new Date(a.dueDate).getTime() : 0;
          bValue = b.dueDate ? new Date(b.dueDate).getTime() : 0;
          break;
        case "department":
          aValue = a.department?.name?.toLowerCase() || "";
          bValue = b.department?.name?.toLowerCase() || "";
          break;
        case "businessValue":
          const valueOrder = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
          aValue =
            valueOrder[
              a.businessValue?.toUpperCase() as keyof typeof valueOrder
            ] || 0;
          bValue =
            valueOrder[
              b.businessValue?.toUpperCase() as keyof typeof valueOrder
            ] || 0;
          break;
        case "riskLevel":
          const riskOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
          aValue =
            riskOrder[a.riskLevel?.toUpperCase() as keyof typeof riskOrder] ||
            0;
          bValue =
            riskOrder[b.riskLevel?.toUpperCase() as keyof typeof riskOrder] ||
            0;
          break;
        case "totalTasks":
          aValue = a.metrics.totalTasks;
          bValue = b.metrics.totalTasks;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [epics, sortField, sortDirection]);

  const formatDate = (date: string | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getPriorityColor = (priority: string | null) => {
    switch (priority?.toUpperCase()) {
      case "CRITICAL":
        return "bg-red-900/30 text-red-400";
      case "HIGH":
        return "bg-orange-900/30 text-orange-400";
      case "MEDIUM":
        return "bg-yellow-900/30 text-yellow-400";
      case "LOW":
        return "bg-green-900/30 text-green-400";
      default:
        return "bg-zinc-800 text-zinc-400";
    }
  };

  const getRiskColor = (risk: string | null) => {
    switch (risk?.toUpperCase()) {
      case "HIGH":
        return "bg-red-900/30 text-red-400";
      case "MEDIUM":
        return "bg-yellow-900/30 text-yellow-400";
      case "LOW":
        return "bg-green-900/30 text-green-400";
      default:
        return "bg-zinc-800 text-zinc-400";
    }
  };

  const getReadinessColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 50) return "text-yellow-500";
    return "text-red-500";
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? (
      <IconChevronUp size={16} />
    ) : (
      <IconChevronDown size={16} />
    );
  };

  const visibleColumns = columns.filter((col) => col.visible);

  return (
    <div className="space-y-4">
      {/* Column Settings */}
      <div className="flex justify-end">
        <div className="relative">
          <button
            onClick={() => setShowColumnSettings(!showColumnSettings)}
            className="flex items-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors text-sm"
          >
            <IconSettings size={16} />
            Columns
          </button>
          {showColumnSettings && (
            <div className="absolute right-0 mt-2 w-56 bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg z-10">
              <div className="p-2 space-y-1">
                {columns.map((col) => (
                  <label
                    key={col.key}
                    className="flex items-center gap-2 px-2 py-1.5 hover:bg-zinc-700 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={col.visible}
                      onChange={() => toggleColumn(col.key)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-white">{col.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-800 border-b border-zinc-700">
              <tr>
                {visibleColumns.map((col) => (
                  <th
                    key={col.key}
                    className={`px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider ${
                      col.sortable ? "cursor-pointer hover:bg-zinc-700" : ""
                    }`}
                    onClick={() =>
                      col.sortable && handleSort(col.key as SortField)
                    }
                  >
                    <div className="flex items-center gap-2">
                      {col.label}
                      {col.sortable && (
                        <SortIcon field={col.key as SortField} />
                      )}
                    </div>
                  </th>
                ))}
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {sortedEpics.map((epic) => (
                <tr
                  key={epic.id}
                  onClick={(event) => handleRowClick(epic.id, event)}
                  className="hover:bg-zinc-800/50 transition-colors cursor-pointer"
                >
                  {visibleColumns.map((col) => {
                    switch (col.key) {
                      case "title":
                        return (
                          <td key={col.key} className="px-4 py-3">
                            <div className="font-medium text-white">
                              {epic.title}
                            </div>
                            {epic.description && (
                              <div className="text-sm text-zinc-400 line-clamp-1 mt-0.5">
                                {epic.description}
                              </div>
                            )}
                          </td>
                        );
                      case "status":
                        return (
                          <td key={col.key} className="px-4 py-3">
                            {epic.column ? (
                              <span className="px-2 py-1 text-xs font-medium bg-indigo-900/30 text-indigo-400 rounded">
                                {epic.column.title
                                  .replace(/[\uD83C-\uDBFF\uDC00-\uDFFF]+/g, "")
                                  .trim()}
                              </span>
                            ) : (
                              <span className="text-zinc-500">No Status</span>
                            )}
                          </td>
                        );
                      case "readinessScore":
                        return (
                          <td key={col.key} className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-full max-w-[100px] bg-zinc-800 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full transition-all ${
                                    (epic.readinessScore || 0) >= 80
                                      ? "bg-green-500"
                                      : (epic.readinessScore || 0) >= 50
                                        ? "bg-yellow-500"
                                        : "bg-red-500"
                                  }`}
                                  style={{
                                    width: `${epic.readinessScore || 0}%`,
                                  }}
                                ></div>
                              </div>
                              <span
                                className={`text-sm font-medium ${getReadinessColor(
                                  epic.readinessScore || 0
                                )}`}
                              >
                                {epic.readinessScore || 0}%
                              </span>
                            </div>
                          </td>
                        );
                      case "priority":
                        return (
                          <td key={col.key} className="px-4 py-3">
                            {epic.priority ? (
                              <span
                                className={`px-2 py-1 text-xs font-medium rounded ${getPriorityColor(
                                  epic.priority
                                )}`}
                              >
                                {epic.priority}
                              </span>
                            ) : (
                              <span className="text-zinc-500">-</span>
                            )}
                          </td>
                        );
                      case "department":
                        return (
                          <td key={col.key} className="px-4 py-3">
                            {epic.department ? (
                              <span className="px-2 py-1 text-xs font-medium bg-purple-900/30 text-purple-400 rounded">
                                {epic.department.name}
                              </span>
                            ) : (
                              <span className="text-zinc-500">-</span>
                            )}
                          </td>
                        );
                      case "businessValue":
                        return (
                          <td key={col.key} className="px-4 py-3">
                            {epic.businessValue ? (
                              <span className="px-2 py-1 text-xs font-medium bg-blue-900/30 text-blue-400 rounded">
                                {epic.businessValue}
                              </span>
                            ) : (
                              <span className="text-zinc-500">-</span>
                            )}
                          </td>
                        );
                      case "riskLevel":
                        return (
                          <td key={col.key} className="px-4 py-3">
                            {epic.riskLevel ? (
                              <span
                                className={`px-2 py-1 text-xs font-medium rounded ${getRiskColor(
                                  epic.riskLevel
                                )}`}
                              >
                                {epic.riskLevel}
                              </span>
                            ) : (
                              <span className="text-zinc-500">-</span>
                            )}
                          </td>
                        );
                      case "progress":
                        return (
                          <td key={col.key} className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-full max-w-[100px] bg-zinc-800 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full transition-all"
                                  style={{
                                    width: `${epic.metrics.progress}%`,
                                  }}
                                ></div>
                              </div>
                              <span className="text-sm text-zinc-400">
                                {epic.metrics.progress}%
                              </span>
                            </div>
                          </td>
                        );
                      case "totalTasks":
                        return (
                          <td key={col.key} className="px-4 py-3">
                            <div className="text-sm text-zinc-400">
                              {epic.metrics.completedTasks}/
                              {epic.metrics.totalTasks}
                            </div>
                          </td>
                        );
                      case "dueDate":
                        return (
                          <td key={col.key} className="px-4 py-3">
                            <span className="text-sm text-zinc-400">
                              {formatDate(epic.dueDate)}
                            </span>
                          </td>
                        );
                      case "owner":
                        return (
                          <td key={col.key} className="px-4 py-3">
                            {epic.owner ? (
                              <div className="flex items-center gap-2">
                                {epic.owner.image && (
                                  <img
                                    src={epic.owner.image}
                                    alt={epic.owner.name}
                                    className="w-6 h-6 rounded-full"
                                  />
                                )}
                                <span className="text-sm text-zinc-400">
                                  {epic.owner.name}
                                </span>
                              </div>
                            ) : (
                              <span className="text-zinc-500">-</span>
                            )}
                          </td>
                        );
                      default:
                        return null;
                    }
                  })}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/epics/${epic.id}/edit`}
                        className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        <IconEdit size={16} />
                        <span className="text-sm">Edit</span>
                      </Link>
                      <Link
                        href={`/epics/${epic.id}`}
                        className="inline-flex items-center gap-1 text-zinc-400 hover:text-zinc-300 transition-colors"
                      >
                        <IconExternalLink size={14} />
                        <span className="text-sm">View</span>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {sortedEpics.length === 0 && (
          <div className="px-4 py-8 text-center text-zinc-400">
            No epics found
          </div>
        )}
      </div>
    </div>
  );
}
