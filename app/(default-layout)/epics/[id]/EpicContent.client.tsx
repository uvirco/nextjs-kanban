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
        {/* Subtasks moved to green zone in page.tsx */}
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
