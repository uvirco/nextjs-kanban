"use client";
import { useState } from "react";
import { IconTag } from "@tabler/icons-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/types/types";
import { LabelView } from "./LabelView";
import { LabelEditMode } from "./LabelEditMode";
import { saveLabel, removeLabel } from "./LabelActions";

interface AddToCardLabelsProps {
  labels: Label[];
  activeLabels: Label[];
  taskId: string;
  boardId: string;
}

export default function AddToCardLabels({
  labels,
  activeLabels,
  taskId,
  boardId,
}: AddToCardLabelsProps) {
  const [selectedLabels, setSelectedLabels] = useState<string[]>(
    activeLabels.map((label) => label.id)
  );
  const [editMode, setEditMode] = useState<boolean>(false);
  const [editingLabel, setEditingLabel] = useState<Label | null>(null);
  const [tempLabelTitle, setTempLabelTitle] = useState<string>("");
  const [tempLabelColor, setTempLabelColor] = useState<string>("");
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const handleCheckboxChange = async (values: string[]) => {
    const newLabel = values.find(
      (labelId) => !selectedLabels.includes(labelId)
    );
    const removedLabel = selectedLabels.find(
      (labelId) => !values.includes(labelId)
    );

    if (newLabel) {
      await saveLabel(newLabel, taskId, boardId);
      setSelectedLabels(values);
    }

    if (removedLabel) {
      await removeLabel(removedLabel, taskId, boardId);
      setSelectedLabels(values);
    }
  };

  const closePopover = () => {
    setIsOpen(false);
    setEditMode(false);
    setEditingLabel(null);
  };

  const enterEditMode = (label: Label) => {
    setEditingLabel(label);
    setEditMode(true);
    setTempLabelTitle(label.title || "");
    setTempLabelColor(label.color);
  };

  const exitEditMode = () => {
    setEditMode(false);
    setEditingLabel(null);
  };

  const enterCreateMode = () => {
    setEditingLabel(null);
    setEditMode(true);
    setTempLabelTitle("");
    setTempLabelColor("blue");
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          className="w-8 h-8 flex items-center justify-center rounded-md bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-600 transition-colors"
          title="Add Labels"
        >
          <IconTag size={16} className="text-zinc-400" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 z-[100] max-h-96 overflow-y-auto" align="start" side="bottom" sideOffset={8}>
        {editMode ? (
          <LabelEditMode
            editingLabel={editingLabel}
            tempLabelTitle={tempLabelTitle}
            setTempLabelTitle={setTempLabelTitle}
            tempLabelColor={tempLabelColor}
            setTempLabelColor={setTempLabelColor}
            exitEditMode={exitEditMode}
            closePopover={closePopover}
            boardId={boardId}
            taskId={taskId}
          />
        ) : (
          <LabelView
            labels={labels}
            selectedLabels={selectedLabels}
            handleCheckboxChange={handleCheckboxChange}
            enterEditMode={enterEditMode}
            enterCreateMode={enterCreateMode}
            closePopover={closePopover}
          />
        )}
      </PopoverContent>
    </Popover>
  );
}
