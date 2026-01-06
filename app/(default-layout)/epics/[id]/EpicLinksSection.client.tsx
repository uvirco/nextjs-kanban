"use client";
import React, { useState, useEffect } from "react";
import {
  IconPaperclip,
  IconPlus,
  IconTrash,
  IconExternalLink,
  IconDeviceFloppy,
} from "@tabler/icons-react";
import {
  handleCreateLinkAttachment,
  handleDeleteAttachment,
} from "@/server-actions/AttachmentServerActions";

interface EpicLinksSectionProps {
  epic: any;
  params: { id: string };
}

export default function EpicLinksSection({
  epic,
  params,
}: EpicLinksSectionProps) {
  const [linkUrl, setLinkUrl] = useState("");
  const [linkName, setLinkName] = useState("");
  const [error, setError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  // Clear error when hiding the form
  React.useEffect(() => {
    if (!showAddForm) {
      setError("");
    }
  }, [showAddForm]);

  const handleAddLink = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const data = new FormData(e.currentTarget as HTMLFormElement);
    data.append("taskId", params.id);

    const res = await handleCreateLinkAttachment(data);

    if (!res.success) {
      setError(res.message || "Failed to add link");
    } else {
      setLinkUrl("");
      setLinkName("");
      window.location.reload();
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-white flex items-center gap-2">
        <IconPaperclip size={16} />
        Links
      </h3>

      <div className="space-y-3">
        {!showAddForm ? (
          <button
            onClick={() => setShowAddForm(true)}
            className="p-1 bg-zinc-700 hover:bg-zinc-600 rounded text-white"
            title="Add link"
          >
            <IconPlus size={14} />
          </button>
        ) : (
          <form onSubmit={handleAddLink} className="space-y-2">
            <input
              type="text"
              name="name"
              placeholder="Friendly name (optional)"
              value={linkName}
              onChange={(e) => setLinkName(e.target.value)}
              className="w-full px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-white text-xs placeholder-zinc-500"
            />
            <div className="flex items-center gap-2">
              <input
                type="text"
                name="url"
                placeholder="https://example.com"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                className="flex-1 px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-white text-xs"
                required
              />
              <button
                type="submit"
                className="p-1 bg-zinc-700 hover:bg-zinc-600 rounded text-white"
                title="Save link"
              >
                <IconDeviceFloppy size={14} />
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="p-1 bg-zinc-700 hover:bg-zinc-600 rounded text-white"
                title="Cancel"
              >
                ✕
              </button>
            </div>
          </form>
        )}

        {showAddForm && error && (
          <div className="text-red-400 text-xs">{error}</div>
        )}

        <div className="space-y-1 max-h-48 overflow-y-auto">
          {epic.attachments?.filter((a: any) => a.mimeType === "link")
            .length ? (
            epic.attachments
              .filter((a: any) => a.mimeType === "link")
              .map((att: any) => (
                <div
                  key={att.id}
                  className="flex items-center justify-between p-2 bg-zinc-800 rounded"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <IconPaperclip
                      className="text-zinc-400 flex-shrink-0"
                      size={14}
                    />
                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center gap-1">
                        <a
                          href={att.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-medium text-white hover:underline truncate"
                        >
                          {att.filename}
                        </a>
                        <span className="text-xs text-zinc-400 flex-shrink-0">
                          (link)
                        </span>
                      </div>
                      {att.url && (
                        <div className="text-xs text-zinc-500 truncate">
                          {att.url}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <a
                      href={att.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-zinc-400 hover:text-white text-xs p-1 rounded hover:bg-zinc-700"
                      title="Open link"
                    >
                      <IconExternalLink size={12} />
                    </a>
                    <button
                      onClick={async () => {
                        const ok = confirm("Delete this attachment?");
                        if (!ok) return;
                        const res = await handleDeleteAttachment({
                          id: att.id,
                          taskId: params.id,
                        });
                        if (res.success) window.location.reload();
                        else setError(res.message || "Delete failed");
                      }}
                      className="text-red-400 hover:text-red-500 text-xs p-1 rounded hover:bg-zinc-700"
                      title="Remove link"
                    >
                      <IconTrash size={12} />
                    </button>
                  </div>
                </div>
              ))
          ) : (
            <div className="text-zinc-500 text-center py-2 text-xs">
              No links yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
