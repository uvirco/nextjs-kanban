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

export default function Strategy2Page() {
  const [goals, setGoals] = useState<StrategicGoal[]>([]);
  const [topLevelGoals, setTopLevelGoals] = useState<StrategicGoal[]>([]);
  const [selectedGoal, setSelectedGoal] = useState<StrategicGoal | null>(null);
  const [selectedSubGoal, setSelectedSubGoal] = useState<StrategicGoal | null>(null);
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
        goalsData.forEach((goal: StrategicGoal) => {
          goalMap.set(goal.id, { ...goal, children: [] });
        });

        const topLevel: StrategicGoal[] = [];
        goalsData.forEach((goal: StrategicGoal) => {
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

  const getObjectiveShortName = (goalId: string) => {
    const index = topLevelGoals.findIndex((g) => g.id === goalId);
    const shortNames = [
      "Financial Growth",
      "New Products",
      "Support Products",
      "Marketing & Sales",
      "High-Perf Team",
      "Compliance",
      "Operations",
    ];
    return shortNames[index >= 0 ? index : 0];
  };

  const getGoalNumber = (title: string) => {
    const match = title.match(/Goal (\d+\.\d+):/);
    return match ? match[1] : "";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-zinc-400">Loading strategy...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex flex-col">
      {/* Header Bar */}
      <div className="bg-gradient-to-r from-zinc-900 to-zinc-800 border-b border-zinc-700 px-8 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Business Strategy</h1>
          <p className="text-zinc-400 text-xs">Strategic objectives & goals</p>
        </div>
        <a href="/goals-tree" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition-colors">
          Tree View
        </a>
      </div>

      {/* Main Content */}
      <div className="flex flex-1">
        {/* Left Sidebar */}
        <div className="w-auto bg-zinc-900 border-r border-zinc-800 p-2 pt-8 flex flex-row gap-2 overflow-x-auto items-start">
          {/* Strategic Objectives Column */}
          <div className="flex flex-col gap-6 items-center flex-shrink-0">
            {topLevelGoals.map((goal) => (
              <div key={goal.id} className="relative group">
                <button
                  onClick={() => {
                    setSelectedGoal(goal);
                    setSelectedSubGoal(null);
                  }}
                  className={`
                relative w-16 h-16 rounded-full flex items-center justify-center
                bg-gradient-to-br ${getObjectiveColor(goal.id)}
                border-2 shadow-lg hover:shadow-2xl
                transition-all duration-300 hover:scale-110
                ${selectedGoal?.id === goal.id ? "ring-4 ring-cyan-400" : ""}
                group flex-shrink-0
              `}
                >
                  <div className="text-white z-10">
                    {getObjectiveIcon(goal.id)}
                  </div>

                  {/* Progress Ring */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg
                      className="w-16 h-16 transform -rotate-90"
                      viewBox="0 0 120 120"
                    >
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
                  <div className="absolute bottom-0.5 text-xs font-bold text-white opacity-70">
                    {goal.progress}%
                  </div>
                </button>
              </div>
            ))}
          </div>

          {/* Divider */}
          {selectedGoal?.children && selectedGoal.children.length > 0 && (
            <div className="w-px h-96 bg-zinc-700 flex-shrink-0"></div>
          )}

          {/* Sub-Goals Column */}
          {selectedGoal?.children && selectedGoal.children.length > 0 && (
            <div className="flex flex-col gap-8 items-center flex-shrink-0 pt-4">
              {selectedGoal.children.map((subGoal, index) => (
                <div key={subGoal.id} className="flex flex-col items-center gap-2 group">
                  <button
                    onClick={() => setSelectedSubGoal(subGoal)}
                    className={`
                    relative w-10 h-10 rounded-lg flex items-center justify-center
                    bg-gradient-to-br ${getObjectiveColor(selectedGoal.id)}
                    border-2 shadow-lg hover:shadow-2xl
                    transition-all duration-300 hover:scale-110
                    group flex-shrink-0
                    ${selectedSubGoal?.id === subGoal.id ? 'ring-2 ring-white scale-110' : ''}
                  `}
                  >
                    <div className="text-white z-10 text-xs font-bold">
                      {getGoalNumber(subGoal.title)}
                    </div>
                  </button>
                  <div className="text-white text-xs font-semibold text-center break-words w-24 leading-tight">
                    {subGoal.title.split(': ').slice(1).join(': ') || subGoal.title}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-4 overflow-y-auto flex flex-col">
          {/* Objective Header */}
          {selectedGoal && (
            <div className={`bg-gradient-to-r ${getObjectiveColor(selectedGoal.id)} rounded-lg p-4 mb-4 border-2 shadow-lg`}>
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <h1 className="text-3xl font-bold text-white mb-2 break-words">
                    {selectedGoal.title}
                  </h1>
                  {selectedGoal.description && (
                    <p className="text-zinc-100 text-sm">
                      {selectedGoal.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                  <Chip
                    variant="flat"
                    className={getStatusBadgeColor(selectedGoal.status)}
                    size="lg"
                  >
                    {selectedGoal.status.replace("_", " ").toUpperCase()}
                  </Chip>
                  <div className="text-white text-center">
                    <div className="text-4xl font-bold">{selectedGoal.progress}%</div>
                    <div className="text-xs text-zinc-100">Complete</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="max-w-6xl mx-auto w-full flex-1">
            {/* Sub-Goals Display */}
            {selectedGoal && selectedSubGoal && (
              <div className={`bg-gradient-to-r ${getObjectiveColor(selectedGoal.id)} rounded-lg p-6 border-2 shadow-lg`}>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 bg-white bg-opacity-20 rounded-lg w-12 h-12 flex items-center justify-center font-bold text-white text-lg">
                    {getGoalNumber(selectedSubGoal.title)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-bold text-white mb-2 break-words">
                      {selectedSubGoal.title.split(': ').slice(1).join(': ') || selectedSubGoal.title}
                    </h2>
                    {selectedSubGoal.description && (
                      <p className="text-zinc-100 text-sm">
                        {selectedSubGoal.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Projects Section */}
            {selectedGoal && selectedSubGoal && (
              <div className="mt-6">
                <h3 className="text-lg font-bold text-white mb-4">Projects</h3>
                <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
                  <p className="text-zinc-400 text-sm">No projects yet</p>
                </div>
              </div>
            )}

            {selectedGoal && !selectedSubGoal && (
              <div className="text-center text-zinc-400 py-2">
                <p className="text-sm">Select a sub-goal from the sidebar to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
