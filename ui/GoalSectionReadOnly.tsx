"use client";
import { useState, useEffect } from "react";
import { IconTarget, IconCheck } from "@tabler/icons-react";
import { Goal } from "@/types/types";

interface GoalSectionReadOnlyProps {
  taskId: string;
  boardId: string;
}

export default function GoalSectionReadOnly({
  taskId,
  boardId,
}: GoalSectionReadOnlyProps) {
  const [goals, setGoals] = useState<any[]>([]);

  // Fetch goals on mount
  useEffect(() => {
    if (taskId) {
      fetchGoals();
    }
  }, [taskId]);

  const fetchGoals = async () => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/goals`);
      if (response.ok) {
        const data = await response.json();
        setGoals(data);
      }
    } catch (error) {
      console.error("Failed to fetch goals:", error);
    }
  };

  if (goals.length === 0) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Goals</h3>
        <div className="text-center py-8">
          <IconTarget size={48} className="mx-auto text-zinc-600 mb-4" />
          <p className="text-zinc-500">No goals defined yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Goals</h3>
      <div className="space-y-3">
        {goals.map((goal) => (
          <div
            key={goal.id}
            className="flex items-start gap-3 p-3 bg-zinc-800 rounded-lg"
          >
            <div className="flex-shrink-0 mt-0.5">
              {goal.isAchieved ? (
                <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center">
                  <IconCheck size={12} className="text-white" />
                </div>
              ) : (
                <div className="w-5 h-5 border-2 border-zinc-600 rounded-full"></div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className={`font-medium ${goal.isAchieved ? 'text-green-400 line-through' : 'text-white'}`}>
                {goal.title}
              </h4>
              {goal.description && (
                <p className={`text-sm mt-1 ${goal.isAchieved ? 'text-green-500' : 'text-zinc-400'}`}>
                  {goal.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}