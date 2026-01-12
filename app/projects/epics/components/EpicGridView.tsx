"use client";
import EpicCard from "./EpicCard";

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
  raciAssignments: any[];
  stakeholders: any[];
}

interface EpicGridViewProps {
  epics: Epic[];
}

export default function EpicGridView({ epics }: EpicGridViewProps) {
  if (epics.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-zinc-400">
        <p className="text-lg mb-2">No epics found</p>
        <p className="text-sm">Create your first epic to get started</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {epics.map((epic) => (
        <EpicCard key={epic.id} epic={epic} />
      ))}
    </div>
  );
}
