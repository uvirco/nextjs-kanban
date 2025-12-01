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
  metrics: {
    totalTasks: number;
    completedTasks: number;
    blockedTasks: number;
    progress: number;
  };
  owner: any;
}

interface EpicPriorityViewProps {
  epics: Epic[];
}

const getPriorityLevel = (epic: Epic) => {
  const priority = epic.priority?.toUpperCase();
  const businessValue = epic.businessValue?.toUpperCase();
  
  if (priority === "CRITICAL" || businessValue === "CRITICAL") return "CRITICAL";
  if (priority === "HIGH" || businessValue === "HIGH") return "HIGH";
  if (priority === "MEDIUM" || businessValue === "MEDIUM") return "MEDIUM";
  return "LOW";
};

export default function EpicPriorityView({ epics }: EpicPriorityViewProps) {
  const critical = epics.filter(e => getPriorityLevel(e) === "CRITICAL");
  const high = epics.filter(e => getPriorityLevel(e) === "HIGH");
  const medium = epics.filter(e => getPriorityLevel(e) === "MEDIUM");
  const low = epics.filter(e => getPriorityLevel(e) === "LOW");

  return (
    <div className="space-y-6">
      {critical.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-6 bg-red-500 rounded"></div>
            <h2 className="text-xl font-bold text-white"> CRITICAL PRIORITY</h2>
            <span className="text-zinc-400">({critical.length})</span>
          </div>
          <div className="space-y-3">
            {critical.map((epic) => (
              <EpicCard key={epic.id} epic={epic} />
            ))}
          </div>
        </div>
      )}

      {high.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-6 bg-orange-500 rounded"></div>
            <h2 className="text-xl font-bold text-white"> HIGH PRIORITY</h2>
            <span className="text-zinc-400">({high.length})</span>
          </div>
          <div className="space-y-3">
            {high.map((epic) => (
              <EpicCard key={epic.id} epic={epic} />
            ))}
          </div>
        </div>
      )}

      {medium.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-6 bg-yellow-500 rounded"></div>
            <h2 className="text-xl font-bold text-white"> MEDIUM PRIORITY</h2>
            <span className="text-zinc-400">({medium.length})</span>
          </div>
          <div className="space-y-3">
            {medium.map((epic) => (
              <EpicCard key={epic.id} epic={epic} />
            ))}
          </div>
        </div>
      )}

      {low.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-6 bg-zinc-500 rounded"></div>
            <h2 className="text-xl font-bold text-white"> LOW PRIORITY / BACKLOG</h2>
            <span className="text-zinc-400">({low.length})</span>
          </div>
          <div className="space-y-3">
            {low.map((epic) => (
              <EpicCard key={epic.id} epic={epic} />
            ))}
          </div>
        </div>
      )}

      {epics.length === 0 && (
        <div className="text-center py-12 text-zinc-400">
          No epics found. Create your first epic to get started.
        </div>
      )}
    </div>
  );
}
