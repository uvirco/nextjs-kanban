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
  IconLayoutList,
  IconNetworkOff,
} from "@tabler/icons-react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/modal";
import { toast } from "sonner";
import GoalHierarchyDiagram from "./components/GoalHierarchyDiagram";

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
  parent_goal_id: string | null;
  user?: { id: string; name: string; email: string };
  linkedTasksCount?: number;
  children?: StrategicGoal[];
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
  const [expandedGoals, setExpandedGoals] = useState<Set<string>>(new Set());
  const [parentGoalId, setParentGoalId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"simplified-diagram" | "drill-down" | "list" | "timeline">("simplified-diagram");
  const [selectedGoal, setSelectedGoal] = useState<StrategicGoal | null>(null);

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

  // Build tree structure from flat goals list
  const buildGoalTree = (goalsData: StrategicGoal[]): StrategicGoal[] => {
    const goalMap = new Map<string, StrategicGoal>();
    
    // Create map of all goals
    goalsData.forEach((goal) => {
      goalMap.set(goal.id, { ...goal, children: [] });
    });

    const rootGoals: StrategicGoal[] = [];

    // Build parent-child relationships
    goalsData.forEach((goal) => {
      const goalInMap = goalMap.get(goal.id)!;
      if (goal.parent_goal_id) {
        const parent = goalMap.get(goal.parent_goal_id);
        if (parent) {
          if (!parent.children) parent.children = [];
          parent.children.push(goalInMap);
        }
      } else {
        rootGoals.push(goalInMap);
      }
    });

    return rootGoals;
  };

  // Count goal level (depth) in hierarchy for indentation
  const countGoalLevel = (goal: StrategicGoal, allGoals: StrategicGoal[]): number => {
    let level = 0;
    let current = goal;
    
    while (current.parent_goal_id) {
      const parent = allGoals.find(g => g.id === current.parent_goal_id);
      if (!parent) break;
      level++;
      current = parent;
    }
    
    return level;
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
        parent_goal_id: parentGoalId || null,
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
    setParentGoalId(null);
    setEditingGoal(null);
  };

  const openModal = (goal?: StrategicGoal, parentGoal?: StrategicGoal) => {
    if (goal) {
      setEditingGoal(goal);
      setParentGoalId(goal.parent_goal_id || null);
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
      if (parentGoal) {
        setParentGoalId(parentGoal.id);
      }
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

  const toggleExpanded = (goalId: string) => {
    const newExpanded = new Set(expandedGoals);
    if (newExpanded.has(goalId)) {
      newExpanded.delete(goalId);
    } else {
      newExpanded.add(goalId);
    }
    setExpandedGoals(newExpanded);
  };

  const renderGoalCard = (goal: StrategicGoal, level: number = 0) => (
    <div key={goal.id} className={`${level > 0 ? "ml-6 mt-2" : ""}`}>
      <div className="bg-zinc-900 rounded-lg border border-zinc-700 p-4 hover:border-zinc-600 transition-colors">
        {/* Horizontal compact layout */}
        <div className="flex items-center gap-4">
          {/* Expand button */}
          <div className="flex-shrink-0">
            {goal.children && goal.children.length > 0 ? (
              <button
                onClick={() => toggleExpanded(goal.id)}
                className="text-cyan-400 hover:text-cyan-300 flex-shrink-0"
              >
                {expandedGoals.has(goal.id) ? (
                  <IconChevronDown size={18} />
                ) : (
                  <IconChevronUp size={18} />
                )}
              </button>
            ) : (
              <div className="w-6" /> // Placeholder for alignment
            )}
          </div>

          {/* Title and status chips */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-sm font-bold text-white truncate">
                {goal.title}
              </h3>
              <div className="flex gap-1 flex-shrink-0">
                <Chip
                  variant="flat"
                  className={getStatusColor(goal.status)}
                  size="sm"
                >
                  {goal.status.replace("_", " ")}
                </Chip>
              </div>
            </div>
            
            {/* Compact info row */}
            <div className="flex items-center gap-3 text-xs text-zinc-400 flex-wrap">
              {goal.fiscal_year && (
                <span className="whitespace-nowrap">FY: {goal.fiscal_year}</span>
              )}
              {goal.target_date && (
                <span className="whitespace-nowrap">
                  Due: {new Date(goal.target_date).toLocaleDateString()}
                </span>
              )}
              {goal.linkedTasksCount ? (
                <span className="whitespace-nowrap text-cyan-300">
                  📊 {goal.linkedTasksCount} project{goal.linkedTasksCount !== 1 ? "s" : ""}
                </span>
              ) : null}
              {goal.children && goal.children.length > 0 && (
                <span className="whitespace-nowrap text-purple-300">
                  ↳ {goal.children.length} sub-goal{goal.children.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>
          </div>

          {/* Progress bar (compact) */}
          <div className="flex-shrink-0 w-20">
            <div className="text-right mb-1">
              <span className="text-xs font-bold text-cyan-400">
                {goal.progress}%
              </span>
            </div>
            <div className="w-full bg-zinc-800 rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full transition-all ${getProgressColor(
                  goal.progress
                )}`}
                style={{ width: `${goal.progress}%` }}
              ></div>
            </div>
          </div>

          {/* Action buttons (compact) */}
          <div className="flex gap-1 flex-shrink-0">
            <Button
              isIconOnly
              size="sm"
              variant="light"
              className="text-cyan-400 hover:text-cyan-300"
              onClick={() => openModal(goal)}
              title="Edit"
            >
              ✏️
            </Button>
            {!goal.parent_goal_id && (
              <Button
                isIconOnly
                size="sm"
                variant="light"
                className="text-purple-400 hover:text-purple-300"
                onClick={() => openModal(undefined, goal)}
                title="Add Sub-goal"
              >
                <IconPlus size={16} />
              </Button>
            )}
            <Button
              isIconOnly
              size="sm"
              variant="light"
              className="text-red-400 hover:text-red-300"
              onClick={() => handleDelete(goal.id)}
              title="Delete"
            >
              🗑️
            </Button>
          </div>
        </div>
      </div>

      {/* Render children if expanded */}
      {goal.children && goal.children.length > 0 && expandedGoals.has(goal.id) && (
        <div className="space-y-2 mt-2">
          {goal.children.map((child) => renderGoalCard(child, level + 1))}
        </div>
      )}
    </div>
  );

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

      {/* View Toggle */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <Button
          variant={viewMode === "simplified-diagram" ? "solid" : "light"}
          className={viewMode === "simplified-diagram" ? "bg-cyan-900/40 text-cyan-300" : "text-zinc-400 hover:text-white"}
          onClick={() => {
            setViewMode("simplified-diagram");
            setSelectedGoal(null);
          }}
          size="sm"
        >
          📊 Diagram
        </Button>
        <Button
          variant={viewMode === "drill-down" ? "solid" : "light"}
          className={viewMode === "drill-down" ? "bg-purple-900/40 text-purple-300" : "text-zinc-400 hover:text-white"}
          onClick={() => setViewMode("drill-down")}
          size="sm"
        >
          🎯 Drill-Down
        </Button>
        <Button
          variant={viewMode === "list" ? "solid" : "light"}
          className={viewMode === "list" ? "bg-blue-900/40 text-blue-300" : "text-zinc-400 hover:text-white"}
          onClick={() => {
            setViewMode("list");
            setSelectedGoal(null);
          }}
          size="sm"
        >
          📋 List
        </Button>
        <Button
          variant={viewMode === "timeline" ? "solid" : "light"}
          className={viewMode === "timeline" ? "bg-orange-900/40 text-orange-300" : "text-zinc-400 hover:text-white"}
          onClick={() => {
            setViewMode("timeline");
            setSelectedGoal(null);
          }}
          size="sm"
        >
          📅 Timeline
        </Button>
      </div>

      {/* Goals View - Multiple Modes */}
      {viewMode === "simplified-diagram" && (
        <div className="space-y-6">
          {filteredGoals.length === 0 ? (
            <div className="text-center py-12 bg-zinc-900 rounded-lg border border-zinc-700">
              <p className="text-zinc-400">No strategic goals found</p>
            </div>
          ) : (
            <>
              <p className="text-xs text-zinc-500">Click on any objective to drill down</p>
              <GoalHierarchyDiagram goals={filteredGoals} onSelectGoal={(goal) => {
                setSelectedGoal(goal);
                setViewMode("drill-down");
              }} />
            </>
          )}
        </div>
      )}

      {viewMode === "drill-down" && (
        <div className="space-y-6">
          {selectedGoal ? (
            <>
              <Button
                variant="light"
                onClick={() => {
                  setSelectedGoal(null);
                  setViewMode("simplified-diagram");
                }}
                size="sm"
                className="text-cyan-400 hover:text-cyan-300"
              >
                ← Back to Diagram
              </Button>
              <div className="bg-zinc-900 rounded-lg border border-zinc-700 p-6">
                <div className="mb-6">
                  <h2 className="text-3xl font-bold text-white mb-2">{selectedGoal.title}</h2>
                  <div className="flex gap-2 flex-wrap">
                    <Chip variant="flat" className={getStatusColor(selectedGoal.status)} size="sm">
                      {selectedGoal.status.replace("_", " ")}
                    </Chip>
                    {selectedGoal.fiscal_year && (
                      <Chip variant="flat" className="bg-cyan-900/40 text-cyan-300" size="sm">
                        FY {selectedGoal.fiscal_year}
                      </Chip>
                    )}
                  </div>
                  {selectedGoal.description && (
                    <p className="text-zinc-300 mt-4">{selectedGoal.description}</p>
                  )}
                </div>
                
                {/* Progress */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-zinc-300">Progress</span>
                    <span className="text-sm font-bold text-cyan-400">{selectedGoal.progress}%</span>
                  </div>
                  <div className="w-full bg-zinc-800 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${getProgressColor(selectedGoal.progress)}`}
                      style={{ width: `${selectedGoal.progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Sub-goals */}
                {selectedGoal.children && selectedGoal.children.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-zinc-700">
                    <h3 className="text-lg font-bold text-white mb-4">Sub-Goals ({selectedGoal.children.length})</h3>
                    <div className="space-y-3">
                      {selectedGoal.children.map((child) => (
                        <div key={child.id} className="bg-zinc-800 rounded p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold text-white">{child.title}</h4>
                            <Chip variant="flat" className={getStatusColor(child.status)} size="sm">
                              {child.progress}%
                            </Chip>
                          </div>
                          {child.description && (
                            <p className="text-sm text-zinc-400 mb-2">{child.description}</p>
                          )}
                          <div className="w-full bg-zinc-700 rounded-full h-1">
                            <div
                              className={`h-1 rounded-full transition-all ${getProgressColor(child.progress)}`}
                              style={{ width: `${child.progress}%` }}
                            ></div>
                          </div>
                          {child.linkedTasksCount ? (
                            <p className="text-xs text-cyan-300 mt-2">📊 {child.linkedTasksCount} project(s)</p>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <p className="text-zinc-400 mb-4">Select an objective from the diagram view to see details</p>
              <Button
                onClick={() => setViewMode("simplified-diagram")}
                variant="light"
                className="text-cyan-400 hover:text-cyan-300"
              >
                Go to Diagram →
              </Button>
            </>
          )}
        </div>
      )}

      {viewMode === "list" && (
        <div className="space-y-6">
          {filteredGoals.length === 0 ? (
            <div className="text-center py-12 bg-zinc-900 rounded-lg border border-zinc-700">
              <p className="text-zinc-400">No strategic goals found</p>
            </div>
          ) : (
            buildGoalTree(filteredGoals).map((goal) => renderGoalCard(goal))
          )}
        </div>
      )}

      {viewMode === "timeline" && (
        <div className="space-y-6">
          {filteredGoals.length === 0 ? (
            <div className="text-center py-12 bg-zinc-900 rounded-lg border border-zinc-700">
              <p className="text-zinc-400">No strategic goals found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Group goals by fiscal year */}
              {Array.from(
                new Set(filteredGoals.map((g) => g.fiscal_year || "No Year"))
              )
                .sort()
                .map((year) => {
                  const yearGoals = filteredGoals.filter(
                    (g) => (g.fiscal_year || "No Year") === year
                  );
                  return (
                    <div key={year} className="bg-zinc-900 rounded-lg border border-zinc-700 p-4">
                      <h3 className="text-lg font-bold text-white mb-4">📅 {year}</h3>
                      <div className="space-y-3">
                        {yearGoals.map((goal) => (
                          <div
                            key={goal.id}
                            className="bg-zinc-800 rounded p-3 border-l-4"
                            style={{
                              borderColor: goal.status === "active"
                                ? "#06b6d4"
                                : goal.status === "achieved"
                                ? "#10b981"
                                : goal.status === "on_hold"
                                ? "#f97316"
                                : "#ef4444",
                            }}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h4 className="font-semibold text-white">{goal.title}</h4>
                                {goal.description && (
                                  <p className="text-sm text-zinc-400 mt-1">{goal.description}</p>
                                )}
                              </div>
                              <div className="text-right">
                                <span className="text-sm font-bold text-cyan-400">{goal.progress}%</span>
                                {goal.target_date && (
                                  <p className="text-xs text-zinc-500 mt-1">
                                    {new Date(goal.target_date).toLocaleDateString()}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        size="lg"
        isDismissable={false}
        isKeyboardDismissDisabled={true}
      >
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

            <Select
              label="Parent Goal (Optional)"
              placeholder="Select a parent goal for hierarchy"
              selectedKeys={parentGoalId ? [parentGoalId] : []}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0] as string | undefined;
                setParentGoalId(selected || null);
              }}
              className="bg-zinc-800"
            >
              {goals
                .filter(g => g.id !== editingGoal?.id) // Exclude self to prevent circular references
                .map((goal) => {
                  // Show goal with indent based on hierarchy level
                  const level = countGoalLevel(goal, goals);
                  const indent = "  ".repeat(level);
                  return (
                    <SelectItem key={goal.id} value={goal.id}>
                      {indent}{goal.title}
                    </SelectItem>
                  );
                })}
            </Select>

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
