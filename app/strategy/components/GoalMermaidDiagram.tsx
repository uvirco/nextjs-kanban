"use client";

import { useEffect, useState } from "react";
import { StrategicGoal } from "@/types/types";
import { Select, SelectItem } from "@nextui-org/select";
import { Chip } from "@nextui-org/chip";

interface GoalMermaidDiagramProps {
  goals: StrategicGoal[];
}

export default function GoalMermaidDiagram({ goals }: GoalMermaidDiagramProps) {
  const [selectedGoalId, setSelectedGoalId] = useState<string>("");

  // Get top-level objectives for selection
  const topLevelGoals = goals.filter((g) => !g.parent_goal_id);

  useEffect(() => {
    // Auto-select first objective if available
    if (topLevelGoals.length > 0 && !selectedGoalId) {
      setSelectedGoalId(topLevelGoals[0].id);
    }
  }, [goals, selectedGoalId, topLevelGoals]);

  const selectedGoal = goals.find((g) => g.id === selectedGoalId);
  const childGoals = selectedGoal
    ? goals.filter((g) => g.parent_goal_id === selectedGoalId)
    : [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "achieved":
        return "bg-green-900/30 border-green-700";
      case "on_hold":
        return "bg-orange-900/30 border-orange-700";
      case "abandoned":
        return "bg-red-900/30 border-red-700";
      default:
        return "bg-blue-900/30 border-blue-700";
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "achieved":
        return "bg-green-600 text-white";
      case "on_hold":
        return "bg-orange-600 text-white";
      case "abandoned":
        return "bg-red-600 text-white";
      default:
        return "bg-blue-600 text-white";
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 75) return "bg-green-600";
    if (progress >= 50) return "bg-blue-600";
    if (progress >= 25) return "bg-yellow-600";
    return "bg-red-600";
  };

  return (
    <div className="w-full space-y-6">
      {/* Objective Selector */}
      <div className="flex gap-4 items-end">
        <div className="flex-1">
          <Select
            label="Select Objective"
            placeholder="Choose an objective"
            selectedKeys={selectedGoalId ? [selectedGoalId] : []}
            onSelectionChange={(keys) => {
              const selected = Array.from(keys)[0] as string;
              setSelectedGoalId(selected);
            }}
            className="bg-zinc-800"
            size="lg"
          >
            {topLevelGoals.map((goal) => (
              <SelectItem key={goal.id} value={goal.id}>
                {goal.title}
              </SelectItem>
            ))}
          </Select>
        </div>
        {childGoals.length > 0 && (
          <div className="text-sm text-zinc-400 pb-2">
            {childGoals.length} sub-goal{childGoals.length !== 1 ? "s" : ""}
          </div>
        )}
      </div>

      {/* Objective Card */}
      {selectedGoal && (
        <div className="space-y-4">
          <div
            className={`${getStatusColor(selectedGoal.status)} border-2 rounded-lg p-8`}
          >
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-3xl font-bold text-white flex-1">
                {selectedGoal.title}
              </h2>
              <Chip
                variant="flat"
                className={`${getStatusBadgeColor(selectedGoal.status)} text-lg px-4 py-2`}
              >
                {selectedGoal.status.replace("_", " ")}
              </Chip>
            </div>

            {selectedGoal.description && (
              <p className="text-zinc-300 text-lg mb-6">
                {selectedGoal.description}
              </p>
            )}

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-lg font-semibold text-zinc-300">
                  Progress
                </span>
                <span className="text-2xl font-bold text-cyan-400">
                  {selectedGoal.progress}%
                </span>
              </div>
              <div className="w-full bg-zinc-800 rounded-full h-4 overflow-hidden">
                <div
                  className={`h-4 rounded-full transition-all ${getProgressColor(selectedGoal.progress)}`}
                  style={{ width: `${selectedGoal.progress}%` }}
                ></div>
              </div>
            </div>

            {/* Metadata */}
            <div className="grid grid-cols-3 gap-4 text-sm">
              {selectedGoal.fiscal_year && (
                <div>
                  <p className="text-zinc-500">Fiscal Year</p>
                  <p className="text-white text-lg font-semibold">
                    {selectedGoal.fiscal_year}
                  </p>
                </div>
              )}
              {selectedGoal.target_date && (
                <div>
                  <p className="text-zinc-500">Target Date</p>
                  <p className="text-white text-lg font-semibold">
                    {new Date(selectedGoal.target_date).toLocaleDateString()}
                  </p>
                </div>
              )}
              {selectedGoal.linkedTasksCount ? (
                <div>
                  <p className="text-zinc-500">Linked Projects</p>
                  <p className="text-white text-lg font-semibold">
                    {selectedGoal.linkedTasksCount}
                  </p>
                </div>
              ) : null}
            </div>
          </div>

          {/* Sub-Goals */}
          {childGoals.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-white">Sub-Goals</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {childGoals.map((goal) => (
                  <div
                    key={goal.id}
                    className={`${getStatusColor(goal.status)} border-2 rounded-lg p-6`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="text-xl font-bold text-white flex-1">
                        {goal.title}
                      </h4>
                      <Chip
                        variant="flat"
                        className={getStatusBadgeColor(goal.status)}
                        size="sm"
                      >
                        {goal.status.replace("_", " ")}
                      </Chip>
                    </div>

                    {goal.description && (
                      <p className="text-zinc-300 text-sm mb-4">
                        {goal.description}
                      </p>
                    )}

                    {/* Progress */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-zinc-400">Progress</span>
                        <span className="text-lg font-bold text-cyan-400">
                          {goal.progress}%
                        </span>
                      </div>
                      <div className="w-full bg-zinc-800 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${getProgressColor(goal.progress)}`}
                          style={{ width: `${goal.progress}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Sub-goal metadata */}
                    <div className="space-y-2 text-xs text-zinc-400">
                      {goal.fiscal_year && <p>FY: {goal.fiscal_year}</p>}
                      {goal.target_date && (
                        <p>
                          Target:{" "}
                          {new Date(goal.target_date).toLocaleDateString()}
                        </p>
                      )}
                      {goal.linkedTasksCount ? (
                        <p>📊 {goal.linkedTasksCount} project(s)</p>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
