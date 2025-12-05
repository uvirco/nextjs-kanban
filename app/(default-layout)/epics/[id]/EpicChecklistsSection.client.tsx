"use client";
import React, { useState, useEffect } from "react";
import {
  IconChevronDown,
  IconChevronRight,
} from "@tabler/icons-react";
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

interface EpicChecklistsSectionProps {
  epic: any;
  params: { id: string };
}

export default function EpicChecklistsSection({
  epic,
  params,
}: EpicChecklistsSectionProps) {
  return (
    <CollapsibleSection
      title="Checklists"
      icon="✅"
      defaultCollapsed={true}
      storageKey={`epic:${params.id}:section:checklists`}
    >
      <div className="space-y-4">
        {epic.checklists.length > 0 ? (
          epic.checklists.map((checklist: any) => {
            const totalItems = checklist.items?.length || 0;
            const completedItems =
              checklist.items?.filter((item: any) => item.isChecked)
                .length || 0;
            const completionPercentage =
              totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

            return (
              <CollapsibleSection
                key={checklist.id}
                title={`${checklist.title || "Checklist"} (${completedItems}/${totalItems})`}
                icon="📋"
                defaultCollapsed={true}
                isNested={true}
                storageKey={`epic:${params.id}:checklist:${checklist.id}`}
              >
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
                  <div className="w-full bg-zinc-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${completionPercentage}%` }}
                    ></div>
                  </div>

                  {/* Checklist items */}
                  <ChecklistCheckboxGroup
                    taskId={params.id}
                    checkedItemIds={checklist.items
                      .filter((item: any) => item.isChecked)
                      .map((item: any) => item.id)}
                    checklist={checklist}
                  />

                  {/* Add new item */}
                  <ChecklistItemForm
                    checklistId={checklist.id}
                    taskId={params.id}
                  />
                </div>
              </CollapsibleSection>
            );
          })
        ) : (
          <div className="text-zinc-500 text-center py-4 text-xs">
            No checklists yet
          </div>
        )}

        {/* Add Checklist */}
        <EpicAddChecklist epicId={params.id} />
      </div>
    </CollapsibleSection>
  );
}