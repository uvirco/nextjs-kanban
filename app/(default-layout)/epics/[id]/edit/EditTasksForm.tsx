"use client";
import { useState } from "react";
import { IconX, IconCheck, IconSettings } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface EditTasksFormProps {
  epic: any;
  onSave: (data: any) => void;
  onCancel: () => void;
}

export default function EditTasksForm({
  epic,
  onSave,
  onCancel,
}: EditTasksFormProps) {
  const [formData, setFormData] = useState({
    defaultTaskPriority: epic.defaultTaskPriority || "MEDIUM",
    autoAssignOwner: epic.autoAssignOwner || false,
    requireAcceptanceCriteria: epic.requireAcceptanceCriteria || false,
    enableTimeTracking: epic.enableTimeTracking || false,
    defaultTaskTemplate: epic.defaultTaskTemplate || "",
    workflowAutomation: epic.workflowAutomation || {
      autoProgressOnSubtasks: false,
      notifyOnBlockers: true,
      autoArchiveCompleted: false,
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(`/api/epics/${epic.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          defaultTaskPriority: formData.defaultTaskPriority,
          autoAssignOwner: formData.autoAssignOwner,
          requireAcceptanceCriteria: formData.requireAcceptanceCriteria,
          enableTimeTracking: formData.enableTimeTracking,
          defaultTaskTemplate: formData.defaultTaskTemplate,
          workflowAutomation: formData.workflowAutomation,
        }),
      });

      if (response.ok) {
        const updatedEpic = await response.json();
        onSave(updatedEpic);
      } else {
        const errorData = await response.json();
        console.error("Failed to update epic:", errorData);
        alert(`Failed to update epic: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error updating epic:", error);
      alert(`Error updating epic: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Task Settings */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Task Configuration</h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="defaultPriority" className="text-white">Default Task Priority</Label>
            <Select
              value={formData.defaultTaskPriority}
              onValueChange={(value) => setFormData({ ...formData, defaultTaskPriority: value })}
            >
              <SelectTrigger className="bg-zinc-800 border-zinc-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LOW">Low</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="CRITICAL">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="template" className="text-white">Default Task Template</Label>
            <Input
              id="template"
              value={formData.defaultTaskTemplate}
              onChange={(e) => setFormData({ ...formData, defaultTaskTemplate: e.target.value })}
              className="bg-zinc-800 border-zinc-600 text-white"
              placeholder="e.g., Feature Implementation"
            />
          </div>
        </div>
      </div>

      {/* Automation Settings */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Automation & Workflow</h3>

        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="autoAssign"
              checked={formData.autoAssignOwner}
              onCheckedChange={(checked) => setFormData({ ...formData, autoAssignOwner: checked })}
            />
            <Label htmlFor="autoAssign" className="text-zinc-300">
              Auto-assign epic owner to new tasks
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="requireCriteria"
              checked={formData.requireAcceptanceCriteria}
              onCheckedChange={(checked) => setFormData({ ...formData, requireAcceptanceCriteria: checked })}
            />
            <Label htmlFor="requireCriteria" className="text-zinc-300">
              Require acceptance criteria for all tasks
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="timeTracking"
              checked={formData.enableTimeTracking}
              onCheckedChange={(checked) => setFormData({ ...formData, enableTimeTracking: checked })}
            />
            <Label htmlFor="timeTracking" className="text-zinc-300">
              Enable time tracking for tasks
            </Label>
          </div>
        </div>
      </div>

      {/* Workflow Automation */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Advanced Automation</h3>

        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="autoProgress"
              checked={formData.workflowAutomation.autoProgressOnSubtasks}
              onCheckedChange={(checked) => setFormData({
                ...formData,
                workflowAutomation: { ...formData.workflowAutomation, autoProgressOnSubtasks: checked }
              })}
            />
            <Label htmlFor="autoProgress" className="text-zinc-300">
              Auto-progress parent task when all subtasks are complete
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="notifyBlockers"
              checked={formData.workflowAutomation.notifyOnBlockers}
              onCheckedChange={(checked) => setFormData({
                ...formData,
                workflowAutomation: { ...formData.workflowAutomation, notifyOnBlockers: checked }
              })}
            />
            <Label htmlFor="notifyBlockers" className="text-zinc-300">
              Notify stakeholders when tasks are marked as blocked
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="autoArchive"
              checked={formData.workflowAutomation.autoArchiveCompleted}
              onCheckedChange={(checked) => setFormData({
                ...formData,
                workflowAutomation: { ...formData.workflowAutomation, autoArchiveCompleted: checked }
              })}
            />
            <Label htmlFor="autoArchive" className="text-zinc-300">
              Auto-archive completed tasks after 30 days
            </Label>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="text-zinc-300 border-zinc-600 hover:bg-zinc-700"
        >
          <IconX size={16} className="mr-2" />
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <IconCheck size={16} className="mr-2" />
          Save Settings
        </Button>
      </div>
    </form>
  );
}