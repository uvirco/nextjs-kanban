"use client";
import { useState, useEffect } from "react";
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
}

export default function AddBudgetModal({
  isOpen,
  onClose,
  onSuccess,
}: AddBudgetModalProps) {
  const [epics, setEpics] = useState<Epic[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
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
    category: "",
    description: "",
    amount: "",
    currency: "ZAR",
    entryType: "Expense",
    frequency: "One-time",
    fiscalYear: getCurrentFiscalYear(),
    purchaseDate: "",
    date: new Date().toISOString().split("T")[0],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      fetchEpics();
      fetchDepartments();
      fetchExistingCategories();
    }
  }, [isOpen]);

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

    const { data, error } = await supabase.from("budget_entries").insert([
      {
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
        purchase_date:
          formData.entryType === "Expense" && formData.purchaseDate
            ? formData.purchaseDate
            : null,
        date: formData.date,
      },
    ]);

    if (error) {
      console.error("Error adding budget entry:", error);
      toast.error("Failed to add budget entry");
    } else {
      toast.success("Budget entry added successfully");
      onSuccess();
      setCustomCategory("");
      setFormData({
        linkType: "epic",
        epicId: "",
        departmentId: "",
        category: "",
        description: "",
        amount: "",
        currency: "ZAR",
        entryType: "Expense",
        frequency: "One-time",
        fiscalYear: getCurrentFiscalYear(),
        purchaseDate: "",
        date: new Date().toISOString().split("T")[0],
      });
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
          <h2 className="text-white">Add Budget Entry</h2>
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
            </div>

            <div className="grid grid-cols-2 gap-4">
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

              {formData.entryType === "Expense" && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Purchase Month
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
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Date *</label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => handleChange("date", e.target.value)}
                isInvalid={!!errors.date}
                errorMessage={errors.date}
              />
            </div>

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
            {isSubmitting ? "Adding..." : "Add Entry"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
