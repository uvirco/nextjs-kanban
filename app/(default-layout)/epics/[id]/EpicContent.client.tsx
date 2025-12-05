"use client";
import { useState, useEffect } from "react";
import {
  IconChevronDown,
  IconChevronRight,
  IconAlertTriangle,
} from "@tabler/icons-react";

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
  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Left widget column (quarter) */}
      <div className="col-span-3">
        {/* reserved for left widgets (timeline, quick actions, etc) */}
      </div>

      {/* Center area (1/2 width) */}
      <div className="col-span-6">
        <CollapsibleSection
          title="Subtasks"
          icon="📋"
          defaultCollapsed={true}
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

                  {subtask.assignedUser && (
                    <span className="text-zinc-400 text-sm">
                      {subtask.assignedUser.name}
                    </span>
                  )}
                </div>
              ))
            ) : (
              <div className="text-zinc-500 text-center py-8">
                No subtasks yet
              </div>
            )}

            {/* Files used to be rendered inside the Subtasks section — moved to its own collapsible below */}
          </div>
        </CollapsibleSection>
      </div>

      {/* Right Widget Column (Stakeholders / Team Members) */}
      <div className="col-span-3">
        <div className="space-y-4">
          {/* Team Members moved to page.tsx blue block */}
        </div>
      </div>
    </div>
  );
}
