'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { IconPlus, IconX, IconCheck, IconTrash } from '@tabler/icons-react';

interface Epic {
  id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  department_id: string;
  start_date: string;
  end_date: string;
  stakeholders: any[];
  members: any[];
  goals?: any[];
}

interface Stakeholder {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  type: string;
}

interface EditOverviewFormProps {
  epic: Epic;
  departments: any[];
  stakeholders: Stakeholder[];
  onSave: (data: any) => void;
  onCancel: () => void;
}

export default function EditOverviewForm({
  epic,
  departments,
  stakeholders,
  onSave,
  onCancel
}: EditOverviewFormProps) {
  const [formData, setFormData] = useState({
    title: epic.title || '',
    description: epic.description || '',
    priority: epic.priority || 'medium',
    status: epic.status || 'planning',
    department_id: epic.department_id || '',
    start_date: epic.start_date || '',
    end_date: epic.end_date || '',
  });

  const [currentStakeholders, setCurrentStakeholders] = useState<Stakeholder[]>(stakeholders);
  const [newStakeholderEmail, setNewStakeholderEmail] = useState('');
  const [newStakeholderType, setNewStakeholderType] = useState('viewer');
  const [isAddingStakeholder, setIsAddingStakeholder] = useState(false);

  // Goals state
  const [goals, setGoals] = useState<any[]>(epic.goals || []);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [newGoal, setNewGoal] = useState({ title: '', description: '' });

  const handleAddStakeholder = async () => {
    if (!newStakeholderEmail.trim()) return;

    try {
      // First, find or create the user
      const userResponse = await fetch('/api/users/find-or-create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newStakeholderEmail }),
      });

      if (!userResponse.ok) {
        console.error('Failed to find/create user');
        return;
      }

      const userData = await userResponse.json();

      // Add stakeholder to epic
      const stakeholderResponse = await fetch(`/api/epics/${epic.id}/stakeholders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userData.id,
          type: newStakeholderType,
        }),
      });

      if (stakeholderResponse.ok) {
        const newStakeholder = await stakeholderResponse.json();
        setCurrentStakeholders([...currentStakeholders, newStakeholder]);
        setNewStakeholderEmail('');
        setNewStakeholderType('viewer');
        setIsAddingStakeholder(false);
      }
    } catch (error) {
      console.error('Failed to add stakeholder:', error);
    }
  };

  const handleRemoveStakeholder = async (stakeholderId: string) => {
    try {
      const response = await fetch(`/api/epics/${epic.id}/stakeholders/${stakeholderId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setCurrentStakeholders(currentStakeholders.filter(s => s.id !== stakeholderId));
      }
    } catch (error) {
      console.error('Failed to remove stakeholder:', error);
    }
  };

  // Goal management functions
  const handleAddGoal = () => {
    if (newGoal.title.trim()) {
      const goal = {
        id: Date.now().toString(), // Temporary ID for new goals
        title: newGoal.title,
        description: newGoal.description,
        status: 'pending',
        priority: 'medium',
        created_at: new Date().toISOString(),
      };
      setGoals([...goals, goal]);
      setNewGoal({ title: '', description: '' });
      setShowAddGoal(false);
    }
  };

  const handleDeleteGoal = (goalId: string) => {
    setGoals(goals.filter(g => g.id !== goalId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(`/api/epics/${epic.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          goals: goals, // Include goals in the update
        }),
      });

      if (response.ok) {
        const updatedEpic = await response.json();
        onSave(updatedEpic);
      }
    } catch (error) {
      console.error('Failed to update epic:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Epic Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="title" className="text-zinc-300">Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="bg-zinc-800 border-zinc-600 text-white"
            required
          />
        </div>

        <div>
          <Label htmlFor="priority" className="text-zinc-300">Priority</Label>
          <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
            <SelectTrigger className="bg-zinc-800 border-zinc-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="status" className="text-zinc-300">Status</Label>
          <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
            <SelectTrigger className="bg-zinc-800 border-zinc-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="planning">Planning</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="on-hold">On Hold</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="department" className="text-zinc-300">Department</Label>
          <Select value={formData.department_id} onValueChange={(value) => setFormData({ ...formData, department_id: value })}>
            <SelectTrigger className="bg-zinc-800 border-zinc-600 text-white">
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              {departments.map((dept) => (
                <SelectItem key={dept.id} value={dept.id}>
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="start_date" className="text-zinc-300">Start Date</Label>
          <Input
            id="start_date"
            type="date"
            value={formData.start_date}
            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
            className="bg-zinc-800 border-zinc-600 text-white"
          />
        </div>

        <div>
          <Label htmlFor="end_date" className="text-zinc-300">End Date</Label>
          <Input
            id="end_date"
            type="date"
            value={formData.end_date}
            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
            className="bg-zinc-800 border-zinc-600 text-white"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description" className="text-zinc-300">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="bg-zinc-800 border-zinc-600 text-white min-h-[100px]"
        />
      </div>

      {/* Goals Section */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <Label className="text-zinc-300">Goals</Label>
          <Button
            type="button"
            onClick={() => setShowAddGoal(true)}
            variant="outline"
            size="sm"
            className="text-zinc-300 border-zinc-600 hover:bg-zinc-700"
          >
            <IconPlus size={14} className="mr-1" />
            Add Goal
          </Button>
        </div>

        {/* Goals List */}
        <div className="space-y-3">
          {goals.map((goal) => (
            <div key={goal.id} className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-white">{goal.title}</h4>
                  {goal.description && (
                    <p className="text-sm text-zinc-400 mt-1">{goal.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`px-2 py-1 text-xs rounded ${
                      goal.status === 'completed' ? 'bg-green-900/30 text-green-400' :
                      goal.status === 'in-progress' ? 'bg-blue-900/30 text-blue-400' :
                      'bg-zinc-700 text-zinc-400'
                    }`}>
                      {goal.status}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded ${
                      goal.priority === 'high' ? 'bg-red-900/30 text-red-400' :
                      goal.priority === 'medium' ? 'bg-yellow-900/30 text-yellow-400' :
                      'bg-zinc-700 text-zinc-400'
                    }`}>
                      {goal.priority}
                    </span>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteGoal(goal.id)}
                  className="text-zinc-400 hover:text-red-400 hover:bg-red-900/20"
                >
                  <IconTrash size={14} />
                </Button>
              </div>
            </div>
          ))}
          {goals.length === 0 && (
            <p className="text-zinc-500 text-sm text-center py-4">
              No goals defined yet. Add your first goal! 🎯
            </p>
          )}
        </div>

        {/* Add Goal Modal */}
        {showAddGoal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-zinc-800 rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-white mb-4">Add New Goal</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="goalTitle" className="text-white">Goal Title</Label>
                  <Input
                    id="goalTitle"
                    value={newGoal.title}
                    onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                    className="bg-zinc-700 border-zinc-600 text-white"
                    placeholder="Enter goal title"
                  />
                </div>
                <div>
                  <Label htmlFor="goalDescription" className="text-white">Description (Optional)</Label>
                  <Textarea
                    id="goalDescription"
                    value={newGoal.description}
                    onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                    className="bg-zinc-700 border-zinc-600 text-white"
                    placeholder="Describe the goal"
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddGoal(false)}
                  className="text-zinc-300 border-zinc-600"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleAddGoal}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Add Goal
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stakeholders Section */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <Label className="text-zinc-300">Stakeholders</Label>
          <Button
            type="button"
            onClick={() => setIsAddingStakeholder(!isAddingStakeholder)}
            variant="outline"
            size="sm"
            className="text-zinc-300 border-zinc-600 hover:bg-zinc-700"
          >
            <IconPlus size={14} className="mr-1" />
            Add Stakeholder
          </Button>
        </div>

        {isAddingStakeholder && (
          <div className="bg-zinc-800 border border-zinc-700 rounded p-3 mb-3">
            <div className="flex gap-2 mb-2">
              <Input
                placeholder="Email address"
                value={newStakeholderEmail}
                onChange={(e) => setNewStakeholderEmail(e.target.value)}
                className="bg-zinc-700 border-zinc-600 text-white flex-1"
              />
              <Select value={newStakeholderType} onValueChange={setNewStakeholderType}>
                <SelectTrigger className="bg-zinc-700 border-zinc-600 text-white w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewer">Viewer</SelectItem>
                  <SelectItem value="contributor">Contributor</SelectItem>
                  <SelectItem value="approver">Approver</SelectItem>
                  <SelectItem value="sponsor">Sponsor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                onClick={handleAddStakeholder}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <IconCheck size={14} className="mr-1" />
                Add
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setIsAddingStakeholder(false);
                  setNewStakeholderEmail('');
                  setNewStakeholderType('viewer');
                }}
                variant="outline"
                size="sm"
                className="text-zinc-300 border-zinc-600"
              >
                <IconX size={14} className="mr-1" />
                Cancel
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {currentStakeholders.map((stakeholder) => (
            <div key={stakeholder.id} className="flex items-center justify-between bg-zinc-800 border border-zinc-700 rounded p-3">
              <div>
                <p className="text-white font-medium">
                  {stakeholder.user.name || stakeholder.user.email}
                </p>
                <p className="text-zinc-400 text-sm">{stakeholder.user.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-zinc-700 px-2 py-1 rounded">
                  {stakeholder.type}
                </span>
                <Button
                  type="button"
                  onClick={() => handleRemoveStakeholder(stakeholder.id)}
                  variant="outline"
                  size="sm"
                  className="text-red-400 border-red-600 hover:bg-red-600 hover:text-white"
                >
                  <IconX size={14} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t border-zinc-700">
        <Button
          type="button"
          onClick={onCancel}
          variant="outline"
          className="text-zinc-300 border-zinc-600 hover:bg-zinc-700"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700"
        >
          Save Changes
        </Button>
      </div>
    </form>
  );
}