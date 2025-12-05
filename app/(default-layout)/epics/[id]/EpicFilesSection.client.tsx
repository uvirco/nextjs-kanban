"use client";
import { useState, useEffect } from "react";
import {
  IconUpload,
  IconDownload,
  IconTrash,
  IconFile,
} from "@tabler/icons-react";
import {
  handleUploadAttachment,
  handleDeleteAttachment,
  handleGetSignedUrl,
} from "@/server-actions/AttachmentServerActions";

interface EpicFilesSectionProps {
  epic: any;
  params: { id: string };
}

export default function EpicFilesSection({
  epic,
  params,
}: EpicFilesSectionProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [showUploadForm, setShowUploadForm] = useState(false);

  // Clear error when hiding the form
  useEffect(() => {
    if (!showUploadForm) {
      setError("");
    }
  }, [showUploadForm]);

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

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-white flex items-center gap-2">
        <IconFile size={16} />
        Files
      </h3>

      {!showUploadForm ? (
        <button
          onClick={() => setShowUploadForm(true)}
          className="p-1 bg-zinc-700 hover:bg-zinc-600 rounded text-white"
          title="Upload file"
        >
          <IconUpload size={14} />
        </button>
      ) : (
        <form onSubmit={handleFileSubmit} className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="file"
              name="file"
              className="flex-1 px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-white text-xs"
            />
            <button
              type="submit"
              disabled={uploading}
              className="p-1 bg-zinc-700 hover:bg-zinc-600 rounded text-white"
              title={uploading ? "Uploading..." : "Upload file"}
            >
              <IconUpload size={14} />
            </button>
            <button
              type="button"
              onClick={() => setShowUploadForm(false)}
              className="p-1 bg-zinc-700 hover:bg-zinc-600 rounded text-white"
              title="Cancel"
            >
              ✕
            </button>
          </div>
          <input
            type="text"
            name="name"
            placeholder="Friendly name (optional)"
            className="w-full px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-white text-xs placeholder-zinc-500"
          />
        </form>
      )}

      {showUploadForm && error && <div className="text-red-400 text-xs">{error}</div>}

      <div className="space-y-1 max-h-48 overflow-y-auto">
        {epic.attachments?.filter((a: any) => a.mimeType !== "link").length ? (
          epic.attachments
            .filter((a: any) => a.mimeType !== "link")
            .map((att: any) => (
              <div
                key={att.id}
                className="flex items-center justify-between p-2 bg-zinc-800 rounded"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <IconFile size={14} className="text-zinc-400 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-medium text-white truncate flex items-center gap-2">
                      <span className="truncate">{att.filename}</span>
                      {att.createdAt && (
                        <span className="text-zinc-500 flex-shrink-0">
                          {new Date(att.createdAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    {att.storage_path && (
                      <div className="text-xs text-zinc-500 truncate">
                        {(() => {
                          const parts = String(att.storage_path).split("/").pop() || "";
                          const idx = parts.lastIndexOf("-");
                          return idx >= 0 ? parts.substring(idx + 1) : parts;
                        })()}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
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
                        setError(res.message || "Failed to get download url");
                      }
                    }}
                    className="p-1 text-zinc-400 hover:text-white rounded"
                    title={
                      downloadingId === att.id ? "Starting..." : "Download"
                    }
                  >
                    <IconDownload size={12} />
                  </button>
                  <button
                    onClick={() => handleDelete(att.id)}
                    className="p-1 text-red-400 hover:text-red-500 rounded"
                    title="Remove"
                  >
                    <IconTrash size={12} />
                  </button>
                </div>
              </div>
            ))
        ) : (
          <div className="text-zinc-500 text-xs text-center py-2">
            No files yet
          </div>
        )}
      </div>
    </div>
  );
}
