"use client";
import { useState, useEffect } from "react";
import {
  IconChevronDown,
  IconChevronRight,
} from "@tabler/icons-react";
import { EpicTasksGanttTimeline } from "@/ui/EpicTasksGanttTimeline";

interface Subtask {
  id: string;
  title: string;
  createdAt: string;
  columnId: string;
  column?: { id: string; title: string } | null;
}

function CollapsibleSection({
  title,
  icon,
  defaultCollapsed = true,
  children,
  isNested = false,
  storageKey,
}: {
  title: string;
  icon: string;
  defaultCollapsed?: boolean;
  children: React.ReactNode;
  isNested?: boolean;
  storageKey?: string;
}) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  useEffect(() => {
    try {
      if (!storageKey) return;
      if (typeof window === "undefined") return;
      const raw = localStorage.getItem(storageKey);
      if (raw === null) return;
      const parsed = raw === "true";
      setIsCollapsed(parsed);
    } catch (e) {
      // ignore
    }
  }, [storageKey]);

  useEffect(() => {
    try {
      if (!storageKey) return;
      if (typeof window === "undefined") return;
      localStorage.setItem(storageKey, String(isCollapsed));
    } catch (e) {
      // ignore
    }
  }, [isCollapsed, storageKey]);

  return (
    <div
      className={`bg-zinc-900 border border-zinc-800 rounded-lg p-6 ${isNested ? "mt-4" : "mt-6"}`}
    >
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="flex items-center gap-2 w-full text-left hover:bg-zinc-800/50 -m-2 p-2 rounded transition-colors"
      >
        {isCollapsed ? (
          <IconChevronRight size={20} className="text-zinc-400" />
        ) : (
          <IconChevronDown size={20} className="text-zinc-400" />
        )}
        <h2
          className={`${isNested ? "text-lg" : "text-xl"} font-bold text-white`}
        >
          {icon} {title}
        </h2>
      </button>
      {!isCollapsed && <div className="mt-4">{children}</div>}
    </div>
  );
}

interface EpicContentProps {
  epic: any;
  raciUsers: any[];
  params: { id: string };
}

export default function EpicContent({
  epic,
  raciUsers,
  params,
}: EpicContentProps) {
  const subtasks: Subtask[] = epic.subtasks || [];
  
  return (
    <div className="space-y-6">
      {/* Task Flow Timeline - Full Width */}
      <EpicTasksGanttTimeline epicId={params.id} subtasks={subtasks} />
    </div>
  );
}
