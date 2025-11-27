"use client";
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { IconEdit, IconX } from "@tabler/icons-react";
import { toast } from "sonner";
import DeleteChecklistItemButton from "./DeleteChecklistItemButton.client";
import {
  handleEditChecklistItemContent,
  handleToggleCheckedItem,
} from "@/server-actions/ChecklistServerActions";
import { ChecklistSummary, ChecklistItemSummary } from "@/types/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ChecklistCheckboxGroupProps {
  checkedItemIds: string[];
  checklist: ChecklistSummary;
  taskId: string;
}

export default function ChecklistCheckboxGroup({
  checkedItemIds,
  checklist,
  taskId,
}: ChecklistCheckboxGroupProps) {
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [inputErrors, setInputErrors] = useState<Record<string, string>>({});

  const handleEditClick = (itemId: string) => {
    setEditingItemId(itemId);
  };

  const handleCancelOrSubmit = () => {
    setEditingItemId(null);
    setInputErrors({});
  };

  const handleToggle = async (checklistItemId: string, isChecked: boolean) => {
    const response = await handleToggleCheckedItem({
      checklistItemId,
      isChecked,
      taskId,
    });
    if (response.success) {
      toast.success(response.message);
    } else {
      toast.error(response.message);
    }
  };

  const handleEditSubmit = async (data: FormData) => {
    const response = await handleEditChecklistItemContent(data);
    if (response.success) {
      toast.success(response.message);
      handleCancelOrSubmit();
    } else {
      toast.error(response.message);
      const itemId = data.get("checklistItemId") as string;
      setInputErrors({ [itemId]: response.message });
    }
  };

  return (
    <div className="mb-3 space-y-2">
      {checklist.items.map((item: ChecklistItemSummary) => (
        <div
          className="flex justify-between gap-5 hover:bg-muted py-1 px-2 rounded-md transition-colors"
          key={item.id}
        >
          <div className="flex grow items-center">
            <Checkbox
              id={item.id}
              checked={checkedItemIds.includes(item.id)}
              onCheckedChange={(checked) => handleToggle(item.id, checked as boolean)}
              className="mr-2"
            />
            {editingItemId !== item.id && (
              <label
                htmlFor={item.id}
                className={`cursor-pointer flex-1 ${checkedItemIds.includes(item.id) ? 'line-through text-muted-foreground' : ''}`}
              >
                {item.content}
              </label>
            )}

            {editingItemId === item.id && (
              <form
                className="flex gap-2 ml-2 flex-1"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleEditSubmit(new FormData(e.currentTarget));
                }}
              >
                <Input
                  autoComplete="off"
                  placeholder="Enter checklist item name..."
                  name="content"
                  defaultValue={item.content}
                  className="flex-1"
                />
                <input type="hidden" name="checklistItemId" value={item.id} />
                <input type="hidden" name="taskId" value={taskId} />
                <Button type="submit" size="sm">
                  Save
                </Button>
                <Button
                  size="sm"
                  type="button"
                  onClick={handleCancelOrSubmit}
                  variant="outline"
                >
                  <IconX size={16} />
                </Button>
              </form>
            )}
          </div>

          <div className="flex gap-2">
            <button
              className="shrink-0 grow-0"
              onClick={() => handleEditClick(item.id)}
            >
              <IconEdit
                className="text-muted-foreground hover:text-primary"
                size={18}
              />
            </button>
            <DeleteChecklistItemButton
              checklistItemId={item.id}
              taskId={taskId}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
