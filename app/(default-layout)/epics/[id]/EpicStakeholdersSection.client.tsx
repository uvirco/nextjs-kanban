"use client";
import React, { useState, useEffect } from "react";
import {
  IconChevronDown,
  IconChevronRight,
  IconUsers,
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
    <div className={`${isNested ? "ml-4" : ""} bg-zinc-900 border border-zinc-800 rounded-lg`}>
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="flex items-center gap-2 w-full text-left hover:bg-zinc-800/50 p-3 rounded-t-lg"
      >
        {isCollapsed ? (
          <IconChevronRight size={20} className="text-zinc-400" />
        ) : (
          <IconChevronDown size={20} className="text-zinc-400" />
        )}
        <span className="text-zinc-400">{icon}</span>
        <h3 className="text-sm font-semibold text-white">{title}</h3>
      </button>
      {!isCollapsed && <div className="p-3 pt-0">{children}</div>}
    </div>
  );
}

interface EpicStakeholdersSectionProps {
  epic: any;
  params: { id: string };
}

export default function EpicStakeholdersSection({
  epic,
  params,
}: EpicStakeholdersSectionProps) {
  return (
    <CollapsibleSection
      title="Stakeholders"
      icon="👥"
      defaultCollapsed={true}
      storageKey={`epic:${params.id}:section:stakeholders`}
    >
      <div className="space-y-3">
        {epic.stakeholders.length > 0 ? (
          epic.stakeholders.map((stakeholder: any) => (
            <div
              key={stakeholder.id}
              className="p-3 bg-zinc-800 rounded-lg"
            >
              <div className="font-medium text-white">
                {stakeholder.user?.name || stakeholder.user?.email}
              </div>
              <div className="text-sm text-zinc-400 mt-1">
                {stakeholder.stakeholderType}
              </div>
              <div className="text-xs text-zinc-500 mt-1">
                Notify: {stakeholder.notificationPreference}
              </div>
            </div>
          ))
        ) : (
          <div className="text-zinc-500 text-center py-4 text-xs">
            No stakeholders assigned
          </div>
        )}
      </div>
    </CollapsibleSection>
  );
}