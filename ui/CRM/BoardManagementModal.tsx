"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CRMBoard } from "@/types/crm";
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconStar,
  IconStarFilled,
} from "@tabler/icons-react";
import { Card, CardContent } from "@/components/ui/card";

interface BoardManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBoardsChanged: () => void;
}

export default function BoardManagementModal({
  isOpen,
  onClose,
  onBoardsChanged,
}: BoardManagementModalProps) {
  const [boards, setBoards] = useState<CRMBoard[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingBoard, setEditingBoard] = useState<CRMBoard | null>(null);
  const [boardToDelete, setBoardToDelete] = useState<CRMBoard | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    isDefault: false,
  });

  useEffect(() => {
    if (isOpen) {
      fetchBoards();
    }
  }, [isOpen]);

  const fetchBoards = async () => {
    try {
      const response = await fetch("/api/crm/boards?type=deals");
      if (response.ok) {
        const data = await response.json();
        setBoards(data.boards || []);
      }
    } catch (error) {
      console.error("Error fetching boards:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingBoard
        ? `/api/crm/boards/${editingBoard.id}`
        : "/api/crm/boards";
      const method = editingBoard ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          isDefault: formData.isDefault,
          type: "deals",
        }),
      });

      if (response.ok) {
        await fetchBoards();
        onBoardsChanged();
        setShowForm(false);
        setEditingBoard(null);
        setFormData({ title: "", description: "", isDefault: false });
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || "Failed to save board"}`);
      }
    } catch (error) {
      console.error("Error saving board:", error);
      alert("Failed to save board");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (board: CRMBoard) => {
    setEditingBoard(board);
    setFormData({
      title: board.title,
      description: board.description || "",
      isDefault: board.isDefault || false,
    });
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!boardToDelete) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/crm/boards/${boardToDelete.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchBoards();
        onBoardsChanged();
        setBoardToDelete(null);
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || "Failed to delete board"}`);
      }
    } catch (error) {
      console.error("Error deleting board:", error);
      alert("Failed to delete board");
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async (board: CRMBoard) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/crm/boards/${board.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDefault: true }),
      });

      if (response.ok) {
        await fetchBoards();
        onBoardsChanged();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || "Failed to set default"}`);
      }
    } catch (error) {
      console.error("Error setting default:", error);
      alert("Failed to set default");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-zinc-800 border-zinc-700 text-white max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white text-xl">
              Manage Pipeline Boards
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              Create and manage multiple deal pipelines
            </DialogDescription>
          </DialogHeader>

          {!showForm ? (
            <div className="space-y-4">
              <Button
                onClick={() => {
                  setEditingBoard(null);
                  setFormData({ title: "", description: "", isDefault: false });
                  setShowForm(true);
                }}
                className="w-full"
              >
                <IconPlus size={16} className="mr-2" />
                Create New Board
              </Button>

              <div className="space-y-3">
                {boards.map((board) => (
                  <Card key={board.id} className="bg-zinc-700 border-zinc-600">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-white">
                              {board.title}
                            </h3>
                            {board.isDefault && (
                              <span className="flex items-center gap-1 px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded">
                                <IconStarFilled size={12} />
                                Default
                              </span>
                            )}
                          </div>
                          {board.description && (
                            <p className="text-sm text-zinc-400">
                              {board.description}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-1 ml-4">
                          {!board.isDefault && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleSetDefault(board)}
                              disabled={loading}
                              title="Set as default"
                              className="h-8 w-8 p-0 text-zinc-400 hover:text-yellow-400"
                            >
                              <IconStar size={16} />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(board)}
                            disabled={loading}
                            className="h-8 w-8 p-0"
                          >
                            <IconEdit size={16} />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setBoardToDelete(board)}
                            disabled={loading || board.isDefault}
                            className="h-8 w-8 p-0 text-red-400 hover:text-red-300 disabled:opacity-50"
                          >
                            <IconTrash size={16} />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {boards.length === 0 && (
                  <div className="text-center py-8 text-zinc-400">
                    No boards yet. Create your first pipeline board!
                  </div>
                )}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title" className="text-white">
                  Board Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                  placeholder="e.g., Partnership Pipeline, Recruiting Pipeline"
                  className="mt-1 bg-zinc-700 border-zinc-600 text-white"
                />
              </div>

              <div>
                <Label htmlFor="description" className="text-white">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Optional description of this pipeline"
                  className="mt-1 bg-zinc-700 border-zinc-600 text-white"
                  rows={3}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={formData.isDefault}
                  onChange={(e) =>
                    setFormData({ ...formData, isDefault: e.target.checked })
                  }
                  className="rounded border-zinc-600"
                />
                <Label
                  htmlFor="isDefault"
                  className="text-white cursor-pointer"
                >
                  Set as default board
                </Label>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingBoard(null);
                  }}
                  className="flex-1"
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={loading}>
                  {loading
                    ? "Saving..."
                    : editingBoard
                      ? "Update Board"
                      : "Create Board"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!boardToDelete}
        onOpenChange={(open) => !open && setBoardToDelete(null)}
      >
        <AlertDialogContent className="bg-zinc-800 border-zinc-700 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Board</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              Are you sure you want to delete "{boardToDelete?.title}"? This
              action cannot be undone. You cannot delete boards with existing
              deals.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setBoardToDelete(null)}
              className="bg-zinc-700 border-zinc-600 text-white hover:bg-zinc-600"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {loading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
