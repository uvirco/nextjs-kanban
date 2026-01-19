"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  IconPlus,
  IconTrash,
  IconGripVertical,
  IconEdit,
  IconCheck,
  IconX,
} from "@tabler/icons-react";

interface Column {
  id: string;
  title: string;
  stage: string;
  color: string;
  order: number;
  boardId: string;
}

interface ColumnManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  boardId: string;
  onColumnsUpdated: () => void;
}

const DEFAULT_COLORS = [
  "#3b82f6", // blue
  "#10b981", // green
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // purple
  "#ec4899", // pink
  "#06b6d4", // cyan
];

export default function ColumnManagementModal({
  isOpen,
  onClose,
  boardId,
  onColumnsUpdated,
}: ColumnManagementModalProps) {
  const [columns, setColumns] = useState<Column[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingColumnId, setEditingColumnId] = useState<string | null>(null);
  const [editedColumn, setEditedColumn] = useState<Partial<Column>>({});
  const [newColumnTitle, setNewColumnTitle] = useState("");
  const [newColumnStage, setNewColumnStage] = useState("");
  const [newColumnColor, setNewColumnColor] = useState(DEFAULT_COLORS[0]);

  useEffect(() => {
    if (isOpen && boardId) {
      fetchColumns();
    }
  }, [isOpen, boardId]);

  const fetchColumns = async () => {
    try {
      const response = await fetch(`/api/crm/deal-columns?boardId=${boardId}`);
      if (response.ok) {
        const data = await response.json();
        setColumns(data.columns || []);
      }
    } catch (error) {
      console.error("Error fetching columns:", error);
    }
  };

  const handleAddColumn = async () => {
    if (!newColumnTitle.trim() || !newColumnStage.trim()) {
      alert("Please enter both title and stage");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/crm/deal-columns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newColumnTitle,
          stage: newColumnStage,
          color: newColumnColor,
          boardId,
        }),
      });

      if (response.ok) {
        setNewColumnTitle("");
        setNewColumnStage("");
        setNewColumnColor(DEFAULT_COLORS[0]);
        await fetchColumns();
        onColumnsUpdated();
      } else {
        const error = await response.json();
        alert(`Failed to create column: ${error.error}`);
      }
    } catch (error) {
      console.error("Error creating column:", error);
      alert("Failed to create column");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteColumn = async (columnId: string, columnTitle: string) => {
    if (
      !confirm(
        `Are you sure you want to delete the column "${columnTitle}"?\n\nWarning: All deals in this column will need to be moved to another column first.`,
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/crm/deal-columns/${columnId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchColumns();
        onColumnsUpdated();
      } else {
        const error = await response.json();
        alert(`Failed to delete column: ${error.error}`);
      }
    } catch (error) {
      console.error("Error deleting column:", error);
      alert("Failed to delete column");
    } finally {
      setLoading(false);
    }
  };

  const handleEditColumn = (column: Column) => {
    setEditingColumnId(column.id);
    setEditedColumn({
      title: column.title,
      stage: column.stage,
      color: column.color,
    });
  };

  const handleCancelEdit = () => {
    setEditingColumnId(null);
    setEditedColumn({});
  };

  const handleUpdateColumn = async (columnId: string) => {
    if (!editedColumn.title?.trim() || !editedColumn.stage?.trim()) {
      alert("Please enter both title and stage");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/crm/deal-columns/${columnId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editedColumn),
      });

      if (response.ok) {
        setEditingColumnId(null);
        setEditedColumn({});
        await fetchColumns();
        onColumnsUpdated();
      } else {
        const error = await response.json();
        alert(`Failed to update column: ${error.error}`);
      }
    } catch (error) {
      console.error("Error updating column:", error);
      alert("Failed to update column");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setNewColumnTitle("");
    setNewColumnStage("");
    setNewColumnColor(DEFAULT_COLORS[0]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Pipeline Columns</DialogTitle>
          <DialogDescription>
            Add and organize columns for this pipeline. Each column represents a
            stage in your deal flow.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Existing Columns */}
          <div>
            <h3 className="text-sm font-medium mb-3">
              Current Columns ({columns.length})
            </h3>
            {columns.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                <p>No columns yet. Add your first column below.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {columns.map((column, index) => (
                  <div
                    key={column.id}
                    className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg"
                  >
                    {editingColumnId === column.id ? (
                      // Edit mode
                      <>
                        <div className="flex-1 grid grid-cols-2 gap-2">
                          <Input
                            value={editedColumn.title || ""}
                            onChange={(e) =>
                              setEditedColumn({
                                ...editedColumn,
                                title: e.target.value,
                              })
                            }
                            placeholder="Column title"
                            className="h-8"
                          />
                          <Input
                            value={editedColumn.stage || ""}
                            onChange={(e) =>
                              setEditedColumn({
                                ...editedColumn,
                                stage: e.target.value,
                              })
                            }
                            placeholder="Stage slug"
                            className="h-8"
                          />
                        </div>
                        <div className="flex gap-1">
                          {DEFAULT_COLORS.map((color) => (
                            <button
                              key={color}
                              type="button"
                              className={`w-6 h-6 rounded-full border-2 transition-all ${
                                editedColumn.color === color
                                  ? "border-primary scale-110"
                                  : "border-transparent"
                              }`}
                              style={{ backgroundColor: color }}
                              onClick={() =>
                                setEditedColumn({ ...editedColumn, color })
                              }
                            />
                          ))}
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleUpdateColumn(column.id)}
                          disabled={loading}
                          className="text-green-600 hover:text-green-600 hover:bg-green-600/10"
                        >
                          <IconCheck className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleCancelEdit}
                          disabled={loading}
                        >
                          <IconX className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      // View mode
                      <>
                        <IconGripVertical className="h-4 w-4 text-muted-foreground" />
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: column.color }}
                        />
                        <div className="flex-1">
                          <div className="font-medium">{column.title}</div>
                          <div className="text-xs text-muted-foreground">
                            Stage: {column.stage}
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Order: {index + 1}
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditColumn(column)}
                          disabled={loading}
                          className="hover:bg-primary/10"
                        >
                          <IconEdit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            handleDeleteColumn(column.id, column.title)
                          }
                          disabled={loading}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <IconTrash className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add New Column */}
          <div className="border-t pt-6">
            <h3 className="text-sm font-medium mb-3">Add New Column</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="column-title">Column Title</Label>
                  <Input
                    id="column-title"
                    placeholder="e.g., Qualified Leads"
                    value={newColumnTitle}
                    onChange={(e) => setNewColumnTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleAddColumn();
                      }
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="column-stage">Stage (slug)</Label>
                  <Input
                    id="column-stage"
                    placeholder="e.g., qualified"
                    value={newColumnStage}
                    onChange={(e) => setNewColumnStage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleAddColumn();
                      }
                    }}
                  />
                </div>
              </div>

              <div>
                <Label>Color</Label>
                <div className="flex gap-2 mt-2">
                  {DEFAULT_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        newColumnColor === color
                          ? "border-primary scale-110"
                          : "border-transparent"
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setNewColumnColor(color)}
                    />
                  ))}
                </div>
              </div>

              <Button
                onClick={handleAddColumn}
                disabled={
                  loading || !newColumnTitle.trim() || !newColumnStage.trim()
                }
                className="w-full"
              >
                <IconPlus className="h-4 w-4 mr-2" />
                Add Column
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
