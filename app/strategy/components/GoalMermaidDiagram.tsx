'use client';

import { useEffect, useState } from 'react';
import mermaid from 'mermaid';
import { StrategicGoal } from '@/types/types';

interface GoalMermaidDiagramProps {
  goals: StrategicGoal[];
}

export default function GoalMermaidDiagram({ goals }: GoalMermaidDiagramProps) {
  const [diagramCode, setDiagramCode] = useState<string>('');

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: 'dark',
      securityLevel: 'loose',
      flowchart: {
        useMaxWidth: true,
        curve: 'linear',
        padding: '20',
      },
    });
  }, []);

  useEffect(() => {
    const code = buildMermaidCode();
    setDiagramCode(code);
    mermaid.contentLoaded();
  }, [goals]);

  // Build mermaid diagram code
  const buildMermaidCode = () => {
    const topLevelGoals = goals.filter((g) => !g.parent_goal_id);
    const childGoals = goals.filter((g) => g.parent_goal_id);

    let code = 'graph TD\n';

    // Add top-level objectives
    topLevelGoals.forEach((goal) => {
      const color = getStatusColor(goal.status);
      const nodeId = 'O' + goal.id.substring(0, 8).replace(/-/g, '');
      const title = goal.title.substring(0, 22) + (goal.title.length > 22 ? '...' : '');
      code += `    ${nodeId}["<b>${title}</b><br/>${goal.progress}%"]:::${color}\n`;
    });

    code += '\n';

    // Add child goals and connections
    childGoals.forEach((goal) => {
      const parentGoal = goals.find((g) => g.id === goal.parent_goal_id);
      if (parentGoal) {
        const parentNodeId = 'O' + parentGoal.id.substring(0, 8).replace(/-/g, '');
        const childNodeId = 'G' + goal.id.substring(0, 8).replace(/-/g, '');
        const color = getStatusColor(goal.status);
        const title = goal.title.substring(0, 20) + (goal.title.length > 20 ? '...' : '');

        code += `    ${childNodeId}["${title}<br/>${goal.progress}%"]:::${color}\n`;
        code += `    ${parentNodeId} --> ${childNodeId}\n`;
      }
    });

    // Add styling classes
    code += `\n    classDef active fill:#3b82f6,stroke:#1e40af,stroke-width:2px,color:#fff,font-size:12px\n`;
    code += `    classDef achieved fill:#10b981,stroke:#047857,stroke-width:2px,color:#fff,font-size:12px\n`;
    code += `    classDef on_hold fill:#f59e0b,stroke:#d97706,stroke-width:2px,color:#fff,font-size:12px\n`;
    code += `    classDef abandoned fill:#ef4444,stroke:#dc2626,stroke-width:2px,color:#fff,font-size:12px\n`;

    return code;
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'achieved':
        return 'achieved';
      case 'on_hold':
        return 'on_hold';
      case 'abandoned':
        return 'abandoned';
      default:
        return 'active';
    }
  };

  return (
    <div className="w-full bg-zinc-900 rounded-lg p-6 border border-zinc-800 overflow-x-auto min-h-96">
      <div className="mermaid justify-center flex">
        {diagramCode}
      </div>
    </div>
  );
}
