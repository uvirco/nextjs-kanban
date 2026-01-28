"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
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
  const router = useRouter();
  const { data: session } = useSession();
  const [budgetEntries, setBudgetEntries] = useState<BudgetEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<BudgetEntry | null>(null);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  
  // Sorting state
  const [sortColumn, setSortColumn] = useState<string>("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  
  // Filtering state
  const [filterType, setFilterType] = useState<string>("");
  const [filterFrequency, setFilterFrequency] = useState<string>("");
  const [filterFiscalYear, setFilterFiscalYear] = useState<string>("");
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterDepartment, setFilterDepartment] = useState<string>("");
  const [filterProject, setFilterProject] = useState<string>("");
  const [filterUser, setFilterUser] = useState<string>("");
  
  // Expanded rows state
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  useEffect(() => {
    console.log("Session:", session?.user);
  }, [session]);

  useEffect(() => {
    fetchBudgetEntries();
  }, []);

  const fetchBudgetEntries = async () => {
    const { data, error } = await supabase
      .from("budget_entries")
      .select(
        "*, epic:Task!epic_id(id, title), department:Department!department_id(id, name)"
      )
      .order("date", { ascending: false });

    if (error) {
      console.error("Error fetching budget entries:", error);
      setLoading(false);
      return;
    }

    console.log("Budget entries fetched:", data?.slice(0, 2).map((e: any) => ({ id: e.id, created_by: e.created_by })));

    // Collect unique user IDs and fetch user details
    const userIds = new Set<string>();
    (data || []).forEach((entry: any) => {
      if (entry.created_by) {
        userIds.add(entry.created_by);
      }
    });

    const userMap: Record<string, any> = {};
    if (userIds.size > 0) {
      const { data: userData } = await supabase
        .from("User")
        .select("id, name, email")
        .in("id", Array.from(userIds));

      if (userData) {
        userData.forEach((user: any) => {
          userMap[user.id] = user;
        });
      }
    }

    // Attach user data and build unique users list
    const usersSet = new Set<string>();
    const enrichedData = (data || []).map((entry: any) => {
      if (entry.created_by) {
        usersSet.add(entry.created_by);
      }
      return {
        ...entry,
        user: entry.created_by ? userMap[entry.created_by] : null
      };
    });

    const uniqueUsers = Array.from(usersSet).map(id => ({
      id,
      name: userMap[id]?.name || id,
      email: userMap[id]?.email || id
    }));
    setAllUsers(uniqueUsers);

    // Build parent-child hierarchy
    const entriesMap = new Map();
    const parentEntries: BudgetEntry[] = [];

    // First pass: index all entries
    enrichedData.forEach((entry: any) => {
      entriesMap.set(entry.id, { ...entry, children: [] });
    });

    // Second pass: organize hierarchy
    enrichedData.forEach((entry: any) => {
      if (entry.parent_budget_id) {
        const parent = entriesMap.get(entry.parent_budget_id);
        if (parent) {
          parent.children.push(entriesMap.get(entry.id));
        }
      } else {
        parentEntries.push(entriesMap.get(entry.id));
      }
    });

    setBudgetEntries(parentEntries);
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
    getFilteredAndSortedEntries().forEach((entry) => {
      totalAmount += entry.amount || 0;
      totalAnnual += calculateAnnualTotal(entry.amount || 0, entry.frequency);
    });
    return { totalAmount, totalAnnual };
  };

  const getFilteredAndSortedEntries = () => {
    let filtered = budgetEntries;

    // Apply filters
    if (filterType) {
      filtered = filtered.filter((e) => e.entry_type === filterType);
    }
    if (filterFrequency) {
      filtered = filtered.filter((e) => e.frequency === filterFrequency);
    }
    if (filterFiscalYear) {
      filtered = filtered.filter((e) => e.fiscal_year === filterFiscalYear);
    }
    if (filterCategory) {
      filtered = filtered.filter((e) => e.category === filterCategory);
    }
    if (filterStatus) {
      filtered = filtered.filter((e) => e.status === filterStatus);
    }
    if (filterDepartment) {
      filtered = filtered.filter((e) => e.department_id === filterDepartment);
    }
    if (filterProject) {
      filtered = filtered.filter((e) => e.epic_id === filterProject);
    }
    if (filterUser) {
      filtered = filtered.filter((e) => e.created_by === filterUser);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aVal: any = a[sortColumn as keyof BudgetEntry];
      let bVal: any = b[sortColumn as keyof BudgetEntry];

      // Handle nested properties
      if (sortColumn === "epic") {
        aVal = a.epic?.title || "";
        bVal = b.epic?.title || "";
      } else if (sortColumn === "department") {
        aVal = a.department?.name || "";
        bVal = b.department?.name || "";
      }

      if (aVal === null || aVal === undefined) aVal = "";
      if (bVal === null || bVal === undefined) bVal = "";

      if (typeof aVal === "string") {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  };

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const toggleRowExpanded = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const SortIcon = ({ column }: { column: string }) => {
    if (sortColumn !== column) return <span className="text-xs text-zinc-600">⇅</span>;
    return sortDirection === "asc" ? <span className="text-xs">▲</span> : <span className="text-xs">▼</span>;
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

      <div className="bg-zinc-900 rounded-lg overflow-hidden mb-4 p-4 border border-zinc-800">
        <h3 className="text-sm font-semibold text-zinc-300 mb-3">Filters</h3>
        <div className="grid grid-cols-2 md:grid-cols-7 gap-3">
          <div>
            <label className="text-xs text-zinc-400 block mb-1">Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-sm text-zinc-300"
            >
              <option value="">All Types</option>
              <option value="Budget">Budget</option>
              <option value="Expense">Expense</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-zinc-400 block mb-1">Frequency</label>
            <select
              value={filterFrequency}
              onChange={(e) => setFilterFrequency(e.target.value)}
              className="w-full px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-sm text-zinc-300"
            >
              <option value="">All Frequencies</option>
              <option value="One-time">One-time</option>
              <option value="Monthly">Monthly</option>
              <option value="Quarterly">Quarterly</option>
              <option value="Yearly">Yearly</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-zinc-400 block mb-1">Fiscal Year</label>
            <select
              value={filterFiscalYear}
              onChange={(e) => setFilterFiscalYear(e.target.value)}
              className="w-full px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-sm text-zinc-300"
            >
              <option value="">All Fiscal Years</option>
              {[...new Set(budgetEntries.map((e) => e.fiscal_year))].sort().reverse().map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-zinc-400 block mb-1">Category</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-sm text-zinc-300"
            >
              <option value="">All Categories</option>
              {[...new Set(budgetEntries.map((e) => e.category))].sort().map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-zinc-400 block mb-1">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-sm text-zinc-300"
            >
              <option value="">All Statuses</option>
              <option value="PLANNED">Planned</option>
              <option value="ORDERED">Ordered</option>
              <option value="RECEIVED">Received</option>
              <option value="PAID">Paid</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-zinc-400 block mb-1">User</label>
            <select
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
              className="w-full px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-sm text-zinc-300"
            >
              <option value="">All Users</option>
              {allUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-zinc-400 block mb-1">Project</label>
            <select
              value={filterProject}
              onChange={(e) => setFilterProject(e.target.value)}
              className="w-full px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-sm text-zinc-300"
            >
              <option value="">All Projects</option>
              {budgetEntries
                .filter((e) => e.epic_id)
                .map((e) => e.epic)
                .filter(
                  (epic, idx, arr) =>
                    epic && arr.findIndex((ep) => ep?.id === epic.id) === idx
                )
                .sort((a, b) => (a?.title || "").localeCompare(b?.title || ""))
                .map((epic) => (
                  <option key={epic?.id} value={epic?.id || ""}>
                    {epic?.title}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-zinc-400 block mb-1">Department</label>
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="w-full px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-sm text-zinc-300"
            >
              <option value="">All Departments</option>
              {budgetEntries
                .filter((e) => e.department_id)
                .map((e) => e.department)
                .filter(
                  (dept, idx, arr) =>
                    dept && arr.findIndex((d) => d?.id === dept.id) === idx
                )
                .sort((a, b) => (a?.name || "").localeCompare(b?.name || ""))
                .map((dept) => (
                  <option key={dept?.id} value={dept?.id || ""}>
                    {dept?.name}
                  </option>
                ))}
            </select>
          </div>
        </div>
        {(filterType || filterFrequency || filterFiscalYear || filterCategory || filterStatus || filterProject || filterDepartment || filterUser) && (
          <button
            onClick={() => {
              setFilterType("");
              setFilterFrequency("");
              setFilterFiscalYear("");
              setFilterCategory("");
              setFilterStatus("");
              setFilterProject("");
              setFilterDepartment("");
              setFilterUser("");
            }}
            className="mt-3 text-xs text-blue-400 hover:text-blue-300"
          >
            Clear Filters
          </button>
        )}
      </div>

      <div className="bg-zinc-900 rounded-lg overflow-hidden">
        <table className="w-full text-sm text-zinc-300">
          <thead className="bg-zinc-800">
            <tr>
              <th className="px-4 py-3 text-left w-8"></th>
              <th className="px-4 py-3 text-left cursor-pointer hover:bg-zinc-700" onClick={() => handleSort("date")}>
                Date <SortIcon column="date" />
              </th>
              <th className="px-4 py-3 text-left cursor-pointer hover:bg-zinc-700" onClick={() => handleSort("status")}>
                Status <SortIcon column="status" />
              </th>
              <th className="px-4 py-3 text-left cursor-pointer hover:bg-zinc-700" onClick={() => handleSort("fiscal_year")}>
                Fiscal Year <SortIcon column="fiscal_year" />
              </th>
              <th className="px-4 py-3 text-left cursor-pointer hover:bg-zinc-700" onClick={() => handleSort("epic")}>
                Linked To <SortIcon column="epic" />
              </th>
              <th className="px-4 py-3 text-left cursor-pointer hover:bg-zinc-700" onClick={() => handleSort("entry_type")}>
                Type <SortIcon column="entry_type" />
              </th>
              <th className="px-4 py-3 text-left cursor-pointer hover:bg-zinc-700" onClick={() => handleSort("category")}>
                Category <SortIcon column="category" />
              </th>
              <th className="px-4 py-3 text-left">Description</th>
              <th className="px-4 py-3 text-left cursor-pointer hover:bg-zinc-700" onClick={() => handleSort("created_by")}>
                Created By <SortIcon column="created_by" />
              </th>
              <th className="px-4 py-3 text-right cursor-pointer hover:bg-zinc-700" onClick={() => handleSort("amount")}>
                Amount <SortIcon column="amount" />
              </th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {getFilteredAndSortedEntries().map((entry) => (
              <React.Fragment key={entry.id}>
                <tr className="border-t border-zinc-800">
                  <td className="px-4 py-3 text-center">
                    {entry.children && entry.children.length > 0 && (
                      <button onClick={() => toggleRowExpanded(entry.id)} className="text-blue-400 hover:text-blue-300">
                        {expandedRows.has(entry.id) ? "▼" : "▶"}
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-3">{formatDate(entry.date)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      entry.status === 'PLANNED' ? 'bg-yellow-900 text-yellow-200' :
                      entry.status === 'ORDERED' ? 'bg-blue-900 text-blue-200' :
                      entry.status === 'RECEIVED' ? 'bg-green-900 text-green-200' :
                      'bg-purple-900 text-purple-200'
                    }`}>
                      {entry.status || 'PLANNED'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 bg-indigo-900 text-indigo-200 rounded text-xs">
                      {entry.fiscal_year}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {entry.epic ? (
                      <span className="text-blue-400 text-xs">{entry.epic.title}</span>
                    ) : entry.department ? (
                      <span className="text-purple-400 text-xs">{entry.department.name}</span>
                    ) : (
                      <span className="text-zinc-500 text-xs">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs ${
                      entry.entry_type === "Budget"
                        ? "bg-blue-900 text-blue-200"
                        : "bg-red-900 text-red-200"
                    }`}>
                      {entry.entry_type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">{entry.category}</td>
                  <td className="px-4 py-3 text-sm">{entry.description || "-"}</td>
                  <td className="px-4 py-3 text-sm text-zinc-400">
                    {entry.user?.name || entry.user?.email || "-"}
                  </td>
                  <td className="px-4 py-3 text-right font-mono">
                    {formatCurrency(entry.amount, entry.currency)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Button 
                        variant="flat" 
                        size="sm" 
                        onClick={() => router.push(`/projects/budget/${entry.id}`)}
                      >
                        View
                      </Button>
                      <Button 
                        variant="solid" 
                        size="sm" 
                        color="primary"
                        onClick={() => {
                          setEditingEntry(entry);
                          setIsModalOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                    </div>
                  </td>
                </tr>
                
                {/* Show children if expanded */}
                {expandedRows.has(entry.id) && entry.children && entry.children.length > 0 && (
                  <>
                    {entry.children.map((child) => (
                      <tr key={child.id} className="border-t border-zinc-700 bg-zinc-800/30">
                        <td className="px-4 py-3"></td>
                        <td className="px-4 py-3 pl-8 text-sm">├ {formatDate(child.date)}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            child.status === 'PLANNED' ? 'bg-yellow-900 text-yellow-200' :
                            child.status === 'ORDERED' ? 'bg-blue-900 text-blue-200' :
                            child.status === 'RECEIVED' ? 'bg-green-900 text-green-200' :
                            'bg-purple-900 text-purple-200'
                          }`}>
                            {child.status || 'PLANNED'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-zinc-500">{child.fiscal_year}</td>
                        <td className="px-4 py-3 text-sm text-zinc-500">-</td>
                        <td className="px-4 py-3 text-sm">{child.entry_type}</td>
                        <td className="px-4 py-3 text-sm">{child.category}</td>
                        <td className="px-4 py-3 text-sm text-zinc-400">{child.description || "-"}</td>
                        <td className="px-4 py-3 text-sm text-zinc-400">
                          {child.user?.name || child.user?.email || "-"}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-sm">
                          {formatCurrency(child.amount, child.currency)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <Button 
                              variant="flat" 
                              size="sm" 
                              onClick={() => router.push(`/projects/budget/${child.id}`)}
                            >
                              View
                            </Button>
                            <Button 
                              variant="solid" 
                              size="sm" 
                              color="primary"
                              onClick={() => {
                                setEditingEntry(child);
                                setIsModalOpen(true);
                              }}
                            >
                              Edit
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </>
                )}
              </React.Fragment>
            ))}
            {budgetEntries.length > 0 && (
              <tr className="border-t-2 border-zinc-700 bg-zinc-800/50 font-semibold">
                <td colSpan={8} className="px-4 py-3 text-right">
                  Total Amount ({getFilteredAndSortedEntries().length} entries):
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
            {getFilteredAndSortedEntries().length === 0 && (
              <tr>
                <td
                  colSpan={14}
                  className="px-4 py-8 text-center text-zinc-500"
                >
                  {budgetEntries.length === 0 ? "No budget entries found. Add your first entry!" : "No entries match the selected filters."}
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
