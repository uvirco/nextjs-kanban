"use client";
import { useState, useEffect } from "react";
import { IconX, IconCheck, IconEdit, IconPlus } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Department } from "@/types/types";

interface EditOverviewFormProps {
  epic: any;
  departments: Department[];
  goals: any[];
  stakeholders: any[];
  onSave: (data: any) => void;
  onCancel: () => void;
}

export default function EditOverviewForm({
  epic,
  departments,
  goals = [],
  stakeholders = [],
  onSave,
  onCancel,
}: EditOverviewFormProps) {
  const [formData, setFormData] = useState({
    title: epic.title || "",
    description: epic.description || "",
    priority: epic.priority ? epic.priority.toUpperCase() : "",
    riskLevel: epic.riskLevel ? epic.riskLevel.toUpperCase() : "",
    dueDate: epic.dueDate ? new Date(epic.dueDate).toISOString().split('T')[0] : "",
    departmentId: epic.departmentId || "",
  });
  const [currentGoals, setCurrentGoals] = useState<any[]>(goals);
  const [currentStakeholders, setCurrentStakeholders] = useState<any[]>(stakeholders);
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [newStakeholderEmail, setNewStakeholderEmail] = useState("");
  const [newStakeholderType, setNewStakeholderType] = useState("stakeholder");
  const [isAddingStakeholder, setIsAddingStakeholder] = useState(false);

  const handleAddGoal = () => {
    if (newGoalTitle.trim()) {
      const newGoal = {
        id: `temp-${Date.now()}`,
        title: newGoalTitle.trim(),
        description: "",
        isAchieved: false,
        createdAt: new Date().toISOString(),
      };
      setCurrentGoals([...currentGoals, newGoal]);
      setNewGoalTitle("");
      setIsAddingGoal(false);
    }
  };

  const handleRemoveGoal = (goalId: string) => {
    setCurrentGoals(currentGoals.filter(g => g.id !== goalId));
  };

  const handleAddStakeholder = () => {
    if (newStakeholderEmail.trim()) {
      const newStakeholder = {
        id: `temp-${Date.now()}`,
        user: { email: newStakeholderEmail.trim() },
        stakeholderType: newStakeholderType,
        notificationPreference: "email",
        createdAt: new Date().toISOString(),
      };
      setCurrentStakeholders([...currentStakeholders, newStakeholder]);
      setNewStakeholderEmail("");
      setNewStakeholderType("stakeholder");
      setIsAddingStakeholder(false);
    }
  };

  const handleRemoveStakeholder = (stakeholderId: string) => {
    setCurrentStakeholders(currentStakeholders.filter(s => s.id !== stakeholderId));
  };

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
        onSave({ ...updatedEpic, goals: currentGoals, stakeholders: currentStakeholders });
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

      {/* Goals Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-white text-base font-semibold">Goals</Label>
          {!isAddingGoal && (
            <Button
              type="button"
              onClick={() => setIsAddingGoal(true)}
              variant="outline"
              size="sm"
              className="text-zinc-300 border-zinc-600 hover:bg-zinc-700"
            >
              <IconPlus size={16} className="mr-2" />
              Add Goal
            </Button>
          )}
        </div>

        {/* Add Goal Input */}
        {isAddingGoal && (
          <div className="flex gap-2">
            <Input
              value={newGoalTitle}
              onChange={(e) => setNewGoalTitle(e.target.value)}
              placeholder="Enter goal title..."
              className="bg-zinc-700 border-zinc-600 text-white flex-1"
              onKeyPress={(e) => e.key === 'Enter' && handleAddGoal()}
            />
            <Button
              type="button"
              onClick={handleAddGoal}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <IconCheck size={16} />
            </Button>
            <Button
              type="button"
              onClick={() => {
                setIsAddingGoal(false);
                setNewGoalTitle("");
              }}
              variant="outline"
              size="sm"
              className="text-zinc-300 border-zinc-600 hover:bg-zinc-700"
            >
              <IconX size={16} />
            </Button>
          </div>
        )}

        {/* Current Goals */}
        {currentGoals.length > 0 && (
          <div className="space-y-2">
            {currentGoals.map((goal) => (
              <div key={goal.id} className="flex items-center justify-between bg-zinc-700 rounded p-3">
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full ${goal.isAchieved ? 'bg-green-500' : 'bg-zinc-500'}`} />
                  <span className="text-white">{goal.title}</span>
                </div>
                <Button
                  type="button"
                  onClick={() => handleRemoveGoal(goal.id)}
                  variant="ghost"
                  size="sm"
                  className="text-red-400 hover:text-red-300 hover:bg-red-900"
                >
                  <IconX size={14} />
                </Button>
              </div>
            ))}
          </div>
        )}

        {currentGoals.length === 0 && !isAddingGoal && (
          <p className="text-zinc-500 text-sm">No goals set for this epic</p>
        )}
      </div>

      {/* Stakeholders Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-white text-base font-semibold">Stakeholders</Label>
          {!isAddingStakeholder && (
            <Button
              type="button"
              onClick={() => setIsAddingStakeholder(true)}
              variant="outline"
              size="sm"
              className="text-zinc-300 border-zinc-600 hover:bg-zinc-700"
            >
              <IconPlus size={16} className="mr-2" />
              Add Stakeholder
            </Button>
          )}
        </div>

        {/* Add Stakeholder Input */}
        {isAddingStakeholder && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <Input
              value={newStakeholderEmail}
              onChange={(e) => setNewStakeholderEmail(e.target.value)}
              placeholder="Email address..."
              className="bg-zinc-700 border-zinc-600 text-white"
              onKeyPress={(e) => e.key === 'Enter' && handleAddStakeholder()}
            />
            <Select
              value={newStakeholderType}
              onValueChange={setNewStakeholderType}
            >
              <SelectTrigger className="bg-zinc-700 border-zinc-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sponsor">Sponsor</SelectItem>
                <SelectItem value="stakeholder">Stakeholder</SelectItem>
                <SelectItem value="reviewer">Reviewer</SelectItem>
                <SelectItem value="approver">Approver</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-1">
              <Button
                type="button"
                onClick={handleAddStakeholder}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 flex-1"
              >
                <IconCheck size={16} />
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setIsAddingStakeholder(false);
                  setNewStakeholderEmail("");
                  setNewStakeholderType("stakeholder");
                }}
                variant="outline"
                size="sm"
                className="text-zinc-300 border-zinc-600 hover:bg-zinc-700"
              >
                <IconX size={16} />
              </Button>
            </div>
          </div>
        )}

        {/* Current Stakeholders */}
        {currentStakeholders.length > 0 && (
          <div className="space-y-2">
            {currentStakeholders.map((stakeholder) => (
              <div key={stakeholder.id} className="flex items-center justify-between bg-zinc-700 rounded p-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-zinc-600 rounded-full flex items-center justify-center text-xs font-medium text-white">
                    {(stakeholder.user?.name || stakeholder.user?.email || "?")[0].toUpperCase()}
                  </div>
                  <div>
                    <span className="text-white text-sm">
                      {stakeholder.user?.name || stakeholder.user?.email}
                    </span>
                    <div className="text-xs text-zinc-400 capitalize">
                      {stakeholder.stakeholderType}
                    </div>
                  </div>
                </div>
                <Button
                  type="button"
                  onClick={() => handleRemoveStakeholder(stakeholder.id)}
                  variant="ghost"
                  size="sm"
                  className="text-red-400 hover:text-red-300 hover:bg-red-900"
                >
                  <IconX size={14} />
                </Button>
              </div>
            ))}
          </div>
        )}

        {currentStakeholders.length === 0 && !isAddingStakeholder && (
          <p className="text-zinc-500 text-sm">No stakeholders assigned</p>
        )}
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