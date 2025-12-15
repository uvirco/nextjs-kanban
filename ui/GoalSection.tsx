"use client";
import { useState, useEffect } from "react";
import {
  IconPlus,
  IconX,
  IconCheck,
  IconTarget,
  IconLoader,
} from "@tabler/icons-react";
import {
  handleCreateGoal,
  handleUpdateGoal,
  handleMarkGoalAchieved,
  handleDeleteGoal,
} from "@/server-actions/GoalServerActions";
import { toast } from "sonner";
import { Goal } from "@/types/types";

interface GoalSectionProps {
  taskId: string;
  boardId: string;
  initialGoals?: any[];
}

export default function GoalSection({
  taskId,
  boardId,
  initialGoals = [],
}: GoalSectionProps) {
  const [goals, setGoals] = useState<any[]>(initialGoals);
  const [isAdding, setIsAdding] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [newGoalDescription, setNewGoalDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  // Fetch goals on mount and when taskId changes (only if no initial goals provided)
  useEffect(() => {
    if (taskId && initialGoals.length === 0) {
      fetchGoals();
    }
  }, [taskId]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchGoals = async () => {
    if (!taskId) {
      console.log("taskId is undefined, skipping fetch");
      return;
    }
    try {
      console.log("Fetching goals for taskId:", taskId);
      const response = await fetch(`/api/tasks/${taskId}/goals`);
      console.log("Response status:", response.status);
      if (response.ok) {
        const data = await response.json();
        console.log("Fetched goals:", data);
        setGoals(data);
      } else {
        console.error(
          "Failed to fetch goals:",
          response.status,
          response.statusText
        );
      }
    } catch (error) {
      console.error("Error fetching goals:", error);
    }
  };

  const handleAddGoal = async () => {
    if (!newGoalTitle.trim()) {
      toast.error("Goal title is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await handleCreateGoal({
        title: newGoalTitle,
        description: newGoalDescription || undefined,
        taskId,
        boardId,
      });

      if (result.success) {
        toast.success(result.message);
        setNewGoalTitle("");
        setNewGoalDescription("");
        setIsAdding(false);
        await fetchGoals();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error creating goal:", error);
      toast.error("Failed to create goal");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleAchieved = async (goal: Goal) => {
    try {
      const result = await handleMarkGoalAchieved({
        goalId: goal.id,
        achieved: !goal.achieved,
        taskId,
        boardId,
      });

      if (result.success) {
        if (!goal.achieved) {
          toast.success(result.message, {
            duration: 5000,
            icon: "🎉",
          });
        } else {
          toast.success(result.message);
        }
        await fetchGoals();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error toggling goal:", error);
      toast.error("Failed to update goal");
    }
  };

  const handleEdit = (goal: Goal) => {
    setEditingGoalId(goal.id);
    setEditTitle(goal.title);
    setEditDescription(goal.description || "");
  };

  const handleSaveEdit = async (goalId: string) => {
    setIsSubmitting(true);
    try {
      const result = await handleUpdateGoal({
        goalId,
        title: editTitle,
        description: editDescription || undefined,
        taskId,
        boardId,
      });

      if (result.success) {
        toast.success(result.message);
        setEditingGoalId(null);
        await fetchGoals();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error updating goal:", error);
      toast.error("Failed to update goal");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (goalId: string) => {
    if (!confirm("Are you sure you want to delete this goal?")) return;

    try {
      const result = await handleDeleteGoal({
        goalId,
        taskId,
        boardId,
      });

      if (result.success) {
        toast.success(result.message);
        await fetchGoals();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error deleting goal:", error);
      toast.error("Failed to delete goal");
    }
  };

  const achievedCount = goals.filter((g) => g.achieved).length;
  const totalCount = goals.length;
  const progressPercent =
    totalCount > 0 ? (achievedCount / totalCount) * 100 : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <IconTarget size={24} className="text-blue-400" />
            Goals
          </h2>
          {totalCount > 0 && (
            <div className="text-sm text-zinc-400">
              {achievedCount}/{totalCount} achieved
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
        >
          <IconPlus size={16} />
          Add Goal
        </button>
      </div>

      {/* Progress Bar */}
      {totalCount > 0 && (
        <div className="w-full bg-zinc-800 rounded-full h-2">
          <div
            className="bg-green-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}

      {/* Add Goal Form */}
      {isAdding && (
        <div className="p-4 bg-zinc-800 rounded-lg border border-zinc-700 space-y-3">
          <div>
            <label className="block text-sm text-zinc-400 mb-1">
              Goal Title *
            </label>
            <input
              type="text"
              value={newGoalTitle}
              onChange={(e) => setNewGoalTitle(e.target.value)}
              placeholder="e.g., Launch MVP, Reach 1000 users"
              className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1">
              Description (optional)
            </label>
            <textarea
              value={newGoalDescription}
              onChange={(e) => setNewGoalDescription(e.target.value)}
              placeholder="Additional context or success metrics..."
              rows={2}
              className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleAddGoal}
              disabled={isSubmitting || !newGoalTitle.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-zinc-600 text-white rounded transition-colors"
            >
              {isSubmitting && (
                <IconLoader size={16} className="animate-spin" />
              )}
              Add Goal
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAdding(false);
                setNewGoalTitle("");
                setNewGoalDescription("");
              }}
              className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Goals List */}
      <div className="space-y-2">
        {goals.length > 0 ? (
          goals.map((goal) => (
            <div
              key={goal.id}
              className={`p-4 rounded-lg border transition-all ${
                goal.achieved
                  ? "bg-green-900/20 border-green-700"
                  : "bg-zinc-800 border-zinc-700"
              }`}
            >
              {editingGoalId === goal.id ? (
                // Edit Mode
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleSaveEdit(goal.id)}
                      disabled={isSubmitting}
                      className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingGoalId(null)}
                      className="px-3 py-1 bg-zinc-700 hover:bg-zinc-600 text-white rounded text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                // View Mode
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    onClick={() => handleToggleAchieved(goal)}
                    className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                      goal.achieved
                        ? "bg-green-500 border-green-500"
                        : "border-zinc-500 hover:border-green-500"
                    }`}
                  >
                    {goal.achieved && (
                      <IconCheck size={14} className="text-white" />
                    )}
                  </button>

                  <div className="flex-1">
                    <div
                      className={`font-medium ${
                        goal.achieved
                          ? "text-green-300 line-through"
                          : "text-white"
                      }`}
                    >
                      {goal.title}
                    </div>
                    {goal.description && (
                      <div className="text-sm text-zinc-400 mt-1">
                        {goal.description}
                      </div>
                    )}
                    {goal.achieved && goal.achievedAt && (
                      <div className="text-xs text-green-400 mt-1">
                        ✓ Achieved{" "}
                        {new Date(goal.achievedAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => handleEdit(goal)}
                      className="p-1 text-zinc-400 hover:text-blue-400 transition-colors"
                      title="Edit goal"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(goal.id)}
                      className="p-1 text-zinc-400 hover:text-red-400 transition-colors"
                      title="Delete goal"
                    >
                      <IconX size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-zinc-500 text-center py-8 bg-zinc-800 rounded-lg border border-zinc-700">
            No goals defined yet. Add your first goal! 🎯
          </div>
        )}
      </div>
    </div>
  );
}
