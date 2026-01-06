"use client";
import { useState } from "react";
import { IconX, IconEdit } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { handleUpdateLabel, handleDeleteLabel, handleRemoveLabel } from "@/server-actions/LabelServerActions";
import { toast } from "sonner";

interface LabelViewProps {
  label: {
    id: string;
    title: string | null;
    color: string;
  };
  taskId: string;
  boardId: string;
  onLabelUpdated: () => void;
  onLabelRemoved: () => void;
}

export default function LabelView({
  label,
  taskId,
  boardId,
  onLabelUpdated,
  onLabelRemoved,
}: LabelViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(label.title || "");
  const [editColor, setEditColor] = useState(label.color);
  const [loading, setLoading] = useState(false);

  const handleSaveEdit = async () => {
    setLoading(true);
    try {
      const result = await handleUpdateLabel({
        labelId: label.id,
        color: editColor,
        title: editTitle,
        boardId,
      });

      if (result.success) {
        setIsEditing(false);
        onLabelUpdated();
        toast.success("Label updated");
      } else {
        toast.error(result.message || "Failed to update label");
      }
    } catch (error) {
      toast.error("Failed to update label");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      const result = await handleDeleteLabel({
        labelId: label.id,
        boardId,
        taskId,
      });

      if (result.success) {
        onLabelRemoved();
        toast.success("Label deleted");
      } else {
        toast.error(result.message || "Failed to delete label");
      }
    } catch (error) {
      toast.error("Failed to delete label");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromTask = async () => {
    setLoading(true);
    try {
      const result = await handleRemoveLabel({
        labelId: label.id,
        taskId,
        boardId,
      });

      if (result.success) {
        onLabelRemoved();
        toast.success("Label removed from task");
      } else {
        toast.error(result.message || "Failed to remove label");
      }
    } catch (error) {
      toast.error("Failed to remove label");
    } finally {
      setLoading(false);
    }
  };

  if (isEditing) {
    return (
      <Popover open={isEditing} onOpenChange={setIsEditing}>
        <PopoverTrigger asChild>
          <div
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold text-white cursor-pointer hover:opacity-80"
            style={{ backgroundColor: label.color }}
          >
            <IconEdit size={12} />
            {label.title}
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-3 bg-zinc-800 border-zinc-700" align="start">
          <div className="space-y-3">
            <div>
              <Label className="text-xs text-zinc-400">Title</Label>
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="h-8 bg-zinc-700 border-zinc-600 text-zinc-200 mt-1"
              />
            </div>
            <div>
              <Label className="text-xs text-zinc-400">Color</Label>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="color"
                  value={editColor}
                  onChange={(e) => setEditColor(e.target.value)}
                  className="w-8 h-8 rounded border border-zinc-600"
                />
                <div
                  className="flex-1 h-8 rounded border border-zinc-600"
                  style={{ backgroundColor: editColor }}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleSaveEdit}
                disabled={loading}
                className="flex-1 h-8"
              >
                Save
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsEditing(false)}
                className="flex-1 h-8"
              >
                Cancel
              </Button>
            </div>
            <Button
              size="sm"
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
              className="w-full h-8"
            >
              Delete Label
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <div className="relative group">
      <div
        className="inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold text-white cursor-pointer"
        style={{ backgroundColor: label.color }}
      >
        {label.title}
        <button
          onClick={handleRemoveFromTask}
          className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black hover:bg-opacity-20 rounded-full p-0.5"
          disabled={loading}
        >
          <IconX size={10} />
        </button>
      </div>
      <button
        onClick={() => setIsEditing(true)}
        className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-700 hover:bg-zinc-600 rounded-full p-1"
      >
        <IconEdit size={10} />
      </button>
    </div>
  );
}