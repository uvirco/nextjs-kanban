"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { IconLoader } from "@tabler/icons-react";

interface Board {
  id: string;
  title: string;
  columns: Array<{
    id: string;
    title: string;
  }>;
}

interface Department {
  id: string;
  name: string;
  description: string | null;
}

interface CreateEpicFormProps {
  boards: Board[];
  userId: string;
}

export default function CreateEpicForm({
  boards,
  userId,
}: CreateEpicFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    departmentId: "",
    businessValue: "",
    riskLevel: "",
    priority: "",
    effort: "",
    dueDate: "",
  });

  // Fetch departments
  useEffect(() => {
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

    fetchDepartments();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // First, create the epic task
      const epicData = {
        title: formData.title,
        description: formData.description || null,
        taskType: "EPIC",
        departmentId: formData.departmentId || null,
        businessValue: formData.businessValue || null,
        riskLevel: formData.riskLevel || null,
        priority: formData.priority || null,
        estimatedEffort: formData.effort || null,
        dueDate: formData.dueDate
          ? new Date(formData.dueDate).toISOString()
          : null,
        userId: userId,
      };

      const response = await fetch("/api/epics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(epicData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create epic");
      }

      const epic = await response.json();

      // Redirect to the new epic
      router.push(`/projects/epics/${epic.id}`);
    } catch (error) {
      console.error("Error creating epic:", error);
      alert("Failed to create epic. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information - Required */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-white">Basic Information</h2>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Epic Title *
          </label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => handleChange("title", e.target.value)}
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:border-zinc-600 focus:outline-none"
            placeholder="Enter epic title..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Description (Optional)
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            rows={3}
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:border-zinc-600 focus:outline-none resize-none"
            placeholder="Describe the epic objectives and scope (can be added later)..."
          />
        </div>
      </div>

      {/* Business Context - Optional */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          Business Context
          <span className="text-sm font-normal text-zinc-400">
            (Optional - can be added later)
          </span>
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Department
            </label>
            <select
              value={formData.departmentId}
              onChange={(e) => handleChange("departmentId", e.target.value)}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:border-zinc-600 focus:outline-none"
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
              Business Value
            </label>
            <select
              value={formData.businessValue}
              onChange={(e) => handleChange("businessValue", e.target.value)}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:border-zinc-600 focus:outline-none"
            >
              <option value="">Select value...</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Risk Level
          </label>
          <select
            value={formData.riskLevel}
            onChange={(e) => handleChange("riskLevel", e.target.value)}
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:border-zinc-600 focus:outline-none"
          >
            <option value="">Select risk...</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Priority
            </label>
            <select
              value={formData.priority}
              onChange={(e) => handleChange("priority", e.target.value)}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:border-zinc-600 focus:outline-none"
            >
              <option value="">Select priority...</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Effort Estimate
            </label>
            <select
              value={formData.effort}
              onChange={(e) => handleChange("effort", e.target.value)}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:border-zinc-600 focus:outline-none"
            >
              <option value="">Select effort...</option>
              <option value="SMALL">Small (1-2 weeks)</option>
              <option value="MEDIUM">Medium (2-4 weeks)</option>
              <option value="MEDIUM">Medium (1-3 months)</option>
              <option value="LARGE">Large (3-6 months)</option>
              <option value="XLARGE">Extra Large (6+ months)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Due Date (Optional)
          </label>
          <input
            type="date"
            value={formData.dueDate}
            onChange={(e) => handleChange("dueDate", e.target.value)}
            className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:border-zinc-600 focus:outline-none"
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-6 border-t border-zinc-800">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center gap-2"
        >
          {isSubmitting && <IconLoader size={18} className="animate-spin" />}
          {isSubmitting ? "Creating Epic..." : "Create Epic"}
        </button>
      </div>
    </form>
  );
}
