"use client";
import { useState, useEffect } from "react";
import { IconX, IconCheck, IconEdit } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Department } from "@/types/types";

interface EditOverviewFormProps {
  epic: any;
  departments: Department[];
  onSave: (data: any) => void;
  onCancel: () => void;
}

export default function EditOverviewForm({
  epic,
  departments,
  onSave,
  onCancel,
}: EditOverviewFormProps) {
  const [formData, setFormData] = useState({
    title: epic.title || "",
    description: epic.description || "",
    priority: epic.priority ? epic.priority.toUpperCase() : "",
    riskLevel: epic.riskLevel ? epic.riskLevel.toUpperCase() : "",
    dueDate: epic.dueDate ? new Date(epic.dueDate).toISOString().split('T')[0] : "",
    departmentId: epic.departmentId || "none",
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
          title: formData.title,
          description: formData.description,
          priority: formData.priority,
          riskLevel: formData.riskLevel,
          dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
          departmentId: formData.departmentId === "none" ? null : formData.departmentId || null,
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
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title" className="text-white">Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="bg-zinc-800 border-zinc-600 text-white"
          required
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description" className="text-white">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="bg-zinc-800 border-zinc-600 text-white min-h-[100px]"
          placeholder="Enter epic description..."
        />
      </div>

      {/* Priority and Risk Level */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="priority" className="text-white">Priority</Label>
          <Select
            value={formData.priority}
            onValueChange={(value) => setFormData({ ...formData, priority: value })}
          >
            <SelectTrigger className="bg-zinc-800 border-zinc-600 text-white">
              <SelectValue placeholder="Select priority" />
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
          <Label htmlFor="riskLevel" className="text-white">Risk Level</Label>
          <Select
            value={formData.riskLevel}
            onValueChange={(value) => setFormData({ ...formData, riskLevel: value })}
          >
            <SelectTrigger className="bg-zinc-800 border-zinc-600 text-white">
              <SelectValue placeholder="Select risk level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="LOW">Low</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Due Date and Department */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="dueDate" className="text-white">Due Date</Label>
          <Input
            id="dueDate"
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            className="bg-zinc-800 border-zinc-600 text-white"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="department" className="text-white">Department</Label>
          <Select
            value={formData.departmentId || "none"}
            onValueChange={(value) => setFormData({ ...formData, departmentId: value === "none" ? "" : value })}
          >
            <SelectTrigger className="bg-zinc-800 border-zinc-600 text-white">
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No Department</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept.id} value={dept.id}>
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
          Save Changes
        </Button>
      </div>
    </form>
  );
}