"use client";
import { useState } from "react";
import { IconTag } from "@tabler/icons-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@prisma/client";
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

  const closePopover = () => {};

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
    <li className="bg-muted hover:bg-muted/80 border border-border rounded-md hover:border-primary transition-colors">
      <Popover>
        <PopoverTrigger asChild>
          <button className="flex items-center gap-2 px-2 py-2 w-full">
            <IconTag size={14} /> Labels
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="start">
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
    </li>
  );
}
