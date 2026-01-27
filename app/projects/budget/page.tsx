"use client";
import { useEffect, useState } from "react";
import { BudgetEntry } from "@/types/types";
import { supabase } from "@/lib/supabase";
import { Button } from "@nextui-org/button";
import { IconPlus, IconInfoCircle } from "@tabler/icons-react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/modal";
import AddBudgetModal from "./AddBudgetModal";

export default function BudgetPage() {
  const [budgetEntries, setBudgetEntries] = useState<BudgetEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<BudgetEntry | null>(null);

  useEffect(() => {
    fetchBudgetEntries();
  }, []);

  const fetchBudgetEntries = async () => {
    const { data, error } = await supabase
      .from("budget_entries")
      .select(
        "*, epic:Task!epic_id(title), department:Department!department_id(name)",
      )
      .order("date", { ascending: false });

    if (error) {
      console.error("Error fetching budget entries:", error);
    } else {
      setBudgetEntries(data || []);
    }
    setLoading(false);
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateValue: string | Date | null | undefined) => {
    if (!dateValue) return "-";
    try {
      const date = typeof dateValue === "string" ? new Date(dateValue) : dateValue;
      if (isNaN(date.getTime())) return "-";
      return date.toLocaleDateString();
    } catch {
      return "-";
    }
  };

  const formatMonth = (monthString: string | null | undefined) => {
    if (!monthString) return "-";
    // Format YYYY-MM to "Month YYYY"
    const [year, month] = monthString.split("-");
    if (!year || !month) return "-";
    try {
      const date = new Date(parseInt(year), parseInt(month) - 1);
      if (isNaN(date.getTime())) return "-";
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
      });
    } catch {
      return "-";
    }
  };

  const calculateAge = (createdAt: string | Date | null | undefined) => {
    if (!createdAt) return 0;
    try {
      const created = typeof createdAt === "string" ? new Date(createdAt) : createdAt;
      if (isNaN(created.getTime())) return 0;
      const today = new Date();
      const diffTime = Math.abs(today.getTime() - created.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    } catch {
      return 0;
    }
  };

  const calculateAnnualTotal = (
    amount: number,
    frequency: string
  ): number => {
    const frequencyMultipliers: Record<string, number> = {
      "One-time": 1,
      Weekly: 52,
      Monthly: 12,
      Quarterly: 4,
      Yearly: 1,
    };
    return amount * (frequencyMultipliers[frequency] || 1);
  };

  const calculateTotalAmounts = () => {
    let totalAmount = 0;
    let totalAnnual = 0;
    budgetEntries.forEach((entry) => {
      totalAmount += entry.amount || 0;
      totalAnnual += calculateAnnualTotal(entry.amount || 0, entry.frequency);
    });
    return { totalAmount, totalAnnual };
  };

  if (loading) {
    return <div className="p-6">Loading budget entries...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Budget & Expenses</h1>
        <div className="flex gap-2">
          <Button onClick={() => setIsInfoModalOpen(true)} variant="flat">
            <IconInfoCircle size={16} className="mr-2" />
            Best Practices
          </Button>
          <Button onClick={() => setIsModalOpen(true)}>
            <IconPlus size={16} className="mr-2" />
            Add Entry
          </Button>
        </div>
      </div>

      <div className="bg-zinc-900 rounded-lg overflow-hidden">
        <table className="w-full text-sm text-zinc-300">
          <thead className="bg-zinc-800">
            <tr>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Fiscal Year</th>
              <th className="px-4 py-3 text-left">Linked To</th>
              <th className="px-4 py-3 text-left">Type</th>
              <th className="px-4 py-3 text-left">Frequency</th>
              <th className="px-4 py-3 text-left">Category</th>
              <th className="px-4 py-3 text-left">Description</th>
              <th className="px-4 py-3 text-right">Amount</th>
              <th className="px-4 py-3 text-right">Annual Total</th>
              <th className="px-4 py-3 text-left">Purchase Month</th>
              <th className="px-4 py-3 text-left">Created</th>
              <th className="px-4 py-3 text-left">Updated</th>
              <th className="px-4 py-3 text-left">Age (days)</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {budgetEntries.map((entry) => (
              <tr key={entry.id} className="border-t border-zinc-800">
                <td className="px-4 py-3">{formatDate(entry.date)}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 bg-indigo-900 text-indigo-200 rounded text-xs">
                    {entry.fiscal_year}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {entry.epic ? (
                    <span className="text-blue-400">
                      <span className="text-xs text-zinc-500">Project: </span>
                      {entry.epic.title}
                    </span>
                  ) : entry.department ? (
                    <span className="text-purple-400">
                      <span className="text-xs text-zinc-500">Dept: </span>
                      {entry.department.name}
                    </span>
                  ) : (
                    <span className="text-zinc-500">-</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      entry.entry_type === "Budget"
                        ? "bg-blue-900 text-blue-200"
                        : "bg-red-900 text-red-200"
                    }`}
                  >
                    {entry.entry_type}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      entry.frequency === "One-time"
                        ? "bg-zinc-800 text-zinc-300"
                        : "bg-purple-900 text-purple-200"
                    }`}
                  >
                    {entry.frequency}
                  </span>
                </td>
                <td className="px-4 py-3">{entry.category}</td>
                <td className="px-4 py-3">{entry.description || "-"}</td>
                <td className="px-4 py-3 text-right font-mono">
                  {formatCurrency(entry.amount, entry.currency)}
                </td>
                <td className="px-4 py-3 text-right font-mono text-green-400">
                  {formatCurrency(
                    calculateAnnualTotal(entry.amount, entry.frequency),
                    entry.currency
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-zinc-400">
                  {formatMonth(entry.purchase_date)}
                </td>
                <td className="px-4 py-3 text-sm text-zinc-400">
                  {formatDate(entry.created_at)}
                </td>
                <td className="px-4 py-3 text-sm text-zinc-400">
                  {formatDate(entry.updated_at)}
                </td>
                <td className="px-4 py-3 text-sm">
                  <span className="px-2 py-1 bg-zinc-800 rounded">
                    {calculateAge(entry.created_at)} days
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Button 
                    variant="flat" 
                    size="sm" 
                    onClick={() => {
                      setEditingEntry(entry);
                      setIsModalOpen(true);
                    }}
                  >
                    Edit
                  </Button>
                </td>
              </tr>
            ))}
            {budgetEntries.length > 0 && (
              <tr className="border-t-2 border-zinc-700 bg-zinc-800/50 font-semibold">
                <td colSpan={8} className="px-4 py-3 text-right">
                  Total Amount:
                </td>
                <td className="px-4 py-3 text-right font-mono">
                  {formatCurrency(
                    calculateTotalAmounts().totalAmount,
                    budgetEntries[0]?.currency || "USD"
                  )}
                </td>
                <td className="px-4 py-3 text-right font-mono text-green-400">
                  {formatCurrency(
                    calculateTotalAmounts().totalAnnual,
                    budgetEntries[0]?.currency || "USD"
                  )}
                </td>
                <td colSpan={5}></td>
              </tr>
            )}
            {budgetEntries.length === 0 && (
              <tr>
                <td
                  colSpan={13}
                  className="px-4 py-8 text-center text-zinc-500"
                >
                  No budget entries found. Add your first entry!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <AddBudgetModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingEntry(null);
        }} 
        onSuccess={() => {
          setIsModalOpen(false);
          setEditingEntry(null);
          fetchBudgetEntries();
        }}
        editingEntry={editingEntry}
      />

      <Modal
        isOpen={isInfoModalOpen}
        onOpenChange={setIsInfoModalOpen}
        size="5xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader>
            <h2 className="text-2xl font-bold">
              Budget Management Best Practices
            </h2>
          </ModalHeader>
          <ModalBody>
            <div className="prose prose-invert max-w-none">
              <div
                dangerouslySetInnerHTML={{
                  __html: `
                <h3>1. Budget Planning & Tracking</h3>
                <ul>
                  <li><strong>Set Project Budgets:</strong> Allocate budget per epic/project at the start</li>
                  <li><strong>Track Actual Expenses:</strong> Log all expenses as they occur</li>
                  <li><strong>Budget vs. Actual:</strong> Compare planned budget with actual spending</li>
                  <li><strong>Variance Analysis:</strong> Identify and explain budget deviations</li>
                  <li><strong>Forecasting:</strong> Project future spending based on current trends</li>
                </ul>

                <h3>2. Expense Categories</h3>
                <ul>
                  <li><strong>Labor:</strong> Developer/team member time and salaries</li>
                  <li><strong>Infrastructure:</strong> Cloud services, servers, hosting</li>
                  <li><strong>Tools & Software:</strong> Licenses, subscriptions, third-party services</li>
                  <li><strong>External Services:</strong> Contractors, consultants, agencies</li>
                  <li><strong>Marketing:</strong> Campaigns, advertising, promotions</li>
                  <li><strong>Miscellaneous:</strong> Other project-related expenses</li>
                </ul>

                <h3>3. Budget Controls</h3>
                <ul>
                  <li><strong>Approval Workflows:</strong> Require approval for expenses over threshold</li>
                  <li><strong>Budget Alerts:</strong> Notify when spending reaches certain %</li>
                  <li><strong>Spending Limits:</strong> Set maximum amounts per category</li>
                  <li><strong>Regular Reviews:</strong> Weekly/monthly budget review meetings</li>
                </ul>

                <h3>4. Reporting & Analytics</h3>
                <ul>
                  <li><strong>Burndown Charts:</strong> Show budget consumption over time</li>
                  <li><strong>Category Breakdown:</strong> Pie charts showing spend by category</li>
                  <li><strong>Epic Comparison:</strong> Compare budgets across projects</li>
                  <li><strong>ROI Tracking:</strong> Measure return on investment</li>
                  <li><strong>Export Reports:</strong> Generate PDF/Excel for stakeholders</li>
                </ul>
              `,
                }}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              onClick={() => setIsInfoModalOpen(false)}
              className="bg-blue-600 text-white"
            >
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
