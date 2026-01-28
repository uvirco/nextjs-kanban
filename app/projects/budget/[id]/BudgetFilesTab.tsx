"use client";
import React from "react";
import { BudgetEntry } from "@/types/types";
import { Button } from "@nextui-org/button";
import { IconDownload, IconTrash } from "@tabler/icons-react";

interface BudgetFilesTabProps {
  budget: BudgetEntry;
  files: any[];
  onFileAdded: () => void;
}

export default function BudgetFilesTab({
  budget,
  files,
  onFileAdded,
}: BudgetFilesTabProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const formatDate = (date: string | Date | null | undefined) => {
    if (!date) return "-";
    try {
      const d = typeof date === "string" ? new Date(date) : date;
      return d.toLocaleDateString();
    } catch {
      return "-";
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* Upload Section - TODO: Implement file upload */}
      <div className="border-b border-zinc-700 pb-4">
        <h3 className="font-semibold text-white mb-2">Upload File</h3>
        <Button size="sm" disabled>
          Choose File (Coming Soon)
        </Button>
      </div>

      {/* Files List */}
      <div className="space-y-2">
        {files.length === 0 ? (
          <p className="text-zinc-400 text-sm">No files uploaded</p>
        ) : (
          files.map((file) => (
            <div
              key={file.id}
              className="bg-zinc-800/50 rounded p-3 border border-zinc-700 flex items-center justify-between"
            >
              <div className="flex-1">
                <p className="font-semibold text-white text-sm">{file.filename}</p>
                <p className="text-xs text-zinc-400">
                  {formatFileSize(file.size || 0)} • {formatDate(file.createdAt)}
                </p>
                <p className="text-xs text-zinc-500">
                  by {file.user?.name || file.user?.email || "Unknown"}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  isIconOnly
                  size="sm"
                  variant="flat"
                  onClick={() => window.open(file.url, "_blank")}
                >
                  <IconDownload size={16} />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
