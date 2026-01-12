"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { IconLoader, IconPlus, IconX, IconUser } from "@tabler/icons-react";
import RaciMatrixSection from "../RaciMatrixSection";
import GoalSection from "@/ui/GoalSection";
import { Department, FunctionalRole } from "@/types/types";

interface Epic {
  id: string;
  title: string;
  description: string | null;
  priority: string | null;
  businessValue: string | null;
  riskLevel: string | null;
  estimatedEffort: number | null;
  budgetEstimate: number | null;
  strategicAlignment: string | null;
  roiEstimate: number | null;
  stageGate: string | null;
  dueDate: string | null;
  startDate: string | null;
  acceptanceCriteria?: string | null;
  departmentId: string | null;
  column?: {
    id: string;
    title: string;
    boardId: string;
  };
}

interface EpicMember {
  id: string;
  role: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  };
}

interface User {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
}

interface Role {
  id: string;
  name: string;
  description: string | null;
  category: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

interface EditEpicFormProps {
  epic: Epic;
  initialMembers?: EpicMember[];
  initialGoals?: any[];
}

export default function EditEpicForm({
  epic,
  initialMembers = [],
  initialGoals = [],
}: EditEpicFormProps) {
  console.log("EditEpicForm epic.id:", epic.id);
  console.log("EditEpicForm initialGoals:", initialGoals);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [members, setMembers] = useState<EpicMember[]>(initialMembers);
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [roles, setRoles] = useState<FunctionalRole[]>([]);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedRoleCategory, setSelectedRoleCategory] = useState("all");
  const [selectedRaciRoles, setSelectedRaciRoles] = useState<string[]>([]);

  // Track initial state for unsaved changes detection
  const [initialFormDataState] = useState({
    title: epic.title,
    description: epic.description || "",
    departmentId: epic.departmentId || "",
    businessValue: epic.businessValue || "",
    riskLevel: epic.riskLevel || "",
    priority: epic.priority || "",
    effort: epic.estimatedEffort?.toString() || "",
    budgetEstimate: epic.budgetEstimate?.toString() || "",
    strategicAlignment: epic.strategicAlignment || "",
    roiEstimate: epic.roiEstimate?.toString() || "",
    stageGate: epic.stageGate || "",
    dueDate: epic.dueDate
      ? new Date(epic.dueDate).toISOString().split("T")[0]
      : "",
    startDate: epic.startDate
      ? new Date(epic.startDate).toISOString().split("T")[0]
      : "",
    acceptanceCriteria: (epic as any).acceptanceCriteria || "",
  });
  const [initialMembersState] = useState<EpicMember[]>(initialMembers);
  const [initialGoalsState] = useState<any[]>(initialGoals);

  const [formData, setFormData] = useState({
    title: epic.title,
    description: epic.description || "",
    departmentId: epic.departmentId || "",
    businessValue: epic.businessValue || "",
    riskLevel: epic.riskLevel || "",
    priority: epic.priority || "",
    effort: epic.estimatedEffort?.toString() || "",
    budgetEstimate: epic.budgetEstimate?.toString() || "",
    strategicAlignment: epic.strategicAlignment || "",
    roiEstimate: epic.roiEstimate?.toString() || "",
    stageGate: epic.stageGate || "",
    dueDate: epic.dueDate
      ? new Date(epic.dueDate).toISOString().split("T")[0]
      : "",
    startDate: epic.startDate
      ? new Date(epic.startDate).toISOString().split("T")[0]
      : "",
    acceptanceCriteria: (epic as any).acceptanceCriteria || "",
  });

  // (We use acceptanceCriteria as simple DoD text for now)

  const functionalRoles = [
    "Product Manager",
    "Project Manager",
    "Lead Developer",
    "Developer",
    "Designer",
    "UX Designer",
    "QA Engineer",
    "DevOps Engineer",
    "Business Analyst",
    "Technical Writer",
    "Scrum Master",
    "Other",
  ];

  // Fetch users when adding member
  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users");
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await fetch("/api/departments");
      if (response.ok) {
        const data = await response.json();
        setDepartments(data);
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await fetch("/api/roles");
      if (response.ok) {
        const data = await response.json();
        setRoles(data);
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  };

  useEffect(() => {
    fetchDepartments();
    fetchRoles();
  }, []);

  // Get unique categories from roles
  const roleCategories = [
    "all",
    ...new Set(roles.map((role) => role.category).filter(Boolean)),
  ];

  // Filter roles by selected category
  const filteredRoles =
    selectedRoleCategory === "all"
      ? roles
      : roles.filter((role) => role.category === selectedRoleCategory);

  // Check for unsaved changes
  const hasUnsavedChanges = useCallback(() => {
    // Check form data changes
    const formDataChanged =
      JSON.stringify(formData) !== JSON.stringify(initialFormDataState);

    // Check members changes
    const membersChanged =
      JSON.stringify(
        members.map((m) => ({ userId: m.user.id, role: m.role }))
      ) !==
      JSON.stringify(
        initialMembersState.map((m) => ({ userId: m.user.id, role: m.role }))
      );

    return formDataChanged || membersChanged;
  }, [formData, initialFormDataState, members, initialMembersState]);

  // Handle beforeunload event for browser back button/close
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges()) {
        e.preventDefault();
        e.returnValue =
          "You have unsaved changes. Are you sure you want to leave?";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Handle navigation away from the page (for internal navigation)
  const handleNavigation = useCallback(
    (href: string) => {
      if (hasUnsavedChanges()) {
        const confirmed = window.confirm(
          "You have unsaved changes. Are you sure you want to leave?"
        );
        if (!confirmed) {
          return false; // Prevent navigation
        }
      }
      router.push(href);
      return true;
    },
    [hasUnsavedChanges, router]
  );

  const addMember = async () => {
    if (!selectedUserId || !selectedRole) return;

    // Check if user is already a member
    if (members.some((m) => m.user.id === selectedUserId)) {
      alert("User is already a member of this epic");
      return;
    }

    try {
      const response = await fetch(`/api/epics/${epic.id}/members`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: selectedUserId,
          role: selectedRole,
        }),
      });

      if (response.ok) {
        const newMember = await response.json();
        setMembers([...members, newMember]);

        // Create RACI entries if roles were selected
        if (selectedRaciRoles.length > 0) {
          try {
            const raciPromises = selectedRaciRoles.map((role) =>
              fetch(`/api/epics/${epic.id}/raci`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  userId: selectedUserId,
                  role: role,
                }),
              })
            );

            const raciResponses = await Promise.all(raciPromises);
            const failedRaci = raciResponses.filter((r) => !r.ok);

            if (failedRaci.length > 0) {
              console.warn(
                `${failedRaci.length} RACI role(s) failed to assign`
              );
            }
          } catch (raciError) {
            console.error("Error creating RACI entries:", raciError);
          }
        }

        // Reset form
        setSelectedUserId("");
        setSelectedRole("");
        setSelectedRoleCategory("all");
        setSelectedRaciRoles([]);
        setIsAddingMember(false);
      } else {
        const error = await response.json();
        alert(error.error || "Failed to add team member");
      }
    } catch (error) {
      console.error("Error adding member:", error);
      alert("Failed to add team member");
    }
  };

  const removeMember = async (userId: string) => {
    if (!confirm("Are you sure you want to remove this team member?")) return;

    try {
      const response = await fetch(`/api/epics/${epic.id}/members/${userId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setMembers(members.filter((m) => m.user.id !== userId));
      } else {
        alert("Failed to remove team member");
      }
    } catch (error) {
      console.error("Error removing member:", error);
      alert("Failed to remove team member");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const updateData: any = {
        title: formData.title,
        description: formData.description || null,
        departmentId: formData.departmentId || null,
        businessValue: formData.businessValue || null,
        riskLevel: formData.riskLevel || null,
        priority: formData.priority || null,
        estimatedEffort: formData.effort ? parseFloat(formData.effort) : null,
        budgetEstimate: formData.budgetEstimate
          ? parseFloat(formData.budgetEstimate)
          : null,
        strategicAlignment: formData.strategicAlignment || null,
        roiEstimate: formData.roiEstimate
          ? parseFloat(formData.roiEstimate)
          : null,
        stageGate: formData.stageGate || null,
        dueDate: formData.dueDate
          ? new Date(formData.dueDate).toISOString()
          : null,
        startDate: formData.startDate
          ? new Date(formData.startDate).toISOString()
          : null,
        dodText: (formData as any).dodText || null,
        dodChecklist: (formData as any).dodChecklist || null,
        updatedAt: new Date().toISOString(),
      };

      const response = await fetch(`/api/epics/${epic.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error("Failed to update epic");
      }

      router.push(`/projects/epics`);
    } catch (error) {
      console.error("Error updating epic:", error);
      alert("Failed to update epic. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-white">Basic Information</h2>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleChange("title", e.target.value)}
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            rows={3}
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Planning & Priority */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-white">
          Planning & Priority
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Department
            </label>
            <select
              value={formData.departmentId}
              onChange={(e) => handleChange("departmentId", e.target.value)}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select department...</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Priority
            </label>
            <select
              value={formData.priority}
              onChange={(e) => handleChange("priority", e.target.value)}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Priority</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Business Value
            </label>
            <select
              value={formData.businessValue}
              onChange={(e) => handleChange("businessValue", e.target.value)}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Value</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Risk Level
            </label>
            <select
              value={formData.riskLevel}
              onChange={(e) => handleChange("riskLevel", e.target.value)}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Risk</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Strategic Alignment
          </label>
          <input
            type="text"
            value={formData.strategicAlignment}
            onChange={(e) => handleChange("strategicAlignment", e.target.value)}
            placeholder="e.g., Q1 2025 Goals"
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Estimates & Budget */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-white">Estimates & Budget</h2>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Effort (hours)
            </label>
            <input
              type="number"
              value={formData.effort}
              onChange={(e) => handleChange("effort", e.target.value)}
              min="0"
              step="0.5"
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Budget ($)
            </label>
            <input
              type="number"
              value={formData.budgetEstimate}
              onChange={(e) => handleChange("budgetEstimate", e.target.value)}
              min="0"
              step="100"
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              ROI Estimate (%)
            </label>
            <input
              type="number"
              value={formData.roiEstimate}
              onChange={(e) => handleChange("roiEstimate", e.target.value)}
              min="0"
              step="1"
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Stage Gate
          </label>
          <input
            type="text"
            value={formData.stageGate}
            onChange={(e) => handleChange("stageGate", e.target.value)}
            placeholder="e.g., Executive approval required"
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Dates */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-white">Timeline</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => handleChange("startDate", e.target.value)}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Due Date
            </label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => handleChange("dueDate", e.target.value)}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Definition of Done (uses acceptanceCriteria field) */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-white">Definition of Done</h2>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Definition of Done / Acceptance Criteria
          </label>
          <textarea
            value={(formData as any).acceptanceCriteria}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                acceptanceCriteria: e.target.value,
              }))
            }
            rows={4}
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={`Enter acceptance criteria or a Definition of Done for this epic.\n\nExample:\n- Code reviewed\n- Unit tests added\n- Integration tests pass in CI`}
          />
        </div>
      </div>

      {/* Goals Section */}
      <GoalSection
        taskId={epic.id}
        boardId={epic.column?.boardId || ""}
        initialGoals={initialGoals}
      />

      {/* Team Members */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">👥 Team Members</h2>
          <button
            type="button"
            onClick={() => {
              setIsAddingMember(true);
              fetchUsers();
              fetchRoles();
            }}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <IconPlus size={16} />
            Add Member
          </button>
        </div>

        {/* Add Member Form */}
        {isAddingMember && (
          <div className="p-4 bg-zinc-800 rounded-lg">
            <h3 className="text-white font-medium mb-3">Add Team Member</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-zinc-400 mb-1">
                  Select User
                </label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded text-white"
                >
                  <option value="">Choose a user...</option>
                  {users
                    .filter(
                      (user) => !members.some((m) => m.user.id === user.id)
                    )
                    .map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name || user.email}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-1">
                  Role Category
                </label>
                <select
                  value={selectedRoleCategory}
                  onChange={(e) => {
                    setSelectedRoleCategory(e.target.value);
                    setSelectedRole(""); // Reset selected role when category changes
                  }}
                  className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded text-white"
                >
                  <option value="all">All Categories</option>
                  {roleCategories
                    .filter((cat) => cat !== "all")
                    .map((category) => (
                      <option key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-1">Role</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded text-white"
                >
                  <option value="">Select a role...</option>
                  {filteredRoles.map((role) => (
                    <option key={role.id} value={role.name}>
                      {role.name}
                      {role.description && ` - ${role.description}`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-2">
                  RACI Roles (optional)
                </label>
                <div className="space-y-2">
                  {[
                    {
                      role: "RESPONSIBLE",
                      label: "Responsible",
                      desc: "Does the work",
                    },
                    {
                      role: "ACCOUNTABLE",
                      label: "Accountable",
                      desc: "Ultimate decision maker",
                    },
                    {
                      role: "CONSULTED",
                      label: "Consulted",
                      desc: "Provides input",
                    },
                    {
                      role: "INFORMED",
                      label: "Informed",
                      desc: "Kept up-to-date",
                    },
                  ].map(({ role, label, desc }) => (
                    <label key={role} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedRaciRoles.includes(role)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedRaciRoles([...selectedRaciRoles, role]);
                          } else {
                            setSelectedRaciRoles(
                              selectedRaciRoles.filter((r) => r !== role)
                            );
                          }
                        }}
                        className="w-4 h-4 text-blue-600 bg-zinc-700 border-zinc-600 rounded focus:ring-blue-500"
                      />
                      <span className="text-white text-sm">
                        <span className="font-medium">{label}</span>
                        <span className="text-zinc-400 ml-1">({desc})</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={addMember}
                  disabled={!selectedUserId || !selectedRole}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-zinc-600 text-white rounded transition-colors"
                >
                  Add Member
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingMember(false);
                    setSelectedUserId("");
                    setSelectedRole("");
                    setSelectedRoleCategory("all");
                    setSelectedRaciRoles([]);
                  }}
                  className="px-4 py-2 bg-zinc-600 hover:bg-zinc-700 text-white rounded transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Current Members */}
        <div className="space-y-2">
          {members.length > 0 ? (
            members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-zinc-700 rounded-full flex items-center justify-center">
                    {member.user.image ? (
                      <img
                        src={member.user.image}
                        alt={member.user.name || "User"}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <IconUser size={16} className="text-zinc-400" />
                    )}
                  </div>
                  <div className="text-white font-medium">
                    {member.user.name || member.user.email}{" "}
                    <span className="text-zinc-400 text-sm">
                      • {member.role}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeMember(member.user.id)}
                  className="p-1 text-zinc-400 hover:text-red-400 transition-colors"
                  title="Remove member"
                >
                  <IconX size={16} />
                </button>
              </div>
            ))
          ) : (
            <div className="text-zinc-500 text-center py-8 bg-zinc-800 rounded-lg">
              No team members assigned yet
            </div>
          )}
        </div>
      </div>

      {/* RACI Matrix (read-only for edit view) */}
      <RaciMatrixSection
        epicId={epic.id}
      />

      {/* Submit */}
      <div className="flex gap-4 pt-6">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors"
        >
          {isSubmitting && <IconLoader size={18} className="animate-spin" />}
          {isSubmitting ? "Updating..." : "Update Epic"}
        </button>

        <button
          type="button"
          onClick={() => handleNavigation(`/epics/${epic.id}`)}
          className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-white font-medium transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
