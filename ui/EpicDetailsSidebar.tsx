"use client";
import { IconCalendar, IconTarget, IconTrendingUp, IconAlertTriangle, IconHash, IconClock, IconBuilding, IconCircleCheck } from "@tabler/icons-react";
import TaskDetailItemHeading from "@/ui/TaskDetail/TaskDetailView/ui/TaskDetailItemHeading";
import TaskDetailItemContent from "@/ui/TaskDetail/TaskDetailView/ui/TaskDetailItemContent";

interface EpicDetails {
  id: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  startDate: string | null;
  priority: string | null;
  businessValue: string | null;
  estimatedEffort: number | null;
  budgetEstimate: number | null;
  riskLevel: string | null;
  strategicAlignment: string | null;
  roiEstimate: number | null;
  stageGate: string | null;
  storyPoints: number | null;
  timeSpent: number | null;
  readinessScore?: number;
  department?: {
    id: string;
    name: string;
  } | null;
  acceptanceCriteria?: string | null;
  metrics: {
    totalTasks: number;
    completedTasks: number;
    progress: number;
  };
}

interface EpicDetailsSidebarProps {
  epic: EpicDetails;
}

export default function EpicDetailsSidebar({ epic }: EpicDetailsSidebarProps) {
  const formatCurrency = (amount: number | null) => {
    if (!amount) return "-";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: string | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getPriorityColor = (priority: string | null) => {
    switch (priority?.toLowerCase()) {
      case "critical": return "bg-red-900/30 text-red-400";
      case "high": return "bg-orange-900/30 text-orange-400";
      case "medium": return "bg-yellow-900/30 text-yellow-400";
      case "low": return "bg-green-900/30 text-green-400";
      default: return "bg-zinc-700 text-zinc-400";
    }
  };

  const getRiskColor = (risk: string | null) => {
    switch (risk?.toLowerCase()) {
      case "high": return "bg-red-900/30 text-red-400";
      case "medium": return "bg-yellow-900/30 text-yellow-400";
      case "low": return "bg-green-900/30 text-green-400";
      default: return "bg-zinc-700 text-zinc-400";
    }
  };

  const getBusinessValueColor = (value: string | null) => {
    switch (value?.toLowerCase()) {
      case "critical": return "bg-purple-900/30 text-purple-400";
      case "high": return "bg-blue-900/30 text-blue-400";
      case "medium": return "bg-indigo-900/30 text-indigo-400";
      case "low": return "bg-slate-900/30 text-slate-400";
      default: return "bg-zinc-700 text-zinc-400";
    }
  };

  return (
    <div className="mt-6">
      <TaskDetailItemHeading title="Epic Details" icon={<IconTarget size={20} />} />
      <TaskDetailItemContent indented>
        <div className="space-y-4">
          {/* Timeline */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <IconCalendar size={16} className="text-zinc-400" />
              <span className="text-zinc-400 font-medium">Timeline</span>
            </div>
            <div className="pl-6 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Start:</span>
                <span className="text-zinc-300">{formatDate(epic.startDate)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Due:</span>
                <span className="text-zinc-300">{formatDate(epic.dueDate)}</span>
              </div>
            </div>
          </div>

          {/* Priority & Business Value */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <IconTarget size={16} className="text-zinc-400" />
              <span className="text-zinc-400 font-medium">Priority & Value</span>
            </div>
            <div className="pl-6 space-y-2">
              {epic.priority && (
                <span className={`px-2 py-1 text-xs font-medium rounded ${getPriorityColor(epic.priority)}`}>
                  {epic.priority} Priority
                </span>
              )}
              {epic.businessValue && (
                <span className={`px-2 py-1 text-xs font-medium rounded ${getBusinessValueColor(epic.businessValue)}`}>
                  {epic.businessValue} Value
                </span>
              )}
              {epic.strategicAlignment && (
                <div className="text-xs text-zinc-400">
                  Strategic: {epic.strategicAlignment}
                </div>
              )}
            </div>
          </div>

          {/* Financial */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <IconTrendingUp size={16} className="text-zinc-400" />
              <span className="text-zinc-400 font-medium">Financial</span>
            </div>
            <div className="pl-6 space-y-1">
              {epic.budgetEstimate && (
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Budget:</span>
                  <span className="text-zinc-300">{formatCurrency(epic.budgetEstimate)}</span>
                </div>
              )}
              {epic.roiEstimate && (
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">ROI:</span>
                  <span className="text-zinc-300">{epic.roiEstimate}%</span>
                </div>
              )}
              {epic.estimatedEffort && (
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Effort:</span>
                  <span className="text-zinc-300">{epic.estimatedEffort}h</span>
                </div>
              )}
            </div>
          </div>

          {/* Risk & Status */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <IconAlertTriangle size={16} className="text-zinc-400" />
              <span className="text-zinc-400 font-medium">Risk & Status</span>
            </div>
            <div className="pl-6 space-y-2">
              {epic.riskLevel && (
                <span className={`px-2 py-1 text-xs font-medium rounded ${getRiskColor(epic.riskLevel)}`}>
                  {epic.riskLevel} Risk
                </span>
              )}
              {epic.stageGate && (
                <div className="text-xs text-zinc-400">
                  Stage: {epic.stageGate}
                </div>
              )}
            </div>
          </div>

          {/* Metrics */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <IconHash size={16} className="text-zinc-400" />
              <span className="text-zinc-400 font-medium">Metrics</span>
            </div>
            <div className="pl-6 space-y-1">
              {epic.storyPoints && (
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Story Points:</span>
                  <span className="text-zinc-300">{epic.storyPoints}</span>
                </div>
              )}
              {epic.timeSpent && (
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Time Spent:</span>
                  <span className="text-zinc-300">{epic.timeSpent}h</span>
                </div>
              )}
              {epic.readinessScore && (
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Readiness:</span>
                  <span className="text-zinc-300">{epic.readinessScore}%</span>
                </div>
              )}
            </div>
          </div>

          {/* Department */}
          {epic.department && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <IconBuilding size={16} className="text-zinc-400" />
                <span className="text-zinc-400 font-medium">Department</span>
              </div>
              <div className="pl-6">
                <span className="px-2 py-1 text-xs font-medium bg-purple-900/30 text-purple-400 rounded">
                  {epic.department.name}
                </span>
              </div>
            </div>
          )}

          {/* Definition of Done */}
          {epic.acceptanceCriteria && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <IconCircleCheck size={16} className="text-zinc-400" />
                <span className="text-zinc-400 font-medium">Definition of Done</span>
              </div>
              <div className="pl-6">
                <div className="text-xs text-zinc-400 bg-zinc-800/50 p-2 rounded border border-zinc-700">
                  {epic.acceptanceCriteria}
                </div>
              </div>
            </div>
          )}
        </div>
      </TaskDetailItemContent>
    </div>
  );
}