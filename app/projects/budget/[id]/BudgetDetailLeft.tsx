"use client";
import React, { useState } from "react";
import { BudgetEntry } from "@/types/types";
import { Button } from "@nextui-org/button";
import { Input } from "@nextui-org/input";
import { Select, SelectItem } from "@nextui-org/select";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface BudgetDetailLeftProps {
  budget: BudgetEntry;
  canEdit: boolean;
  onUpdate: () => void;
}

export default function BudgetDetailLeft({
  budget,
  canEdit,
  onUpdate,
}: BudgetDetailLeftProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    amount: budget.amount.toString(),
    status: budget.status || "PLANNED",
    description: budget.description || "",
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("budget_entries")
        .update({
          amount: parseFloat(formData.amount),
          status: formData.status,
          description: formData.description,
        })
        .eq("id", budget.id);

      if (error) {
        toast.error("Failed to update budget");
      } else {
        toast.success("Budget updated");
        setIsEditing(false);
        onUpdate();
      }
    } catch (error) {
      toast.error("Error updating budget");
    }
    setIsSaving(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: budget.currency || "ZAR",
    }).format(amount);
  };

  const formatDate = (date: string | Date | null | undefined) => {
    if (!date) return "-";
    try {
      const d = typeof date === "string" ? new Date(date) : date;
      return d.toLocaleDateString();
    } catch {
      return "-";
    }
  };

  return (
    <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800 h-full overflow-y-auto">
      <h2 className="text-xl font-bold text-white mb-6">Budget Details</h2>

      {/* Status Badge */}
      <div className="mb-4">
        <span
          className={`px-3 py-1 rounded text-sm font-medium ${
            budget.status === "PLANNED"
              ? "bg-yellow-900 text-yellow-200"
              : budget.status === "ORDERED"
                ? "bg-blue-900 text-blue-200"
                : budget.status === "RECEIVED"
                  ? "bg-green-900 text-green-200"
                  : "bg-purple-900 text-purple-200"
          }`}
        >
          {budget.status || "PLANNED"}
        </span>
      </div>

      {/* Details Grid */}
      <div className="space-y-4">
        <div>
          <label className="text-xs text-zinc-400 block mb-1">Category</label>
          <p className="text-white">{budget.category}</p>
        </div>

        <div>
          <label className="text-xs text-zinc-400 block mb-1">Type</label>
          <p className="text-white">{budget.entry_type}</p>
        </div>

        <div>
          <label className="text-xs text-zinc-400 block mb-1">Frequency</label>
          <p className="text-white">{budget.frequency}</p>
        </div>

        <div>
          <label className="text-xs text-zinc-400 block mb-1">Fiscal Year</label>
          <p className="text-white">{budget.fiscal_year}</p>
        </div>

        <div>
          <label className="text-xs text-zinc-400 block mb-1">Date</label>
          <p className="text-white">{formatDate(budget.date)}</p>
        </div>

        <div>
          <label className="text-xs text-zinc-400 block mb-1">Created By</label>
          <p className="text-white text-sm">
            {budget.user?.name || budget.user?.email || "-"}
          </p>
        </div>

        <div>
          <label className="text-xs text-zinc-400 block mb-1">Created</label>
          <p className="text-white text-sm">{formatDate(budget.created_at)}</p>
        </div>

        {budget.epic && (
          <div>
            <label className="text-xs text-zinc-400 block mb-1">Project</label>
            <p className="text-blue-400 text-sm">{budget.epic.title}</p>
          </div>
        )}

        {budget.department && (
          <div>
            <label className="text-xs text-zinc-400 block mb-1">Department</label>
            <p className="text-purple-400 text-sm">{budget.department.name}</p>
          </div>
        )}

        {budget.parent_budget_id && (
          <div>
            <label className="text-xs text-zinc-400 block mb-1">Parent Budget</label>
            <p className="text-zinc-400 text-sm">{budget.parent_budget_id}</p>
          </div>
        )}

        <hr className="border-zinc-700 my-4" />

        {/* Editable Fields */}
        {isEditing ? (
          <>
            <div>
              <label className="text-xs text-zinc-400 block mb-1">Amount</label>
              <Input
                type="number"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                step="0.01"
              />
            </div>

            <div>
              <label className="text-xs text-zinc-400 block mb-1">Status</label>
              <Select
                selectedKeys={[formData.status]}
                onSelectionChange={(keys) =>
                  setFormData({ ...formData, status: Array.from(keys)[0] as "PLANNED" | "ORDERED" | "RECEIVED" | "PAID" })
                }
              >
                <SelectItem key="PLANNED">Planned</SelectItem>
                <SelectItem key="ORDERED">Ordered</SelectItem>
                <SelectItem key="RECEIVED">Received</SelectItem>
                <SelectItem key="PAID">Paid</SelectItem>
              </Select>
            </div>

            <div>
              <label className="text-xs text-zinc-400 block mb-1">
                Description
              </label>
              <Input
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                size="sm"
                onClick={handleSave}
                isLoading={isSaving}
                disabled={isSaving}
              >
                Save
              </Button>
              <Button
                size="sm"
                variant="flat"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="text-xs text-zinc-400 block mb-1">Amount</label>
              <p className="text-white font-mono text-lg">
                {formatCurrency(budget.amount)}
              </p>
            </div>

            <div>
              <label className="text-xs text-zinc-400 block mb-1">
                Description
              </label>
              <p className="text-white text-sm">{budget.description || "-"}</p>
            </div>

            {canEdit && (
              <Button size="sm" onClick={() => setIsEditing(true)} className="mt-4">
                Edit
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
