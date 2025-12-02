"use client";
import { useState } from "react";
import { IconChevronDown, IconChevronRight } from "@tabler/icons-react";
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
  const [expandedSections, setExpandedSections] = useState({
    CRITICAL: false,
    HIGH: false,
    MEDIUM: false,
    LOW: false,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const critical = epics.filter(e => getPriorityLevel(e) === "CRITICAL");
  const high = epics.filter(e => getPriorityLevel(e) === "HIGH");
  const medium = epics.filter(e => getPriorityLevel(e) === "MEDIUM");
  const low = epics.filter(e => getPriorityLevel(e) === "LOW");

  const PrioritySection = ({ 
    title, 
    count, 
    color, 
    epics: sectionEpics, 
    sectionKey 
  }: {
    title: string;
    count: number;
    color: string;
    epics: Epic[];
    sectionKey: keyof typeof expandedSections;
  }) => {
    if (count === 0) return null;

    return (
      <div>
        <button
          onClick={() => toggleSection(sectionKey)}
          className="flex items-center gap-2 mb-4 w-full text-left hover:bg-zinc-800/50 p-2 rounded-lg transition-colors"
        >
          {expandedSections[sectionKey] ? (
            <IconChevronDown size={20} className="text-zinc-400" />
          ) : (
            <IconChevronRight size={20} className="text-zinc-400" />
          )}
          <div className={`w-1 h-6 ${color} rounded`}></div>
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <span className="text-zinc-400">({count})</span>
        </button>
        {expandedSections[sectionKey] && (
          <div className="space-y-3 ml-8">
            {sectionEpics.map((epic) => (
              <EpicCard key={epic.id} epic={epic} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <PrioritySection
        title="CRITICAL PRIORITY"
        count={critical.length}
        color="bg-red-500"
        epics={critical}
        sectionKey="CRITICAL"
      />

      <PrioritySection
        title="HIGH PRIORITY"
        count={high.length}
        color="bg-orange-500"
        epics={high}
        sectionKey="HIGH"
      />

      <PrioritySection
        title="MEDIUM PRIORITY"
        count={medium.length}
        color="bg-yellow-500"
        epics={medium}
        sectionKey="MEDIUM"
      />

      <PrioritySection
        title="LOW PRIORITY / BACKLOG"
        count={low.length}
        color="bg-zinc-500"
        epics={low}
        sectionKey="LOW"
      />

      {epics.length === 0 && (
        <div className="text-center py-12 text-zinc-400">
          No epics found. Create your first epic to get started.
        </div>
      )}
    </div>
  );
}
