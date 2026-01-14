"use client";
import React, { useState } from "react";
import { toast } from "sonner";
import { handleCreateTask } from "@/server-actions/TaskServerActions";
import { TaskCreationData, Priority, RiskLevel } from "@/types/types";
import { IconPlus } from "@tabler/icons-react";
import { Input } from "@nextui-org/input";
import { Button } from "@nextui-org/button";
import { Select, SelectItem } from "@nextui-org/select";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@nextui-org/modal";
import RichTextEditor from "@/ui/RichTextEditor";

interface CreateTaskModalProps {
  boardId: string;
  columnId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  parentTaskId?: string; // For epic subtasks
}

export default function CreateTaskModal({
  boardId,
  columnId,
  isOpen,
  onClose,
  onSuccess,
  parentTaskId,
}: CreateTaskModalProps) {
  const [formData, setFormData] = useState<TaskCreationData>({
    boardId,
    columnId,
    parentTaskId,
    taskTitle: "",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name: string, value: string | Priority | RiskLevel) => {
    if (value === "") {
      setFormData({ ...formData, [name]: undefined });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleNumberChange = (name: string, value: string) => {
    const numValue = value === "" ? undefined : parseFloat(value);
    setFormData({ ...formData, [name]: numValue });
  };

  const handleDescriptionChange = (content: string) => {
    setFormData({ ...formData, description: content });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await handleCreateTask(formData);

      if (response.success) {
        toast.success("Task Created Successfully");
        // Reset form
        setFormData({
          boardId,
          columnId,
          taskTitle: "",
          description: "",
        });
        onClose();
        onSuccess?.();
      } else {
        toast.error(response.message);
        setError(response.message);
      }
    } catch (err) {
      console.error("Task creation error:", err);
      toast.error("Failed to create task");
      setError("An unexpected error occurred");
    }

    setIsSubmitting(false);
  };

  const resetForm = () => {
    setFormData({
      boardId,
      columnId,
      parentTaskId,
      taskTitle: "",
      description: "",
    });
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="4xl"
      scrollBehavior="inside"
      isDismissable={false}
      classNames={{
        base: "bg-background border border-border text-foreground dark",
        header: "border-b border-border bg-background/50 backdrop-blur-md",
        footer: "border-t border-border bg-background/50 backdrop-blur-md",
        closeButton: "hover:bg-accent hover:text-accent-foreground",
      }}
    >
      <ModalContent>
        <form onSubmit={handleSubmit}>
          <ModalHeader className="flex items-center gap-2">
            <IconPlus size={24} />
            Create New Task
          </ModalHeader>

          <ModalBody className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Basic Information</h3>

              <Input
                label="Task Title"
                placeholder="Enter task title..."
                name="taskTitle"
                value={formData.taskTitle}
                onChange={handleChange}
                isRequired
                isInvalid={!!error}
                errorMessage={error}
                autoFocus
              />

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Description
                </label>
                <RichTextEditor
                  content={formData.description || ""}
                  onChange={handleDescriptionChange}
                  placeholder="Enter task description..."
                  className="min-h-[200px]"
                />
              </div>
            </div>

            {/* Project Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Project Details</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Priority"
                  placeholder="Select priority"
                  selectedKeys={formData.priority ? [formData.priority] : []}
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as Priority | undefined;
                    if (selected) {
                      handleSelectChange("priority", selected);
                    } else {
                      // Clear the selection if nothing is selected
                      handleSelectChange("priority", "");
                    }
                  }}
                  classNames={{
                    trigger: "bg-background border-border text-foreground",
                    listbox: "bg-background border-border",
                    popoverContent: "bg-background",
                  }}
                >
                  <SelectItem key="LOW" value="LOW" className="bg-popover text-popover-foreground hover:bg-accent hover:text-accent-foreground">Low</SelectItem>
                  <SelectItem key="MEDIUM" value="MEDIUM" className="bg-popover text-popover-foreground hover:bg-accent hover:text-accent-foreground">Medium</SelectItem>
                  <SelectItem key="HIGH" value="HIGH" className="bg-popover text-popover-foreground hover:bg-accent hover:text-accent-foreground">High</SelectItem>
                  <SelectItem key="CRITICAL" value="CRITICAL" className="bg-popover text-popover-foreground hover:bg-accent hover:text-accent-foreground">Critical</SelectItem>
                </Select>

                <Select
                  label="Risk Level"
                  placeholder="Select risk level"
                  selectedKeys={formData.riskLevel ? [formData.riskLevel] : []}
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as RiskLevel | undefined;
                    if (selected) {
                      handleSelectChange("riskLevel", selected);
                    } else {
                      // Clear the selection if nothing is selected
                      handleSelectChange("riskLevel", "");
                    }
                  }}
                  classNames={{
                    trigger: "bg-background border-border text-foreground",
                    listbox: "bg-background border-border",
                    popoverContent: "bg-background",
                  }}
                >
                  <SelectItem key="LOW" value="LOW" className="bg-popover text-popover-foreground hover:bg-accent hover:text-accent-foreground">Low</SelectItem>
                  <SelectItem key="MEDIUM" value="MEDIUM" className="bg-popover text-popover-foreground hover:bg-accent hover:text-accent-foreground">Medium</SelectItem>
                  <SelectItem key="HIGH" value="HIGH" className="bg-popover text-popover-foreground hover:bg-accent hover:text-accent-foreground">High</SelectItem>
                </Select>

                <Input
                  label="Story Points"
                  placeholder="e.g., 3, 5, 8"
                  type="number"
                  min="1"
                  value={formData.storyPoints?.toString() || ""}
                  onChange={(e) => handleNumberChange("storyPoints", e.target.value)}
                />

                <Input
                  label="Estimated Effort (hours)"
                  placeholder="e.g., 16, 24"
                  type="number"
                  min="0"
                  step="0.5"
                  value={formData.estimatedEffort?.toString() || ""}
                  onChange={(e) => handleNumberChange("estimatedEffort", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Start Date"
                  type="date"
                  value={formData.startDate || ""}
                  onChange={(e) => handleChange(e)}
                  name="startDate"
                />

                <Input
                  label="Due Date"
                  type="date"
                  value={formData.dueDate || ""}
                  onChange={(e) => handleChange(e)}
                  name="dueDate"
                />
              </div>

              <Input
                label="Acceptance Criteria"
                placeholder="Define when this task is complete..."
                value={formData.acceptanceCriteria || ""}
                onChange={handleChange}
                name="acceptanceCriteria"
              />
            </div>
          </ModalBody>

          <ModalFooter>
            <Button
              type="button"
              variant="flat"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              color="primary"
              isLoading={isSubmitting}
              disabled={!formData.taskTitle.trim()}
            >
              <IconPlus size={16} />
              Create Task
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}