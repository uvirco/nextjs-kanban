"use client";
import { useState } from "react";
import {
  IconChevronDown,
  IconChevronRight,
  IconAlertTriangle,
} from "@tabler/icons-react";
import EpicTeamMembers from "./EpicTeamMembers";
import RaciMatrixSection from "./RaciMatrixSection";
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
}: {
  title: string;
  icon: string;
  defaultCollapsed?: boolean;
  children: React.ReactNode;
  isNested?: boolean;
}) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

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
    <div className="grid grid-cols-3 gap-6">
      {/* RACI Matrix */}
      <div className="col-span-2">
        <CollapsibleSection
          title="RACI Matrix"
          icon="👥"
          defaultCollapsed={true}
        >
          <RaciMatrixSection raciUsers={raciUsers} />
        </CollapsibleSection>

        {/* Subtasks */}
        <CollapsibleSection title="Subtasks" icon="📋" defaultCollapsed={true}>
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
          </div>
        </CollapsibleSection>

        {/* Checklists */}
        <CollapsibleSection
          title="Checklists"
          icon="✅"
          defaultCollapsed={true}
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
              <div className="text-zinc-500 text-center py-8">
                No checklists yet
              </div>
            )}

            {/* Add Checklist */}
            <EpicAddChecklist epicId={params.id} />
          </div>
        </CollapsibleSection>
      </div>

      {/* Sidebar */}
      <div>
        <CollapsibleSection
          title="Stakeholders"
          icon="👥"
          defaultCollapsed={true}
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
              <div className="text-zinc-500 text-center py-8">
                No stakeholders assigned
              </div>
            )}
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          title="Team Members"
          icon="👥"
          defaultCollapsed={true}
        >
          <EpicTeamMembers epicId={params.id} />
        </CollapsibleSection>
      </div>
    </div>
  );
}
