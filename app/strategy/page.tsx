"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Chip } from "@nextui-org/chip";
import { toast } from "sonner";
import {
  IconTrendingUp,
  IconBulb,
  IconTools,
  IconBroadcast,
  IconUsers,
  IconShield,
  IconSettings,
} from "@tabler/icons-react";

interface StrategicGoal {
  id: string;
  title: string;
  description: string | null;
  status: "active" | "achieved" | "on_hold" | "abandoned";
  progress: number;
  parent_goal_id: string | null;
  children?: StrategicGoal[];
}

export default function StrategyPage() {
  const [goals, setGoals] = useState<StrategicGoal[]>([]);
  const [topLevelGoals, setTopLevelGoals] = useState<StrategicGoal[]>([]);
  const [selectedGoal, setSelectedGoal] = useState<StrategicGoal | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    setLoading(true);
    try {
      const { data: goalsData, error } = await supabase
        .from("StrategicGoal")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) throw error;

      if (goalsData) {
        // Build goal tree
        const goalMap = new Map<string, StrategicGoal>();
        goalsData.forEach((goal) => {
          goalMap.set(goal.id, { ...goal, children: [] });
        });

        const topLevel: StrategicGoal[] = [];
        goalsData.forEach((goal) => {
          const goalInMap = goalMap.get(goal.id)!;
          if (goal.parent_goal_id) {
            const parent = goalMap.get(goal.parent_goal_id);
            if (parent) {
              if (!parent.children) parent.children = [];
              parent.children.push(goalInMap);
            }
          } else {
            topLevel.push(goalInMap);
          }
        });

        setGoals(goalsData);
        setTopLevelGoals(topLevel);
        if (topLevel.length > 0 && !selectedGoal) {
          setSelectedGoal(topLevel[0]);
        }
      }
    } catch (err) {
      console.error("Error fetching goals:", err);
      toast.error("Failed to load strategic goals");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "from-blue-600 to-blue-800 border-blue-500";
      case "achieved":
        return "from-green-600 to-green-800 border-green-500";
      case "on_hold":
        return "from-orange-600 to-orange-800 border-orange-500";
      case "abandoned":
        return "from-red-600 to-red-800 border-red-500";
      default:
        return "from-zinc-600 to-zinc-800 border-zinc-500";
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
    if (progress >= 25) return "bg-orange-600";
    return "bg-red-600";
  };

  const getObjectiveColor = (goalId: string) => {
    const index = topLevelGoals.findIndex((g) => g.id === goalId);
    const colors = [
      "from-blue-600 to-blue-800 border-blue-500",
      "from-green-600 to-green-800 border-green-500",
      "from-orange-600 to-orange-800 border-orange-500",
      "from-red-600 to-red-800 border-red-500",
      "from-purple-600 to-purple-800 border-purple-500",
      "from-pink-600 to-pink-800 border-pink-500",
      "from-cyan-600 to-cyan-800 border-cyan-500",
    ];
    return colors[index >= 0 ? index : 0];
  };

  const getObjectiveIcon = (goalId: string) => {
    const index = topLevelGoals.findIndex((g) => g.id === goalId);
    const icons = [
      <IconTrendingUp key="icon" size={28} />,
      <IconBulb key="icon" size={28} />,
      <IconTools key="icon" size={28} />,
      <IconBroadcast key="icon" size={28} />,
      <IconUsers key="icon" size={28} />,
      <IconShield key="icon" size={28} />,
      <IconSettings key="icon" size={28} />,
    ];
    return icons[index >= 0 ? index : 0];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-zinc-400">Loading strategy...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-16">
          <h1 className="text-5xl font-bold text-white mb-2">Business Strategy</h1>
          <p className="text-zinc-400 text-lg">Strategic objectives & goals</p>
        </div>

        {/* Bubble Cards Section */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-8">Strategic Objectives</h2>
          <div className="flex flex-wrap gap-6 justify-start">
            {topLevelGoals.map((goal) => (
              <button
                key={goal.id}
                onClick={() => setSelectedGoal(goal)}
                className={`
                  relative w-32 h-32 rounded-full flex flex-col items-center justify-center
                  bg-gradient-to-br ${getObjectiveColor(goal.id)}
                  border-2 shadow-lg hover:shadow-2xl
                  transition-all duration-300 transform hover:scale-110
                  ${selectedGoal?.id === goal.id ? "ring-4 ring-cyan-400" : ""}
                  group
                `}
              >
                <div className="text-center px-4 z-10">
                  <div className="text-white mb-2">
                    {getObjectiveIcon(goal.id)}
                  </div>
                  <p className="text-sm font-bold text-white line-clamp-2 group-hover:text-cyan-100">
                    {goal.title}
                  </p>
                </div>
                
                {/* Progress Ring */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                    {/* Background circle */}
                    <circle
                      cx="60"
                      cy="60"
                      r="54"
                      fill="none"
                      stroke="rgba(255,255,255,0.1)"
                      strokeWidth="2"
                    />
                    {/* Progress circle */}
                    <circle
                      cx="60"
                      cy="60"
                      r="54"
                      fill="none"
                      stroke="rgba(34,197,94,0.5)"
                      strokeWidth="2"
                      strokeDasharray={`${(goal.progress / 100) * 339.29} 339.29`}
                    />
                  </svg>
                </div>

                {/* Progress text */}
                <div className="absolute bottom-2 text-xs font-bold text-white opacity-70">
                  {goal.progress}%
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Sub-Goals Display */}
        {selectedGoal && (
          <div className="space-y-6">
            {/* Objective Summary Card - One Liner */}
            <div className="bg-zinc-800 border border-zinc-700 rounded p-2 w-full">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${getObjectiveColor(selectedGoal.id)} flex-shrink-0`}></div>
                  <h2 className="text-sm font-bold text-white">{selectedGoal.title}</h2>
                </div>

                <Chip
                  variant="flat"
                  className={getStatusBadgeColor(selectedGoal.status)}
                  size="sm"
                >
                  {selectedGoal.status.replace("_", " ")}
                </Chip>

                {selectedGoal.description && (
                  <p className="text-zinc-400 text-xs flex-1">{selectedGoal.description}</p>
                )}

                {/* Progress Bar */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-zinc-500 whitespace-nowrap">Progress</span>
                  <div className="w-20 bg-zinc-700 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-1.5 rounded-full transition-all ${getProgressColor(selectedGoal.progress)}`}
                      style={{ width: `${selectedGoal.progress}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-bold text-cyan-400 whitespace-nowrap">{selectedGoal.progress}%</span>
                </div>
              </div>
            </div>

            {/* Sub-Goals Bubbles */}
            {selectedGoal.children && selectedGoal.children.length > 0 && (
              <div>
                <h3 className="text-2xl font-bold text-white mb-8">Sub-Goals</h3>
                <div className="flex flex-wrap gap-8">
                  {selectedGoal.children.map((subGoal) => (
                    <div
                      key={subGoal.id}
                      className={`
                        relative w-40 h-28 rounded-lg flex flex-col items-center justify-center
                        bg-gradient-to-br ${getObjectiveColor(selectedGoal.id)}
                        border-2 shadow-lg hover:shadow-2xl
                        transition-all duration-300 transform hover:scale-110
                        group p-3
                      `}
                    >
                      <div className="text-center z-10 flex-1 flex items-center">
                        <p className="text-xs font-bold text-white line-clamp-3 group-hover:text-cyan-100">
                          {subGoal.title}
                        </p>
                      </div>

                      {/* Progress text */}
                      <div className="text-sm font-bold text-white opacity-70">
                        {subGoal.progress}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
