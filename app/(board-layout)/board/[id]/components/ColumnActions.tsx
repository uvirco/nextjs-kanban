"use client";

import { IconEdit, IconMenu2, IconTrash, IconX } from "@tabler/icons-react";
import { toast } from "sonner";
import {
  handleDeleteColumn,
  handleEditColumn,
  handleDeleteColumnTasks,
} from "@/server-actions/ColumnServerActions";
import { useState } from "react";

export default function ColumnActions({
  columnId,
  boardId,
  columnTitle,
}: {
  columnId: string;
  boardId: string;
  columnTitle: string;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(columnTitle);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleDeleteColumnClick = async () => {
    if (window.confirm("Are you sure you want to delete this column?")) {
      const response = await handleDeleteColumn({
        columnId: columnId,
        boardId,
      });
      if (response.success) {
        toast.success(response.message);
      } else {
        toast.error(response.message);
      }
    }
    setIsMenuOpen(false);
  };

  const handleDeleteTasksClick = async () => {
    if (window.confirm("Are you sure you want to delete all the tasks in this column?")) {
      const response = await handleDeleteColumnTasks({ columnId, boardId });
      if (response.success) {
        toast.success(response.message);
      } else {
        toast.error(response.message);
      }
    }
    setIsMenuOpen(false);
  };

  const handleSave = async () => {
    setIsSubmitting(true);

    const editData = {
      columnId: columnId,
      title: editedTitle,
      boardId: boardId,
    };

    const response = await handleEditColumn(editData);

    if (response.success) {
      toast.success(response.message);
      setIsEditing(false);
      setError(null);
    } else {
      toast.error(response.message);
      setError(response.message);
    }

    setIsSubmitting(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedTitle(columnTitle);
    setError(null);
  };

  return (
    <>
      {isEditing ? (
        <div className="flex-col w-full">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSave();
            }}
          >
            <input
              autoComplete="off"
              placeholder="Enter a column name"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              className={`w-full px-3 py-2 mb-2 bg-zinc-800 border rounded-md text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                error ? "border-red-500" : "border-zinc-700"
              }`}
              autoFocus
            />
            {error && <p className="text-sm text-red-500 mb-2">{error}</p>}
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-md transition-colors"
              >
                {isSubmitting ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="p-1 bg-zinc-800 hover:bg-zinc-700 rounded-md transition-colors"
              >
                <IconX size={20} />
              </button>
            </div>
          </form>
        </div>
      ) : (
        <>
          <h3
            className="text-large text-zinc-300 cursor-pointer"
            onClick={() => setIsEditing(true)}
          >
            {columnTitle}
          </h3>
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="bg-zinc-800 p-2 rounded-md hover:bg-zinc-700 transition-colors"
            >
              <IconMenu2 size={18} />
            </button>
            {isMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsMenuOpen(false)}
                />
                <div className="absolute right-0 z-20 mt-2 w-64 bg-zinc-900 border border-zinc-700 rounded-md shadow-lg overflow-hidden">
                  <button
                    onClick={handleDeleteTasksClick}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-zinc-800 transition-colors"
                  >
                    <IconTrash size={18} />
                    Delete all tasks in this column
                  </button>
                  <button
                    onClick={handleDeleteColumnClick}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-zinc-800 transition-colors"
                  >
                    <IconTrash size={18} />
                    Delete Column
                  </button>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </>
  );
}
