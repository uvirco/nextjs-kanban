"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import dynamic from "next/dynamic";

const EChartsReact = dynamic(() => import("echarts-for-react"), {
  ssr: false,
});

interface StrategicGoal {
  id: string;
  title: string;
  description: string | null;
  status: "active" | "achieved" | "on_hold" | "abandoned";
  progress: number;
  parent_goal_id: string | null;
  children?: StrategicGoal[];
}

export default function GoalsTreePage() {
  const [goals, setGoals] = useState<StrategicGoal[]>([]);
  const [topLevelGoals, setTopLevelGoals] = useState<StrategicGoal[]>([]);
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
        return "#2563eb";
      case "achieved":
        return "#16a34a";
      case "on_hold":
        return "#ea580c";
      case "abandoned":
        return "#dc2626";
      default:
        return "#6b7280";
    }
  };

  const getObjectiveColor = (goalId: string) => {
    const index = topLevelGoals.findIndex((g) => g.id === goalId);
    const colors = [
      "#2563eb", // blue
      "#16a34a", // green
      "#ea580c", // orange
      "#dc2626", // red
      "#a855f7", // purple
      "#ec4899", // pink
      "#06b6d4", // cyan
    ];
    return colors[index >= 0 ? index : 0];
  };

  const buildTreeData = (goal: StrategicGoal, parentColor?: string): any => {
    const color = parentColor || getObjectiveColor(goal.id);
    return {
      name: goal.title,
      value: goal.progress,
      symbolStyle: {
        color: color,
      },
      itemStyle: {
        color: color,
        borderColor: color,
        borderWidth: 2,
      },
      label: {
        backgroundColor: color,
        color: "#ffffff",
        borderColor: color,
        borderWidth: 1,
        borderRadius: 4,
        padding: [4, 8],
        fontSize: 11,
      },
      children:
        goal.children?.map((child) => buildTreeData(child, color)) || [],
    };
  };

  const chartOption = {
    tooltip: {
      trigger: "item",
      triggerOn: "mousemove",
    },
    series: [
      {
        type: "tree",
        data: [
          {
            name: "Strategic Objectives",
            children: topLevelGoals.map((goal) => ({
              ...buildTreeData(goal),
              collapsed: true,
            })),
            itemStyle: {
              color: "#ffffff",
            },
            label: {
              backgroundColor: "#2563eb",
              color: "#ffffff",
              fontSize: 14,
              fontWeight: "bold",
            },
          },
        ],
        top: "5%",
        left: "7%",
        bottom: "5%",
        right: "20%",
        symbolSize: [85, 55],
        symbol: "rect",
        symbolKeepAspect: false,
        orient: "RL",
        expandAndCollapse: true,
        animationDuration: 550,
        animationDurationUpdate: 750,
        label: {
          borderRadius: 4,
          padding: [3, 5],
          fontSize: 9,
          color: "#ffffff",
          formatter: (params: any) => {
            const title = params.name;
            // Extract just the objective/goal number and name
            const match = title.match(/(?:Objective|Goal) [\d.]+: (.+)/);
            if (match) {
              return (
                match[1].substring(0, 15) + (match[1].length > 15 ? "..." : "")
              );
            }
            return title.substring(0, 18) + (title.length > 18 ? "..." : "");
          },
        },
        leaves: {
          label: {
            position: "right",
            padding: [3, 5],
            fontSize: 9,
          },
        },
        emphasis: {
          focus: "descendant",
          label: {
            fontSize: 11,
            fontWeight: "bold",
          },
        },
        edgeForkPosition: "50%",
        lineStyle: {
          color: "#cccccc",
          width: 1,
          curveness: 0.7,
        },
        itemStyle: {
          borderWidth: 2,
        },
      },
    ],
  };

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-zinc-950">
        <div className="text-white">Loading strategic goals tree...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-zinc-950 flex flex-col">
      <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Strategic Goals Hierarchy
          </h1>
          <p className="text-zinc-400">
            Interactive tree view of objectives and sub-goals
          </p>
        </div>
        <a
          href="/strategy2"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition-colors"
        >
          Strategy View
        </a>
      </div>
      <div className="flex-1 overflow-hidden">
        {topLevelGoals.length > 0 ? (
          <EChartsReact
            option={chartOption}
            style={{ height: "100%" }}
            notMerge={true}
            lazyUpdate={true}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-400">
            No strategic goals found
          </div>
        )}
      </div>
    </div>
  );
}
