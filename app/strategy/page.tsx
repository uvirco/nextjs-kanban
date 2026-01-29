"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { supabase } from "@/lib/supabase";
import { Button } from "@nextui-org/button";
import { Input } from "@nextui-org/input";
import { Select, SelectItem } from "@nextui-org/select";
import { Textarea } from "@nextui-org/input";
import { Chip } from "@nextui-org/chip";
import {
  IconPlus,
  IconChevronUp,
  IconChevronDown,
  IconSearch,
} from "@tabler/icons-react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/modal";
import { toast } from "sonner";

interface StrategicGoal {
  id: string;
  title: string;
  description: string | null;
  fiscal_year: string | null;
  target_date: string | null;
  status: "active" | "achieved" | "on_hold" | "abandoned";
  progress: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  user?: { id: string; name: string; email: string };
  linkedTasksCount?: number;
}

export default function StrategyPage() {
  const { data: session } = useSession();
  const [goals, setGoals] = useState<StrategicGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<StrategicGoal | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterFiscalYear, setFilterFiscalYear] = useState("");
  const [sortColumn, setSortColumn] = useState("target_date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    fiscal_year: new Date().getFullYear().toString(),
    target_date: "",
    status: "active" as const,
    progress: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    setLoading(true);
    try {
      // Fetch goals
      const { data: goalsData, error: goalsError } = await supabase
        .from("StrategicGoal")
        .select("*")
        .order("target_date", { ascending: false });

      if (goalsError) throw goalsError;

      // Fetch user data for created_by
      const { data: usersData } = await supabase
        .from("User")
        .select("id, name, email");

      const usersMap = new Map(usersData?.map((u) => [u.id, u]) || []);

      // Fetch linked tasks count for each goal
      const enrichedGoals = await Promise.all(
        (goalsData || []).map(async (goal) => {
          const { count, error: countError } = await supabase
            .from("Task")
            .select("id", { count: "exact", head: true })
            .eq("strategicGoalId", goal.id);

          return {
            ...goal,
            user: goal.created_by ? usersMap.get(goal.created_by) : undefined,
            linkedTasksCount: countError ? 0 : count || 0,
          };
        })
      );

      setGoals(enrichedGoals);
    } catch (err) {
      console.error("Error fetching goals:", err);
      toast.error("Failed to load strategic goals");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.target_date) newErrors.target_date = "Target date is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      // Get user ID from email
      let userId = null;
      if (session?.user?.email) {
        const { data: userData } = await supabase
          .from("User")
          .select("id")
          .eq("email", session.user.email)
          .single();

        if (userData) {
          userId = userData.id;
        }
      }

      const goalData = {
        title: formData.title,
        description: formData.description || null,
        fiscal_year: formData.fiscal_year || null,
        target_date: formData.target_date,
        status: formData.status,
        progress: formData.progress,
        created_by: userId,
        updated_at: new Date().toISOString(),
      };

      if (editingGoal) {
        const { error } = await supabase
          .from("StrategicGoal")
          .update(goalData)
          .eq("id", editingGoal.id);

        if (error) throw error;
        toast.success("Goal updated successfully");
      } else {
        const { error } = await supabase
          .from("StrategicGoal")
          .insert([goalData]);

        if (error) throw error;
        toast.success("Goal created successfully");
      }

      setIsModalOpen(false);
      setEditingGoal(null);
      resetForm();
      fetchGoals();
    } catch (err) {
      console.error("Error saving goal:", err);
      toast.error("Failed to save goal");
    }
  };

  const handleDelete = async (goalId: string) => {
    if (!window.confirm("Are you sure you want to delete this goal?")) return;

    try {
      const { error } = await supabase
        .from("StrategicGoal")
        .delete()
        .eq("id", goalId);

      if (error) throw error;
      toast.success("Goal deleted");
      fetchGoals();
    } catch (err) {
      console.error("Error deleting goal:", err);
      toast.error("Failed to delete goal");
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      fiscal_year: new Date().getFullYear().toString(),
      target_date: "",
      status: "active",
      progress: 0,
    });
    setErrors({});
  };

  const openModal = (goal?: StrategicGoal) => {
    if (goal) {
      setEditingGoal(goal);
      setFormData({
        title: goal.title,
        description: goal.description || "",
        fiscal_year: goal.fiscal_year || new Date().getFullYear().toString(),
        target_date: goal.target_date || "",
        status: goal.status,
        progress: goal.progress,
      });
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const filteredGoals = goals
    .filter((g) => {
      if (searchTerm && !g.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      if (filterStatus && g.status !== filterStatus) return false;
      if (filterFiscalYear && g.fiscal_year !== filterFiscalYear) return false;
      return true;
    })
    .sort((a, b) => {
      let aVal: any = a[sortColumn as keyof StrategicGoal];
      let bVal: any = b[sortColumn as keyof StrategicGoal];

      if (aVal === null || aVal === undefined) aVal = "";
      if (bVal === null || bVal === undefined) bVal = "";

      if (typeof aVal === "string") {
        aVal = aVal.toLowerCase();
        bVal = (bVal as string).toLowerCase();
      }

      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

  const allFiscalYears = [...new Set(goals.map((g) => g.fiscal_year).filter(Boolean))];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-blue-900/40 text-blue-300";
      case "achieved":
        return "bg-green-900/40 text-green-300";
      case "on_hold":
        return "bg-orange-900/40 text-orange-300";
      case "abandoned":
        return "bg-red-900/40 text-red-300";
      default:
        return "bg-zinc-700 text-zinc-300";
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 75) return "bg-green-600";
    if (progress >= 50) return "bg-blue-600";
    if (progress >= 25) return "bg-orange-600";
    return "bg-red-600";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-zinc-400">Loading strategic goals...</p>
      </div>
    );
  }

  return (
    <div className="p-8 min-h-screen bg-zinc-950">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-white">Strategic Goals</h1>
        <Button
          color="primary"
          onClick={() => openModal()}
          startContent={<IconPlus size={20} />}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Add Goal
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-zinc-900 p-6 rounded-lg mb-6 border border-zinc-700">
        <h3 className="text-lg font-semibold mb-4 text-white">Filters</h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            placeholder="Search goals..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            startContent={<IconSearch size={18} className="text-zinc-400" />}
            classNames={{
              input: "text-white bg-zinc-800 placeholder-zinc-500",
              inputWrapper: "bg-zinc-800 border-zinc-700",
            }}
          />

          <Select
            label="Status"
            selectedKeys={filterStatus ? [filterStatus] : []}
            onSelectionChange={(keys) =>
              setFilterStatus(Array.from(keys)[0] as string)
            }
            labelPlacement="outside"
            className="bg-zinc-800"
          >
            <SelectItem key="active">Active</SelectItem>
            <SelectItem key="achieved">Achieved</SelectItem>
            <SelectItem key="on_hold">On Hold</SelectItem>
            <SelectItem key="abandoned">Abandoned</SelectItem>
          </Select>

          <Select
            label="Fiscal Year"
            selectedKeys={filterFiscalYear ? [filterFiscalYear] : []}
            onSelectionChange={(keys) =>
              setFilterFiscalYear(Array.from(keys)[0] as string)
            }
            labelPlacement="outside"
            className="bg-zinc-800"
          >
            {allFiscalYears.map((year) => (
              <SelectItem key={year || ""}>{year}</SelectItem>
            ))}
          </Select>

          <Button
            variant="flat"
            onClick={() => {
              setSearchTerm("");
              setFilterStatus("");
              setFilterFiscalYear("");
            }}
            className="bg-zinc-700 text-white hover:bg-zinc-600 mt-6"
          >
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredGoals.length === 0 ? (
          <div className="col-span-2 text-center py-12 bg-zinc-900 rounded-lg border border-zinc-700">
            <p className="text-zinc-400">No strategic goals found</p>
          </div>
        ) : (
          filteredGoals.map((goal) => (
            <div
              key={goal.id}
              className="bg-zinc-900 rounded-lg border border-zinc-700 p-6 hover:border-zinc-600 transition-colors"
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2">
                    {goal.title}
                  </h3>
                  <div className="flex gap-2 flex-wrap">
                    <Chip
                      variant="flat"
                      className={getStatusColor(goal.status)}
                      size="sm"
                    >
                      {goal.status.replace("_", " ")}
                    </Chip>
                    {goal.fiscal_year && (
                      <Chip
                        variant="flat"
                        className="bg-cyan-900/40 text-cyan-300"
                        size="sm"
                      >
                        {goal.fiscal_year}
                      </Chip>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              {goal.description && (
                <p className="text-sm text-zinc-300 mb-4">{goal.description}</p>
              )}

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-zinc-300">
                    Progress
                  </span>
                  <span className="text-sm font-bold text-cyan-400">
                    {goal.progress}%
                  </span>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${getProgressColor(
                      goal.progress
                    )}`}
                    style={{ width: `${goal.progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Target Date */}
              {goal.target_date && (
                <p className="text-sm text-zinc-400 mb-4">
                  Target: {new Date(goal.target_date).toLocaleDateString()}
                </p>
              )}

              {/* Linked Projects */}
              <div className="text-sm text-zinc-400 mb-4">
                <span className="font-medium text-zinc-300">
                  {goal.linkedTasksCount || 0}
                </span>{" "}
                project{goal.linkedTasksCount !== 1 ? "s" : ""} supporting this goal
              </div>

              {/* Created By */}
              <div className="text-xs text-zinc-500 mb-4">
                Created by {goal.user?.name || goal.created_by || "Unknown"}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="flat"
                  size="sm"
                  className="bg-cyan-900/40 text-cyan-300 hover:bg-cyan-900/60"
                  onClick={() => openModal(goal)}
                >
                  Edit
                </Button>
                <Button
                  variant="flat"
                  size="sm"
                  className="bg-red-900/40 text-red-300 hover:bg-red-900/60"
                  onClick={() => handleDelete(goal.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} size="lg">
        <ModalContent className="bg-zinc-900">
          <ModalHeader className="text-white text-xl font-bold">
            {editingGoal ? "Edit Strategic Goal" : "Add Strategic Goal"}
          </ModalHeader>
          <ModalBody className="space-y-4 text-white">
            <Input
              label="Title *"
              placeholder="Enter goal title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              isInvalid={!!errors.title}
              errorMessage={errors.title}
              className="bg-zinc-800"
            />

            <Textarea
              label="Description"
              placeholder="Enter goal description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="bg-zinc-800"
              minRows={3}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Fiscal Year"
                placeholder="2026"
                value={formData.fiscal_year}
                onChange={(e) =>
                  setFormData({ ...formData, fiscal_year: e.target.value })
                }
                className="bg-zinc-800"
              />

              <Input
                label="Target Date *"
                type="date"
                value={formData.target_date}
                onChange={(e) =>
                  setFormData({ ...formData, target_date: e.target.value })
                }
                isInvalid={!!errors.target_date}
                errorMessage={errors.target_date}
                className="bg-zinc-800"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Status"
                selectedKeys={[formData.status]}
                onSelectionChange={(keys) =>
                  setFormData({
                    ...formData,
                    status: Array.from(keys)[0] as any,
                  })
                }
                className="bg-zinc-800"
              >
                <SelectItem key="active">Active</SelectItem>
                <SelectItem key="achieved">Achieved</SelectItem>
                <SelectItem key="on_hold">On Hold</SelectItem>
                <SelectItem key="abandoned">Abandoned</SelectItem>
              </Select>

              <div>
                <label className="block text-sm font-medium mb-2 text-white">
                  Progress (%)
                </label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.progress.toString()}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      progress: parseInt(e.target.value) || 0,
                    })
                  }
                  className="bg-zinc-800"
                />
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="light"
              onClick={() => setIsModalOpen(false)}
              className="text-zinc-300"
            >
              Cancel
            </Button>
            <Button
              color="primary"
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {editingGoal ? "Update" : "Create"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
