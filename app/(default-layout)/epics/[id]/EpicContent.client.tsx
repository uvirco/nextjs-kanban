"use client";
import { useState, useEffect } from "react";
import {
  IconChevronDown,
  IconChevronRight,
  IconAlertTriangle,
  IconPaperclip,
  IconPlus,
  IconDownload,
  IconTrash,
} from "@tabler/icons-react";
import {
  handleUploadAttachment,
  handleCreateLinkAttachment,
  handleDeleteAttachment,
  handleGetSignedUrl,
} from "@/server-actions/AttachmentServerActions";
import TeamMembers from "@/ui/TeamMembers/TeamMembers.client";
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
  const [uploading, setUploading] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkName, setLinkName] = useState("");
  const [error, setError] = useState("");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleFileSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploading(true);
    setError("");

    const data = new FormData(e.currentTarget as HTMLFormElement);
    data.append("taskId", params.id);

    const res = await handleUploadAttachment(data);

    if (!res.success) {
      setError(res.message || "Upload failed");
    } else {
      // simple client-side refresh: reload page
      window.location.reload();
    }

    setUploading(false);
  };

  const handleDelete = async (id: string) => {
    const ok = confirm("Delete this attachment?");
    if (!ok) return;
    const res = await handleDeleteAttachment({ id, taskId: params.id });
    if (res.success) window.location.reload();
    else setError(res.message || "Delete failed");
  };

  const handleAddLink = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const data = new FormData();
    data.append("url", linkUrl);
    data.append("name", linkName || linkUrl);
    data.append("taskId", params.id);

    const res = await handleCreateLinkAttachment(data);
    if (!res.success) {
      setError(res.message || "Failed to add link");
    } else {
      setLinkUrl("");
      setLinkName("");
      // refresh to show new link
      window.location.reload();
    }
  };
  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Left widget column (quarter) */}
      <div className="col-span-3">
        {/* reserved for left widgets (timeline, quick actions, etc) */}
      </div>

      {/* Center area (1/2 width) */}
      <div className="col-span-6">
        <CollapsibleSection
          title="RACI Matrix"
          icon="👥"
          defaultCollapsed={true}
          storageKey={`epic:${params.id}:section:raci`}
        >
          <RaciMatrixSection raciUsers={raciUsers} />
        </CollapsibleSection>

        {/* Subtasks */}
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

            {error && <div className="text-red-400 text-sm">{error}</div>}

            <div className="space-y-2">
              {epic.attachments?.filter((a: any) => a.mimeType !== "link")
                .length ? (
                epic.attachments
                  .filter((a: any) => a.mimeType !== "link")
                  .map((att: any) => (
                    <div
                      key={att.id}
                      className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <IconPaperclip className="text-zinc-400" />
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-white">
                              {att.filename}
                            </span>
                            <span className="text-xs text-zinc-400">
                              (file)
                            </span>
                          </div>
                          {att.storage_path && (
                            <div className="text-xs text-zinc-500 mt-1">
                              {(() => {
                                const parts =
                                  String(att.storage_path).split("/").pop() ||
                                  "";
                                const idx = parts.lastIndexOf("-");
                                return idx >= 0
                                  ? parts.substring(idx + 1)
                                  : parts;
                              })()}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={async () => {
                            setError("");
                            setDownloadingId(att.id);
                            const res = await handleGetSignedUrl({
                              attachmentId: att.id,
                            });
                            setDownloadingId(null);
                            if (res.success && res.url) {
                              window.open(res.url, "_blank");
                            } else {
                              setError(
                                res.message || "Failed to get download url"
                              );
                            }
                          }}
                          className="text-zinc-400 hover:text-white text-sm flex items-center gap-1"
                        >
                          <IconDownload size={14} />{" "}
                          {downloadingId === att.id
                            ? "Starting..."
                            : "Download"}
                        </button>
                        <button
                          onClick={() => handleDelete(att.id)}
                          className="text-red-400 hover:text-red-500 text-sm flex items-center gap-1"
                        >
                          <IconTrash size={14} /> Remove
                        </button>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="text-zinc-500 text-center py-4">
                  No files yet
                </div>
              )}
            </div>
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          title="Links"
          icon="🔗"
          defaultCollapsed={true}
          storageKey={`epic:${params.id}:section:links`}
        >
          <div className="space-y-4">
            <div className="flex gap-4">
              <form
                onSubmit={handleAddLink}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  name="linkUrl"
                  placeholder="https://example.com"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-white text-sm"
                />
                <input
                  type="text"
                  name="linkName"
                  placeholder="Friendly name (optional)"
                  value={linkName}
                  onChange={(e) => setLinkName(e.target.value)}
                  className="px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-white text-sm"
                />
                <button
                  type="submit"
                  className="px-3 py-1 bg-zinc-700 hover:bg-zinc-600 rounded text-sm text-white"
                >
                  Add link
                </button>
              </form>
            </div>

            {error && <div className="text-red-400 text-sm">{error}</div>}

            <div className="space-y-2">
              {epic.attachments?.filter((a: any) => a.mimeType === "link")
                .length ? (
                epic.attachments
                  .filter((a: any) => a.mimeType === "link")
                  .map((att: any) => (
                    <div
                      key={att.id}
                      className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <IconPaperclip className="text-zinc-400" />
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <a
                              href={att.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-sm font-semibold text-white hover:underline"
                            >
                              {att.filename}
                            </a>
                            <span className="text-xs text-zinc-400">
                              (link)
                            </span>
                          </div>
                          {att.url && (
                            <div className="text-xs text-zinc-500 mt-1">
                              {att.url}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <a
                          href={att.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-zinc-400 hover:text-white text-sm flex items-center gap-1"
                        >
                          <IconPlus size={14} /> Open
                        </a>
                        <button
                          onClick={() => handleDelete(att.id)}
                          className="text-red-400 hover:text-red-500 text-sm flex items-center gap-1"
                        >
                          <IconTrash size={14} /> Remove
                        </button>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="text-zinc-500 text-center py-4">
                  No links yet
                </div>
              )}
            </div>
          </div>
        </CollapsibleSection>

        {/* Checklists */}
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
              <div className="text-zinc-500 text-center py-8">
                No checklists yet
              </div>
            )}

            {/* Add Checklist */}
            <EpicAddChecklist epicId={params.id} />
          </div>
        </CollapsibleSection>
      </div>

      {/* Right Widget Column (Stakeholders / Team Members) */}
      <div className="col-span-3">
        <div className="space-y-4">
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
            storageKey={`epic:${params.id}:section:team`}
          >
            <TeamMembers epicId={params.id} />
          </CollapsibleSection>
        </div>
      </div>
    </div>
  );
}
