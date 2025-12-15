"use client";
import React, { useState, useEffect } from "react";
import { IconChevronDown, IconChevronRight } from "@tabler/icons-react";
import EpicAddChecklist from "./EpicAddChecklist";
import ChecklistTitleForm from "@/ui/TaskDetail/TaskDetailView/Checklist/ChecklistTitleForm.client";
import DeleteChecklistButton from "@/ui/TaskDetail/TaskDetailView/Checklist/DeleteChecklistButton.client";
import ChecklistItemForm from "@/ui/TaskDetail/TaskDetailView/Checklist/ChecklistItemForm.client";
import ChecklistCheckboxGroup from "@/ui/TaskDetail/TaskDetailView/Checklist/ChecklistCheckboxGroup.client";

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
      className={`${isNested ? "ml-4" : ""} bg-zinc-900 border border-zinc-800 rounded-lg`}
    >
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

interface EpicChecklistsSectionProps {
  epic: any;
  params: { id: string };
}

export default function EpicChecklistsSection({
  epic,
  params,
}: EpicChecklistsSectionProps) {
  // Use only the first checklist, or show empty state if none exist
  const checklist = epic.checklists?.[0];

  return (
    <CollapsibleSection
      title="Checklist"
      icon="✅"
      defaultCollapsed={true}
      storageKey={`epic:${params.id}:section:checklist`}
    >
      <div className="space-y-4">
        {checklist ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <ChecklistTitleForm
                checklistTitle={checklist.title}
                checklistId={checklist.id}
                taskId={params.id}
              />
              <DeleteChecklistButton
                checklistId={checklist.id}
                taskId={params.id}
              />
            </div>

            {/* Progress bar */}
            {checklist.items && checklist.items.length > 0 && (
              <div className="w-full bg-zinc-700 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${
                      (checklist.items.filter((item: any) => item.isChecked)
                        .length /
                        checklist.items.length) *
                      100
                    }%`,
                  }}
                ></div>
              </div>
            )}

            {/* Checklist items */}
            <ChecklistCheckboxGroup
              taskId={params.id}
              checkedItemIds={
                checklist.items
                  ?.filter((item: any) => item.isChecked)
                  .map((item: any) => item.id) || []
              }
              checklist={checklist}
            />

            {/* Add new item */}
            <ChecklistItemForm checklistId={checklist.id} taskId={params.id} />
          </div>
        ) : (
          <div className="py-4"></div>
        )}

        {/* Only show add checklist if no checklist exists */}
        {!checklist && <EpicAddChecklist epicId={params.id} />}
      </div>
    </CollapsibleSection>
  );
}
