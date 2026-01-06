"use client";
import { useState, useEffect } from "react";
import { IconTag, IconPlus } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { handleSaveLabel, handleRemoveLabel, handleCreateLabel } from "@/server-actions/LabelServerActions";
import { toast } from "sonner";

interface Label {
  id: string;
  title: string | null;
  color: string;
}

interface AddToCardLabelsProps {
  taskId: string;
  boardId: string;
  currentLabels: Label[];
  availableLabels: Label[];
  onLabelsUpdated: () => void;
}

export default function AddToCardLabels({
  taskId,
  boardId,
  currentLabels,
  availableLabels,
  onLabelsUpdated,
}: AddToCardLabelsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [newLabelTitle, setNewLabelTitle] = useState("");
  const [newLabelColor, setNewLabelColor] = useState("#0079bf");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const filteredLabels = availableLabels.filter((label) =>
    label.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleLabel = async (labelId: string, isChecked: boolean) => {
    setLoading(true);
    try {
      if (isChecked) {
        await handleSaveLabel({ labelId, taskId, boardId });
      } else {
        await handleRemoveLabel({ labelId, taskId, boardId });
      }
      onLabelsUpdated();
      toast.success(isChecked ? "Label added" : "Label removed");
    } catch (error) {
      toast.error("Failed to update label");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNewLabel = async () => {
    if (!newLabelTitle.trim()) return;

    setLoading(true);
    try {
      const result = await handleCreateLabel({
        color: newLabelColor,
        title: newLabelTitle,
        boardId,
        taskId,
      });

      if (result.success) {
        setNewLabelTitle("");
        setShowCreateForm(false);
        onLabelsUpdated();
        toast.success("Label created and added");
      } else {
        toast.error(result.message || "Failed to create label");
      }
    } catch (error) {
      toast.error("Failed to create label");
    } finally {
      setLoading(false);
    }
  };

  const isLabelSelected = (labelId: string) => {
    return currentLabels.some((label) => label.id === labelId);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
        >
          <IconTag size={16} />
          <span className="ml-1">Labels</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 bg-zinc-800 border-zinc-700" align="start">
        <div className="p-3">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-zinc-200">Labels</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="h-6 px-2 text-zinc-400 hover:text-zinc-200"
            >
              <IconPlus size={14} />
            </Button>
          </div>

          {showCreateForm && (
            <div className="mb-3 p-3 bg-zinc-900 rounded-md">
              <div className="space-y-2">
                <Input
                  placeholder="Label name"
                  value={newLabelTitle}
                  onChange={(e) => setNewLabelTitle(e.target.value)}
                  className="h-8 bg-zinc-700 border-zinc-600 text-zinc-200"
                />
                <div className="flex items-center gap-2">
                  <Label className="text-xs text-zinc-400">Color:</Label>
                  <input
                    type="color"
                    value={newLabelColor}
                    onChange={(e) => setNewLabelColor(e.target.value)}
                    className="w-8 h-8 rounded border border-zinc-600"
                  />
                  <Button
                    size="sm"
                    onClick={handleCreateNewLabel}
                    disabled={loading || !newLabelTitle.trim()}
                    className="h-8 px-3"
                  >
                    Create
                  </Button>
                </div>
              </div>
            </div>
          )}

          <Input
            placeholder="Search labels..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-8 mb-3 bg-zinc-700 border-zinc-600 text-zinc-200"
          />

          <div className="max-h-48 overflow-y-auto">
            {filteredLabels.map((label) => (
              <div
                key={label.id}
                className="flex items-center gap-2 p-2 hover:bg-zinc-700 rounded cursor-pointer"
                onClick={() => handleToggleLabel(label.id, !isLabelSelected(label.id))}
              >
                <Checkbox
                  checked={isLabelSelected(label.id)}
                  onChange={() => {}} // Handled by onClick
                  className="border-zinc-600"
                />
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: label.color }}
                />
                <span className="text-sm text-zinc-200">{label.title}</span>
              </div>
            ))}
            {filteredLabels.length === 0 && (
              <div className="text-sm text-zinc-500 p-2">
                {searchTerm ? "No labels found" : "No labels available"}
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}