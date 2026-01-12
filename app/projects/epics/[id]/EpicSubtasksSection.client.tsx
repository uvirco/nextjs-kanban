"use client";
import { useState, useEffect } from "react";
import {
  IconAlertTriangle,
  IconChevronDown,
  IconChevronRight,
} from "@tabler/icons-react";
import EpicAddTask from "./EpicAddTask";

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

  // After mount, hydrate collapse state from localStorage if storageKey was provided.
  // This runs only on client (useEffect) so avoids SSR hydration mismatch.
  useEffect(() => {
    try {
      if (!storageKey) return;
      if (typeof window === "undefined") return;
      const raw = localStorage.getItem(storageKey);
      if (raw === null) return; // no saved preference
      const parsed = raw === "true";
      setIsCollapsed(parsed);
    } catch (e) {
      // ignore
    }
  }, [storageKey]);

  // Persist collapse state to localStorage when changed
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
    <div className={`${isNested ? "ml-4" : ""}`}>
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="flex items-center gap-2 w-full text-left p-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
      >
        <span className="text-lg">{icon}</span>
        <span className="text-white font-medium flex-1">{title}</span>
        {isCollapsed ? (
          <IconChevronRight size={16} className="text-zinc-400" />
        ) : (
          <IconChevronDown size={16} className="text-zinc-400" />
        )}
      </button>

      {!isCollapsed && (
        <div className="mt-2 p-4 bg-zinc-900 border border-zinc-800 rounded-lg">
          {children}
        </div>
      )}
    </div>
  );
}

interface EpicSubtasksSectionProps {
  epic: any;
  params: { id: string };
  raciUsers: any[];
}

export default function EpicSubtasksSection({
  epic,
  params,
  raciUsers,
}: EpicSubtasksSectionProps) {
  return (
    <CollapsibleSection
      title="Subtasks"
      icon="📋"
      defaultCollapsed={false}
      storageKey={`epic:${params.id}:section:subtasks`}
    >
      <div className="space-y-2">
        {epic.subtasks.length > 0 ? (
          epic.subtasks.map((subtask: any) => (
            <div
              key={subtask.id}
              className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={subtask.status === "DONE"}
                  readOnly
                  className="w-4 h-4"
                />
                <span
                  className={`${subtask.status === "DONE" ? "line-through text-zinc-500" : "text-white"}`}
                >
                  {subtask.title}
                </span>
                {subtask.isBlocked && (
                  <span className="text-red-400 text-xs flex items-center gap-1">
                    <IconAlertTriangle size={14} />
                    Blocked
                  </span>
                )}
              </div>

              {subtask.assignments && subtask.assignments.length > 0 && (
                <span className="text-zinc-400 text-sm">
                  {subtask.assignments[0].user.name}
                </span>
              )}
            </div>
          ))
        ) : (
          <div className="text-zinc-500 text-center py-8">No subtasks yet</div>
        )}

        {/* Add new task */}
        <EpicAddTask epicId={params.id} availableUsers={raciUsers} />

        {/* Files used to be rendered inside the Subtasks section — moved to its own collapsible below */}
      </div>
    </CollapsibleSection>
  );
}
