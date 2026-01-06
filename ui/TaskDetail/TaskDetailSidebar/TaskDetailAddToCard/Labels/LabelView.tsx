"use client";
import { Button } from "@nextui-org/button";
import { IconArrowLeft, IconPlus, IconX } from "@tabler/icons-react";
import { LabelCheckboxGroup } from "./LabelCheckboxGroup";
import { Label } from "@/types/types";
import TaskPopoverHeading from "../components/TaskPopoverHeading";
import TaskPopoverWrapper from "../components/TaskPopoverWrapper";

export function LabelView({
  labels,
  selectedLabels,
  handleCheckboxChange,
  enterEditMode,
  enterCreateMode,
  closePopover,
}: {
  labels: Label[];
  selectedLabels: string[];
  handleCheckboxChange: (values: string[]) => void;
  enterEditMode: (label: Label) => void;
  enterCreateMode: () => void;
  closePopover: () => void;
}) {
  return (
    <TaskPopoverWrapper>
      <TaskPopoverHeading
        title="Labels"
        beforeContent={
          <div className="opacity-0">
            <IconArrowLeft className="hidden" size={20} />
          </div>
        }
        afterContent={
          <button onClick={closePopover}>
            <IconX size={20} className="text-zinc-400 hover:text-zinc-300" />
          </button>
        }
      />

      <LabelCheckboxGroup
        labels={labels}
        selectedLabels={selectedLabels}
        handleCheckboxChange={handleCheckboxChange}
        enterEditMode={enterEditMode}
      />

      <hr className="mb-3 border-zinc-800" />

      <Button
        className="w-full flex items-center gap-1 bg-zinc-700 hover:bg-zinc-600 text-zinc-200 border border-zinc-600"
        size="sm"
        onClick={enterCreateMode}
      >
        <IconPlus size={18} className="text-zinc-300" /> Create a new label
      </Button>
    </TaskPopoverWrapper>
  );
}
