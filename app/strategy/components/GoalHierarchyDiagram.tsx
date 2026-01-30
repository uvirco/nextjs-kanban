"use client";
import React, { useCallback, useMemo } from "react";
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";
import { StrategicGoal } from "@/types/types";

interface GoalHierarchyDiagramProps {
  goals: StrategicGoal[];
  onSelectGoal?: (goal: StrategicGoal) => void;
}

// Custom node component for goal nodes
const GoalNode = ({ data }: any) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-blue-600 hover:bg-blue-700";
      case "achieved":
        return "bg-green-600 hover:bg-green-700";
      case "on_hold":
        return "bg-orange-600 hover:bg-orange-700";
      case "abandoned":
        return "bg-red-600 hover:bg-red-700";
      default:
        return "bg-zinc-600 hover:bg-zinc-700";
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (data.onSelectGoal && data.goal) {
      data.onSelectGoal(data.goal);
    }
  };

  return (
    <button
      onClick={handleClick}
      onDoubleClick={(e) => e.stopPropagation()}
      className={`px-4 py-3 rounded-lg border-2 border-white shadow-lg cursor-pointer transition-colors ${getStatusColor(
        data.status,
      )} text-white font-semibold text-center max-w-xs w-full hover:scale-105 transform`}
      style={{ outline: "none" }}
    >
      <div className="text-sm font-bold mb-1">{data.label}</div>
      <div className="text-xs opacity-90">Progress: {data.progress}%</div>
      {data.isParent && (
        <div className="text-xs opacity-75 mt-1 bg-black/20 px-2 py-1 rounded">
          {data.childCount} sub-goal{data.childCount !== 1 ? "s" : ""}
        </div>
      )}
      {data.projectCount > 0 && (
        <div className="text-xs opacity-75 mt-1 bg-black/20 px-2 py-1 rounded">
          {data.projectCount} project{data.projectCount !== 1 ? "s" : ""}
        </div>
      )}
    </button>
  );
};

export default function GoalHierarchyDiagram({
  goals,
  onSelectGoal,
}: GoalHierarchyDiagramProps) {
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    const positionMap = new Map<string, { x: number; y: number }>();
    let nodeId = 0;

    // First pass: identify parent goals and calculate positions
    const parentGoals = goals.filter((g) => !g.parent_goal_id);
    const goalMap = new Map(goals.map((g) => [g.id, g]));

    // Calculate positions using hierarchical layout
    parentGoals.forEach((parentGoal, parentIndex) => {
      const childGoals = goals.filter(
        (g) => g.parent_goal_id === parentGoal.id,
      );
      const xPos = parentIndex * 400;
      const yPos = 0;

      // Parent position
      positionMap.set(parentGoal.id, { x: xPos, y: yPos });

      // Children positions
      if (childGoals.length > 0) {
        const childSpacing = 250;
        const totalWidth = childGoals.length * childSpacing;
        const startX = xPos - totalWidth / 2 + childSpacing / 2;

        childGoals.forEach((child, childIndex) => {
          const childX = startX + childIndex * childSpacing;
          const childY = 200;
          positionMap.set(child.id, { x: childX, y: childY });
        });
      }
    });

    // Create nodes
    goals.forEach((goal) => {
      const childGoals = goals.filter((g) => g.parent_goal_id === goal.id);
      const position = positionMap.get(goal.id) || { x: 0, y: 0 };

      nodes.push({
        id: goal.id,
        data: {
          label: goal.title,
          status: goal.status,
          progress: goal.progress,
          isParent: childGoals.length > 0,
          childCount: childGoals.length,
          projectCount: goal.linkedTasksCount || 0,
          goal: goal,
          onSelectGoal: onSelectGoal,
        },
        position,
        type: "default",
      });
    });

    // Create edges (parent to child relationships)
    goals.forEach((goal) => {
      if (goal.parent_goal_id) {
        edges.push({
          id: `edge-${goal.parent_goal_id}-${goal.id}`,
          source: goal.parent_goal_id,
          target: goal.id,
          markerEnd: { type: MarkerType.ArrowClosed, color: "#60a5fa" },
          style: { stroke: "#60a5fa", strokeWidth: 2 },
          animated: true,
          label: "supports",
        });
      }
    });

    return { nodes, edges };
  }, [goals]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes when component mounts with custom styling
  React.useEffect(() => {
    setNodes(
      initialNodes.map((node) => ({
        ...node,
        type: "default",
      })),
    );
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  return (
    <div
      style={{
        width: "100%",
        height: "600px",
        backgroundColor: "#18181b",
        borderRadius: "0.5rem",
        border: "1px solid #3f3f46",
      }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
      >
        <Background color="#52525b" gap={16} />
        <Controls />
      </ReactFlow>
    </div>
  );
}
