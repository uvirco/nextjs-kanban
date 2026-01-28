"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { supabase } from "@/lib/supabase";
import { Button } from "@nextui-org/button";
import { Input } from "@nextui-org/input";
import { Select, SelectItem } from "@nextui-org/select";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/modal";
import { toast } from "sonner";

// Helper function to get current fiscal year (April 1 - March 31)
function getCurrentFiscalYear(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-11

  // If before April (month 0-2 = Jan-Mar), fiscal year is previous year
  if (month < 3) {
    return `${year - 1}/${year}`;
  }
  return `${year}/${year + 1}`;
}

// Generate fiscal year options (current and future only - cannot add to past fiscal years after April 1)
function generateFiscalYears(): string[] {
  const now = new Date();
  const currentYear = now.getFullYear();
  const month = now.getMonth(); // 0-11

  // Determine the start year for fiscal years we can add to
  let startYear: number;
  if (month < 3) {
    // Jan-Mar: current fiscal year is previous year, so start from previous year
    startYear = currentYear - 1;
  } else {
    // Apr-Dec: current fiscal year is current year
    startYear = currentYear;
  }

  const years: string[] = [];
  // Generate current fiscal year + next 4 years (5 years total)
  for (let i = 0; i <= 4; i++) {
    const fiscalStartYear = startYear + i;
    years.push(`${fiscalStartYear}/${fiscalStartYear + 1}`);
  }
  return years;
}

interface Epic {
  id: string;
  title: string;
}

interface Department {
  id: string;
  name: string;
}

interface AddBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingEntry?: any | null;
}

export default function AddBudgetModal({
  isOpen,
  onClose,
  onSuccess,
  editingEntry,
}: AddBudgetModalProps) {
  const { data: session, status } = useSession();
  const [epics, setEpics] = useState<Epic[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [parentBudgets, setParentBudgets] = useState<any[]>([]);
  const [customCategory, setCustomCategory] = useState("");
  const [allCategories, setAllCategories] = useState<string[]>([
    "Computers",
    "Lab Equipment",
    "Plant & Equipment",
    "Office Equipment",
    "Furniture & Fittings",
    "Leasehold Improvements",
    "Other Fixed Assets",
    "Subscriptions",
  ]);
  const [formData, setFormData] = useState({
    linkType: "epic",
    epicId: "",
    departmentId: "",
    parentBudgetId: "",
    category: "",
    description: "",
    amount: "",
    currency: "ZAR",
    entryType: "Expense",
    frequency: "One-time",
    fiscalYear: getCurrentFiscalYear(),
    status: "PLANNED",
    purchaseDate: "",
    date: (() => {
      const today = new Date();
      return today.toISOString().split("T")[0];
    })(),
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      fetchEpics();
      fetchDepartments();
      fetchParentBudgets();
      fetchExistingCategories();
      
      // Populate form if editing an entry
      if (editingEntry) {
        setFormData({
          linkType: editingEntry.epic_id ? "epic" : "department",
          epicId: editingEntry.epic_id || "",
          departmentId: editingEntry.department_id || "",
          parentBudgetId: editingEntry.parent_budget_id || "",
          category: editingEntry.category,
          description: editingEntry.description || "",
          amount: editingEntry.amount.toString(),
          currency: editingEntry.currency,
          entryType: editingEntry.entry_type,
          frequency: editingEntry.frequency,
          fiscalYear: editingEntry.fiscal_year,
          status: editingEntry.status || "PLANNED",
          purchaseDate: editingEntry.purchase_date || "",
          date: editingEntry.date,
        });
      } else {
        // Reset form for new entry
        setFormData({
          linkType: "epic",
          epicId: "",
          departmentId: "",
          parentBudgetId: "",
          category: "",
          description: "",
          amount: "",
          currency: "ZAR",
          entryType: "Expense",
          frequency: "One-time",
          fiscalYear: getCurrentFiscalYear(),
          status: "PLANNED",
          purchaseDate: "",
          date: (() => {
            const today = new Date();
            return today.toISOString().split("T")[0];
          })(),
        });
      }
      setErrors({});
    }
  }, [isOpen, editingEntry]);

  const fetchEpics = async () => {
    const { data, error } = await supabase
      .from("Task")
      .select("id, title")
      .eq("taskType", "EPIC");

    if (error) {
      console.error("Error fetching projects:", error);
    } else {
      setEpics(data || []);
    }
  };

  const fetchDepartments = async () => {
    const { data, error } = await supabase
      .from("Department")
      .select("id, name");

    if (error) {
      console.error("Error fetching departments:", error);
    } else {
      setDepartments(data || []);
    }
  };

  const fetchParentBudgets = async () => {
    const { data, error } = await supabase
      .from("budget_entries")
      .select("id, description, amount, parent_budget_id")
      .is("parent_budget_id", null)
      .order("description", { ascending: true });

    if (error) {
      console.error("Error fetching parent budgets:", error);
    } else {
      setParentBudgets(data || []);
    }
  };

  const fetchExistingCategories = async () => {
    const { data, error } = await supabase
      .from("budget_entries")
      .select("category")
      .not("category", "is", null);

    if (error) {
      console.error("Error fetching categories:", error);
      return;
    }

    // Get unique categories from existing entries
    const existingCategories = [
      ...new Set(data?.map((d: { category: string }) => d.category) || []),
    ];

    // Combine default categories with existing ones (remove duplicates)
    const defaultCategories = [
      "Computers",
      "Lab Equipment",
      "Plant & Equipment",
      "Office Equipment",
      "Furniture & Fittings",
      "Leasehold Improvements",
      "Other Fixed Assets",
      "Subscriptions",
    ];

    const combined = [
      ...new Set([...defaultCategories, ...existingCategories]),
    ] as string[];
    setAllCategories(combined.sort());
  };

  // Helper function to get user ID by email from custom User table
  const getUserIdByEmail = async (email: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase
        .from("User")
        .select("id")
        .eq("email", email)
        .single();

      if (error) {
        console.warn(`Could not find user with email ${email}:`, error);
        return null;
      }

      return data?.id || null;
    } catch (err) {
      console.warn("Error fetching user by email:", err);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const newErrors: Record<string, string> = {};
    if (formData.linkType === "epic" && !formData.epicId)
      newErrors.epicId = "Project is required";
    if (formData.linkType === "department" && !formData.departmentId)
      newErrors.departmentId = "Department is required";
    if (!formData.category.trim()) newErrors.category = "Category is required";
    if (formData.category === "Other" && !customCategory.trim())
      newErrors.category = "Custom category is required";
    if (!formData.amount || parseFloat(formData.amount) <= 0)
      newErrors.amount = "Valid amount is required";
    if (!formData.date) newErrors.date = "Date is required";

    // Check if trying to add to a past fiscal year (after April 1)
    const currentFiscalYear = getCurrentFiscalYear();
    const availableFiscalYears = generateFiscalYears();
    if (!availableFiscalYears.includes(formData.fiscalYear)) {
      newErrors.fiscalYear = `Cannot add to past fiscal year ${formData.fiscalYear}. Budget closed after April 1.`;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please fill in all required fields");
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    // Ensure date is in YYYY-MM-DD format
    const dateValue = formData.date;
    if (!dateValue || !/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
      console.error("Invalid date format:", dateValue);
      toast.error("Date must be in YYYY-MM-DD format");
      setIsSubmitting(false);
      return;
    }

    // Ensure purchase_date is in YYYY-MM-DD format if provided
    let purchaseDateValue = null;
    if (formData.entryType === "Expense" && formData.purchaseDate) {
      if (!/^\d{4}-\d{2}$/.test(formData.purchaseDate)) {
        console.error("Invalid purchase date format:", formData.purchaseDate);
        toast.error("Purchase date must be in YYYY-MM format");
        setIsSubmitting(false);
        return;
      }
      // Convert YYYY-MM to YYYY-MM-01 for database
      purchaseDateValue = `${formData.purchaseDate}-01`;
    }

    const entryData: any = {
      epic_id: formData.linkType === "epic" ? formData.epicId : null,
      department_id:
        formData.linkType === "department" ? formData.departmentId : null,
      category:
        formData.category === "Other" ? customCategory : formData.category,
      description: formData.description || null,
      amount: parseFloat(formData.amount),
      currency: formData.currency,
      entry_type: formData.entryType,
      frequency: formData.frequency,
      fiscal_year: formData.fiscalYear,
      purchase_date: purchaseDateValue,
      date: dateValue,
      parent_budget_id: formData.parentBudgetId || null,
      status: formData.status,
    };

    // Get current user for created_by on new entries
    if (!editingEntry) {
      let userId: string | null = null;

      // Wait for session to load (don't try if still loading)
      if (status === "authenticated" && session?.user?.id) {
        userId = session.user.id;
        console.log("Using NextAuth session user ID:", userId);
      } else if (status === "authenticated" && session?.user?.email) {
        // Fallback: look up user by email in custom User table
        console.log("Session loaded but no user.id, looking up by email:", session.user.email);
        userId = await getUserIdByEmail(session.user.email);
        if (userId) {
          console.log("Found user ID by email:", userId);
        } else {
          console.warn("Could not find user by email");
        }
      } else if (status === "loading") {
        console.warn("Session still loading, cannot determine user ID");
        toast.error("Session is still loading. Please try again.");
        setIsSubmitting(false);
        return;
      } else {
        console.warn("User not authenticated");
        toast.error("You must be logged in to create a budget entry");
        setIsSubmitting(false);
        return;
      }

      if (userId) {
        entryData.created_by = userId;
      } else {
        console.warn("Could not determine user ID, created_by will be null");
        entryData.created_by = null;
      }
    }

    try {
      let result;
      console.log("Saving budget entry:", entryData);
      
      if (editingEntry) {
        // Update existing entry (don't change created_by or parent_budget_id on update)
        const { parent_budget_id, created_by, ...updateData } = entryData;
        result = await supabase
          .from("budget_entries")
          .update(updateData)
          .eq("id", editingEntry.id);
      } else {
        // Create new entry
        result = await supabase.from("budget_entries").insert([entryData]);
      }

      const { error } = result;

      if (error) {
        console.error("Error saving budget entry:", error);
        console.error("Full error details:", JSON.stringify(error, null, 2));
        toast.error(
          editingEntry
            ? "Failed to update budget entry"
            : "Failed to add budget entry"
        );
      } else {
        toast.success(
          editingEntry
            ? "Budget entry updated successfully"
            : "Budget entry added successfully"
        );
        onSuccess();
        setCustomCategory("");
        setFormData({
          linkType: "epic",
          epicId: "",
          departmentId: "",
          parentBudgetId: "",
          category: "",
          description: "",
          amount: "",
          currency: "ZAR",
          entryType: "Expense",
          frequency: "One-time",
          fiscalYear: getCurrentFiscalYear(),
          status: "PLANNED",
          purchaseDate: "",
          date: new Date().toISOString().split("T")[0],
        });
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("An error occurred while saving the budget entry");
    }

    setIsSubmitting(false);
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onClose}
      isDismissable={false}
      hideCloseButton={false}
      classNames={{
        base: "bg-zinc-900 border border-zinc-800",
        header: "border-b border-zinc-800",
        body: "bg-zinc-900",
        footer: "border-t border-zinc-800",
      }}
    >
      <ModalContent>
        <ModalHeader>
          <h2 className="text-white">
            {editingEntry ? "Edit Budget Entry" : "Add Budget Entry"}
          </h2>
        </ModalHeader>
        <ModalBody>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-zinc-300">
                Link To *
              </label>
              <div onClick={(e) => e.stopPropagation()}>
                <Select
                  defaultSelectedKeys={["epic"]}
                  selectedKeys={[formData.linkType]}
                  onSelectionChange={(keys) =>
                    handleChange("linkType", Array.from(keys)[0] as string)
                  }
                  aria-label="Link Type"
                >
                  <SelectItem key="epic">Project</SelectItem>
                  <SelectItem key="department">Department</SelectItem>
                </Select>
              </div>
            </div>

            {formData.linkType === "epic" && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Project *
                </label>
                <div onClick={(e) => e.stopPropagation()}>
                  <Select
                    selectedKeys={formData.epicId ? [formData.epicId] : []}
                    onSelectionChange={(keys) =>
                      handleChange("epicId", Array.from(keys)[0] as string)
                    }
                    placeholder="Select a project"
                    aria-label="Project"
                    isInvalid={!!errors.epicId}
                    errorMessage={errors.epicId}
                  >
                    {epics.map((epic) => (
                      <SelectItem key={epic.id} value={epic.id}>
                        {epic.title}
                      </SelectItem>
                    ))}
                  </Select>
                </div>
              </div>
            )}

            {formData.linkType === "department" && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Department *
                </label>
                <div onClick={(e) => e.stopPropagation()}>
                  <Select
                    selectedKeys={
                      formData.departmentId ? [formData.departmentId] : []
                    }
                    onSelectionChange={(keys) =>
                      handleChange(
                        "departmentId",
                        Array.from(keys)[0] as string,
                      )
                    }
                    placeholder="Select a department"
                    aria-label="Department"
                    isInvalid={!!errors.departmentId}
                    errorMessage={errors.departmentId}
                  >
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </Select>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">
                Parent Budget (Optional)
              </label>
              <div onClick={(e) => e.stopPropagation()}>
                <Select
                  selectedKeys={formData.parentBudgetId ? [formData.parentBudgetId] : []}
                  onSelectionChange={(keys) =>
                    handleChange("parentBudgetId", Array.from(keys)[0] as string)
                  }
                  placeholder="Select parent budget (for sub-items)"
                  aria-label="Parent Budget"
                >
                  {parentBudgets.map((budget) => (
                    <SelectItem key={budget.id} value={budget.id}>
                      {budget.description} (${budget.amount.toFixed(2)})
                    </SelectItem>
                  ))}
                </Select>
              </div>
              <p className="text-xs text-zinc-500 mt-1">
                Use this to create sub-items under a parent budget entry
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Type *</label>
                <div onClick={(e) => e.stopPropagation()}>
                  <Select
                    defaultSelectedKeys={["Expense"]}
                    selectedKeys={[formData.entryType]}
                    onSelectionChange={(keys) =>
                      handleChange("entryType", Array.from(keys)[0] as string)
                    }
                    aria-label="Entry Type"
                  >
                    <SelectItem key="Expense">Expense</SelectItem>
                    <SelectItem key="Budget">Budget</SelectItem>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <div onClick={(e) => e.stopPropagation()}>
                  <Select
                    defaultSelectedKeys={["PLANNED"]}
                    selectedKeys={[formData.status]}
                    onSelectionChange={(keys) =>
                      handleChange("status", Array.from(keys)[0] as string)
                    }
                    aria-label="Status"
                    className="bg-zinc-900 text-white"
                  >
                    <SelectItem key="PLANNED">Planned</SelectItem>
                    <SelectItem key="ORDERED">Ordered</SelectItem>
                    <SelectItem key="RECEIVED">Received</SelectItem>
                    <SelectItem key="PAID">Paid</SelectItem>
                    <SelectItem key="APPROVED">Approved</SelectItem>
                  </Select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Frequency *
                </label>
                <div onClick={(e) => e.stopPropagation()}>
                  <Select
                    defaultSelectedKeys={["One-time"]}
                    selectedKeys={[formData.frequency]}
                    onSelectionChange={(keys) =>
                      handleChange("frequency", Array.from(keys)[0] as string)
                    }
                    aria-label="Frequency"
                  >
                    <SelectItem key="One-time">One-time</SelectItem>
                    <SelectItem key="Weekly">Weekly</SelectItem>
                    <SelectItem key="Monthly">Monthly</SelectItem>
                    <SelectItem key="Quarterly">Quarterly</SelectItem>
                    <SelectItem key="Yearly">Yearly</SelectItem>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Fiscal Year *
                </label>
                <div onClick={(e) => e.stopPropagation()}>
                  <Select
                    selectedKeys={[formData.fiscalYear]}
                    onSelectionChange={(keys) =>
                      handleChange("fiscalYear", Array.from(keys)[0] as string)
                    }
                    aria-label="Fiscal Year"
                    isInvalid={!!errors.fiscalYear}
                    errorMessage={errors.fiscalYear}
                  >
                    {generateFiscalYears().map((year) => (
                      <SelectItem key={year}>{year}</SelectItem>
                    ))}
                  </Select>
                </div>
                <p className="text-xs text-zinc-500 mt-1">
                  Cannot add to past fiscal years after April 1
                </p>
              </div>
            </div>

            {formData.entryType === "Expense" && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Purchase Month *
                </label>
                <Input
                  type="month"
                  value={formData.purchaseDate}
                  onChange={(e) =>
                    handleChange("purchaseDate", e.target.value)
                  }
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">
                Category *
              </label>
              <div onClick={(e) => e.stopPropagation()}>
                <Select
                  selectedKeys={
                    formData.category && formData.category !== "Other"
                      ? [formData.category]
                      : formData.category === "Other"
                        ? ["Other"]
                        : []
                  }
                  onSelectionChange={(keys) => {
                    const value = Array.from(keys)[0] as string;
                    handleChange("category", value);
                    if (value !== "Other") {
                      setCustomCategory("");
                    }
                  }}
                  placeholder="Select category"
                  aria-label="Category"
                  isInvalid={!!errors.category}
                  errorMessage={errors.category}
                  items={[
                    ...allCategories.map((cat) => ({ key: cat, label: cat })),
                    { key: "Other", label: "Other (Custom)" },
                  ]}
                >
                  {(item) => (
                    <SelectItem key={item.key}>{item.label}</SelectItem>
                  )}
                </Select>
              </div>
            </div>

            {formData.category === "Other" && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Custom Category *
                </label>
                <Input
                  type="text"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="Enter custom category name"
                  isInvalid={!!errors.category && formData.category === "Other"}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Description of expense or budget item"
                rows={2}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:border-zinc-600 focus:outline-none resize-none"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-2">
                  Amount *
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => handleChange("amount", e.target.value)}
                  placeholder="0.00"
                  isInvalid={!!errors.amount}
                  errorMessage={errors.amount}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Currency
                </label>
                <div onClick={(e) => e.stopPropagation()}>
                  <Select
                    defaultSelectedKeys={["ZAR"]}
                    selectedKeys={[formData.currency]}
                    onSelectionChange={(keys) =>
                      handleChange("currency", Array.from(keys)[0] as string)
                    }
                    aria-label="Currency"
                  >
                    <SelectItem key="ZAR">ZAR (Rand)</SelectItem>
                    <SelectItem key="USD">USD</SelectItem>
                    <SelectItem key="EUR">EUR</SelectItem>
                  </Select>
                </div>
              </div>
            </div>
          </form>
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting}
            color="primary"
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isSubmitting
              ? editingEntry
                ? "Updating..."
                : "Adding..."
              : editingEntry
              ? "Update Entry"
              : "Add Entry"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
