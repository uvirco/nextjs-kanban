"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Input,
  Select,
  SelectItem,
  Tabs,
  Tab,
} from "@nextui-org/react";
import {
  IconAlertTriangle,
  IconChevronLeft,
  IconPlus,
  IconFilter,
  IconRefresh,
} from "@tabler/icons-react";
import Link from "next/link";
import dynamic from "next/dynamic";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

interface Risk {
  id: string;
  title: string;
  description: string;
  probability: string;
  impact: string;
  status: string;
  mitigation_plan: string;
  risk_owner: string | null;
  risk_category: string;
  likelihood_score: number;
  impact_score: number;
  risk_score: number;
  residual_risk_score: number | null;
  mitigation_status: string;
  key_risk_indicator: string | null;
  next_review_date: string | null;
  created_at: string;
  updated_at: string;
}

const getRiskColor = (score: number): string => {
  if (score >= 15) return "danger";
  if (score >= 9) return "warning";
  return "success";
};

const getRiskLabel = (score: number): string => {
  if (score >= 15) return "Critical";
  if (score >= 9) return "High";
  if (score >= 4) return "Medium";
  return "Low";
};

const getStatusColor = (status: string): string => {
  switch (status) {
    case "Open":
      return "warning";
    case "Mitigated":
      return "info";
    case "Closed":
      return "success";
    default:
      return "default";
  }
};

const getMitigationColor = (status: string): string => {
  switch (status) {
    case "Complete":
      return "success";
    case "In Progress":
      return "warning";
    case "On Hold":
      return "danger";
    default:
      return "default";
  }
};

const getCategoryColor = (category: string): string => {
  const colors: Record<
    string,
    "primary" | "secondary" | "warning" | "danger" | "success" | "default"
  > = {
    Strategic: "primary",
    Operational: "secondary",
    Financial: "warning",
    Compliance: "danger",
    Market: "success",
    Other: "default",
  };
  return colors[category] || "default";
};

export default function RiskManagementPage() {
  const [risks, setRisks] = useState<Risk[]>([]);
  const [filteredRisks, setFilteredRisks] = useState<Risk[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRisk, setSelectedRisk] = useState<Risk | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [filterOwner, setFilterOwner] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("risk_score_desc");
  const [heatmapTab, setHeatmapTab] = useState<string>("matrix");
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  // Load risks
  useEffect(() => {
    loadRisks();
  }, []);

  const loadRisks = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("risks")
        .select("*")
        .order("risk_score", { ascending: false });

      if (error) throw error;
      setRisks(data || []);
      applyFilters(
        data || [],
        filterStatus,
        filterCategory,
        filterOwner,
        sortBy,
      );
    } catch (error) {
      console.error("Error loading risks:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (
    data: Risk[],
    status: string,
    category: string,
    owner: string,
    sort: string,
  ) => {
    let filtered = [...data];

    if (status) {
      filtered = filtered.filter((r) => r.status === status);
    }
    if (category) {
      filtered = filtered.filter((r) => r.risk_category === category);
    }
    if (owner) {
      filtered = filtered.filter((r) => r.risk_owner === owner);
    }

    // Sort
    switch (sort) {
      case "risk_score_desc":
        filtered.sort((a, b) => (b.risk_score || 0) - (a.risk_score || 0));
        break;
      case "risk_score_asc":
        filtered.sort((a, b) => (a.risk_score || 0) - (b.risk_score || 0));
        break;
      case "title_asc":
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "newest":
        filtered.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );
        break;
    }

    setFilteredRisks(filtered);
  };

  const handleFilterChange = (
    status: string,
    category: string,
    owner: string,
    sort: string,
  ) => {
    setFilterStatus(status);
    setFilterCategory(category);
    setFilterOwner(owner);
    setSortBy(sort);
    applyFilters(risks, status, category, owner, sort);
  };

  // Calculate stats
  const stats = {
    total: risks.length,
    open: risks.filter((r) => r.status === "Open").length,
    critical: risks.filter((r) => (r.risk_score || 0) >= 15).length,
    avgScore:
      risks.length > 0
        ? Math.round(
            risks.reduce((sum, r) => sum + (r.risk_score || 0), 0) /
              risks.length,
          )
        : 0,
  };

  // Get unique values for filters
  const uniqueOwners = [
    ...new Set(risks.map((r) => r.risk_owner).filter(Boolean)),
  ];
  const uniqueCategories = [...new Set(risks.map((r) => r.risk_category))];

  // Build heatmap data
  const heatmapData: Record<string, Record<string, number>> = {
    "1 - Low": { "1 - Low": 0, "2": 0, "3 - Medium": 0, "4": 0, "5 - High": 0 },
    "2": { "1 - Low": 0, "2": 0, "3 - Medium": 0, "4": 0, "5 - High": 0 },
    "3 - Medium": {
      "1 - Low": 0,
      "2": 0,
      "3 - Medium": 0,
      "4": 0,
      "5 - High": 0,
    },
    "4": { "1 - Low": 0, "2": 0, "3 - Medium": 0, "4": 0, "5 - High": 0 },
    "5 - High": {
      "1 - Low": 0,
      "2": 0,
      "3 - Medium": 0,
      "4": 0,
      "5 - High": 0,
    },
  };

  risks.forEach((risk) => {
    const likelihood = risk.likelihood_score || 2;
    const impact = risk.impact_score || 2;
    const likelihoodLabel =
      likelihood === 1
        ? "1 - Low"
        : likelihood === 2
          ? "2"
          : likelihood === 3
            ? "3 - Medium"
            : likelihood === 4
              ? "4"
              : "5 - High";
    const impactLabel =
      impact === 1
        ? "1 - Low"
        : impact === 2
          ? "2"
          : impact === 3
            ? "3 - Medium"
            : impact === 4
              ? "4"
              : "5 - High";
    heatmapData[likelihoodLabel][impactLabel]++;
  });

  return (
    <div className="w-full h-full flex flex-col bg-zinc-950">
      <style>{`
        /* Dark theme overrides for NextUI Select components */
        .dark [data-slot="base"] {
          background-color: rgb(24, 24, 27);
          border-color: rgb(63, 63, 70);
        }
        .dark [role="listbox"] {
          background-color: rgb(24, 24, 27) !important;
        }
        .dark [role="option"] {
          color: rgb(227, 227, 229) !important;
        }
        .dark [role="option"]:hover {
          background-color: rgb(39, 39, 42) !important;
        }
        /* Input label color */
        .dark [data-slot="label"] {
          color: rgb(161, 161, 170) !important;
        }
        /* NextUI Select Input */
        .dark input[role="combobox"],
        .dark input[type="text"] {
          background-color: rgb(24, 24, 27) !important;
          color: rgb(227, 227, 229) !important;
          border-color: rgb(63, 63, 70) !important;
        }
        /* Table styling */
        .dark table {
          background-color: rgb(9, 9, 11) !important;
        }
        .dark thead {
          background-color: rgb(24, 24, 27) !important;
        }
        .dark tbody tr {
          background-color: rgb(18, 18, 21) !important;
          border-color: rgb(39, 39, 42) !important;
        }
        .dark tbody tr:hover {
          background-color: rgb(39, 39, 42) !important;
        }
        .dark td, .dark th {
          color: rgb(227, 227, 229) !important;
          border-color: rgb(39, 39, 42) !important;
        }
        /* Modal dark theme */
        .dark [role="dialog"] {
          background-color: rgb(18, 18, 21) !important;
        }
      `}</style>
      {/* Header */}
      <div className="border-b border-zinc-800 p-6 bg-zinc-900">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="hover:text-zinc-300 transition-colors text-zinc-400"
            >
              <IconChevronLeft size={24} />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-zinc-100 flex items-center gap-2">
                <IconAlertTriangle className="text-yellow-600" size={32} />
                Risk Management
              </h1>
              <p className="text-zinc-500 text-sm mt-1">
                Identify, assess, and mitigate organizational risks
              </p>
            </div>
          </div>
          <Button
            isIconOnly
            className="bg-zinc-700 hover:bg-zinc-600 text-zinc-100"
            onPress={() => {
              /* Add new risk */
            }}
          >
            <IconPlus size={20} />
          </Button>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 border-b border-zinc-800 bg-zinc-900/50">
        <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-700 hover:border-blue-700/50 transition-colors">
          <div className="text-sm text-zinc-500 mb-1">Total Risks</div>
          <div className="text-3xl font-bold text-blue-300">{stats.total}</div>
        </div>
        <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-700 hover:border-orange-700/50 transition-colors">
          <div className="text-sm text-zinc-500 mb-1">Open Risks</div>
          <div className="text-3xl font-bold text-orange-300">{stats.open}</div>
        </div>
        <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-700 hover:border-red-700/50 transition-colors">
          <div className="text-sm text-zinc-500 mb-1">Critical Risks</div>
          <div className="text-3xl font-bold text-red-300">
            {stats.critical}
          </div>
        </div>
        <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-700 hover:border-purple-700/50 transition-colors">
          <div className="text-sm text-zinc-500 mb-1">Avg Risk Score</div>
          <div className="text-3xl font-bold text-purple-300">
            {stats.avgScore}
          </div>
        </div>
      </div>

      {/* Heatmap */}
      <div className="p-6 border-b border-zinc-800 bg-zinc-900/30">
        <h2 className="text-xl font-bold text-zinc-100 mb-4">
          Risk Analysis Visualizations
        </h2>
        <Tabs
          aria-label="Heatmap views"
          selectedKey={heatmapTab}
          onSelectionChange={(key) => setHeatmapTab(String(key))}
          classNames={{
            base: "w-full dark",
            tabList:
              "gap-6 w-full relative rounded-none p-0 border-b border-zinc-700 bg-transparent",
            cursor: "w-full bg-zinc-700",
            tab: "max-w-fit px-0 h-12 text-zinc-400 hover:text-zinc-300",
            tabContent: "group-data-[selected=true]:text-zinc-100",
          }}
        >
          <Tab key="grid" title="Risk Matrix Grid (HTML)">
            <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-700 overflow-x-auto mt-4">
              <div className="inline-block min-w-full">
                <div
                  className="grid gap-1"
                  style={{
                    gridTemplateColumns: "auto repeat(5, 1fr)",
                    width: "fit-content",
                  }}
                >
                  {/* Header row */}
                  <div className="font-bold text-xs text-zinc-500 p-2 text-right">
                    Impact →
                  </div>
                  {["1 - Low", "2", "3 - Medium", "4", "5 - High"].map(
                    (label) => (
                      <div
                        key={label}
                        className="font-bold text-xs text-zinc-500 p-2 text-center"
                      >
                        {label}
                      </div>
                    ),
                  )}
                  {/* Rows */}
                  {["5 - High", "4", "3 - Medium", "2", "1 - Low"].map(
                    (likelihood) => (
                      <div key={`row-${likelihood}`} className="contents">
                        <div className="font-bold text-xs text-zinc-500 p-2 text-right">
                          {likelihood}
                        </div>
                        {["1 - Low", "2", "3 - Medium", "4", "5 - High"].map(
                          (impact) => {
                            const count =
                              heatmapData[likelihood]?.[impact] || 0;
                            const score =
                              Object.keys([
                                "1 - Low",
                                "2",
                                "3 - Medium",
                                "4",
                                "5 - High",
                              ]).indexOf(likelihood) *
                                5 +
                              Object.keys([
                                "1 - Low",
                                "2",
                                "3 - Medium",
                                "4",
                                "5 - High",
                              ]).indexOf(impact) +
                              1;
                            const bgColor =
                              score >= 15
                                ? "bg-red-950/60 border-red-700/50"
                                : score >= 9
                                  ? "bg-orange-950/60 border-orange-700/50"
                                  : "bg-green-950/60 border-green-700/50";
                            return (
                              <div
                                key={`cell-${likelihood}-${impact}`}
                                className={`p-3 text-center border rounded ${bgColor}`}
                              >
                                <div className="text-lg font-bold text-zinc-100">
                                  {count}
                                </div>
                              </div>
                            );
                          },
                        )}
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>
          </Tab>

          <Tab key="matrix" title="Risk Matrix (ECharts)">
            <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-700 mt-4 h-96">
              <ReactECharts
                option={{
                  title: {
                    text: "Likelihood vs Impact",
                    left: "center",
                    textStyle: { color: "#e4e4e7" },
                  },
                  tooltip: {
                    position: "top",
                    backgroundColor: "rgba(24,24,27,0.9)",
                    borderColor: "#63636e",
                    textStyle: { color: "#e4e4e7" },
                  },
                  grid: { height: "70%", top: 80 },
                  xAxis: {
                    type: "category",
                    data: ["1-Low", "2", "3-Medium", "4", "5-High"],
                    splitArea: { show: true },
                    axisLine: { lineStyle: { color: "#3f3f46" } },
                    axisLabel: { color: "#a1a1aa" },
                  },
                  yAxis: {
                    type: "category",
                    data: ["5-High", "4", "3-Medium", "2", "1-Low"],
                    splitArea: { show: true },
                    axisLine: { lineStyle: { color: "#3f3f46" } },
                    axisLabel: { color: "#a1a1aa" },
                  },
                  visualMap: {
                    min: 0,
                    max: Math.max(
                      ...Object.values(heatmapData).flatMap((row) =>
                        Object.values(row),
                      ),
                    ),
                    calculable: true,
                    realtime: true,
                    inRange: {
                      color: [
                        "#064e3b",
                        "#10b981",
                        "#fbbf24",
                        "#f97316",
                        "#7f1d1d",
                      ],
                    },
                    textStyle: { color: "#a1a1aa" },
                  },
                  series: [
                    {
                      name: "Risk Count",
                      type: "heatmap",
                      data: Object.entries(heatmapData).flatMap(
                        ([likelihood, impacts], liIdx) =>
                          Object.entries(impacts).map(
                            ([impact, count], impIdx) => [
                              impIdx,
                              4 - liIdx,
                              count,
                            ],
                          ),
                      ),
                      emphasis: {
                        itemStyle: { borderColor: "#fff", borderWidth: 2 },
                      },
                    },
                  ],
                }}
                style={{ width: "100%", height: "100%" }}
              />
            </div>
          </Tab>

          <Tab key="calendar" title="Risk Activity Calendar">
            <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-700 mt-4 h-96">
              {risks.length > 0 ? (
                <ReactECharts
                  option={{
                    tooltip: {
                      formatter: (params: any) => {
                        if (params.componentSubType === "heatmap") {
                          return `${params.data[0]}: ${params.data[2]} risks`;
                        }
                        return "";
                      },
                      backgroundColor: "rgba(24,24,27,0.9)",
                      borderColor: "#63636e",
                      textStyle: { color: "#e4e4e7" },
                    },
                    grid: { height: "80%", top: 50 },
                    xAxis: {
                      type: "category",
                      data: Array.from(
                        { length: 30 },
                        (_, i) => `Day ${i + 1}`,
                      ),
                      axisLine: { lineStyle: { color: "#3f3f46" } },
                      axisLabel: { color: "#a1a1aa", interval: 4 },
                    },
                    yAxis: {
                      type: "category",
                      data: ["Week 4", "Week 3", "Week 2", "Week 1"],
                      axisLine: { lineStyle: { color: "#3f3f46" } },
                      axisLabel: { color: "#a1a1aa" },
                    },
                    visualMap: {
                      min: 0,
                      max: 5,
                      calculable: true,
                      inRange: {
                        color: [
                          "#1f2937",
                          "#3b82f6",
                          "#ec4899",
                          "#f97316",
                          "#dc2626",
                        ],
                      },
                      textStyle: { color: "#a1a1aa" },
                    },
                    series: [
                      {
                        name: "Risk Activity",
                        type: "heatmap",
                        data: Array.from({ length: 30 }, (_, dayIdx) => [
                          dayIdx,
                          Math.floor(Math.random() * 4),
                          Math.floor(Math.random() * 6),
                        ]),
                        emphasis: {
                          itemStyle: { borderColor: "#fff", borderWidth: 2 },
                        },
                      },
                    ],
                  }}
                  style={{ width: "100%", height: "100%" }}
                />
              ) : (
                <p className="text-zinc-500 text-center py-20">
                  No risk data available
                </p>
              )}
            </div>
          </Tab>

          <Tab key="scatter" title="Risk Scatter Map">
            <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-700 mt-4 h-96">
              <ReactECharts
                option={{
                  tooltip: {
                    formatter: (params: any) => {
                      if (params.componentSubType === "scatter") {
                        return `Risk Score: ${params.data[1]}<br/>Owner: ${params.data[2] || "Unassigned"}`;
                      }
                      return "";
                    },
                    backgroundColor: "rgba(24,24,27,0.9)",
                    borderColor: "#63636e",
                    textStyle: { color: "#e4e4e7" },
                  },
                  grid: {
                    left: "10%",
                    right: "10%",
                    bottom: "15%",
                    top: "10%",
                    containLabel: true,
                  },
                  xAxis: {
                    name: "Likelihood →",
                    nameTextStyle: { color: "#a1a1aa" },
                    type: "value",
                    min: 0,
                    max: 5,
                    axisLine: { lineStyle: { color: "#3f3f46" } },
                    axisLabel: { color: "#a1a1aa" },
                    splitLine: { lineStyle: { color: "#27272a" } },
                  },
                  yAxis: {
                    name: "Impact →",
                    nameTextStyle: { color: "#a1a1aa" },
                    type: "value",
                    min: 0,
                    max: 5,
                    axisLine: { lineStyle: { color: "#3f3f46" } },
                    axisLabel: { color: "#a1a1aa" },
                    splitLine: { lineStyle: { color: "#27272a" } },
                  },
                  visualMap: {
                    min: 0,
                    max: 25,
                    calculable: true,
                    inRange: {
                      color: ["#10b981", "#fbbf24", "#f97316", "#dc2626"],
                    },
                    textStyle: { color: "#a1a1aa" },
                    orient: "vertical",
                    right: 10,
                    top: "center",
                  },
                  series: [
                    {
                      name: "Risks",
                      type: "scatter",
                      symbolSize: (val: any) => val[1] * 3,
                      data: risks.map((r) => [
                        r.likelihood_score || 2,
                        r.impact_score || 2,
                        r.risk_score || 0,
                        r.risk_owner || "Unassigned",
                      ]),
                      itemStyle: {
                        opacity: 0.8,
                        borderColor: "#63636e",
                        borderWidth: 1,
                      },
                      emphasis: {
                        itemStyle: {
                          borderColor: "#fff",
                          borderWidth: 2,
                          opacity: 1,
                        },
                      },
                    },
                  ],
                }}
                style={{ width: "100%", height: "100%" }}
              />
            </div>
          </Tab>

          <Tab key="bar" title="Risk Distribution">
            <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-700 mt-4 h-96">
              <ReactECharts
                option={{
                  tooltip: {
                    backgroundColor: "rgba(24,24,27,0.9)",
                    borderColor: "#63636e",
                    textStyle: { color: "#e4e4e7" },
                  },
                  grid: {
                    left: "15%",
                    right: "10%",
                    bottom: "15%",
                    top: "10%",
                    containLabel: true,
                  },
                  xAxis: {
                    type: "category",
                    data: uniqueCategories,
                    axisLine: { lineStyle: { color: "#3f3f46" } },
                    axisLabel: { color: "#a1a1aa" },
                  },
                  yAxis: {
                    type: "value",
                    axisLine: { lineStyle: { color: "#3f3f46" } },
                    axisLabel: { color: "#a1a1aa" },
                    splitLine: { lineStyle: { color: "#27272a" } },
                  },
                  series: [
                    {
                      name: "Critical (≥15)",
                      type: "bar",
                      data: uniqueCategories.map(
                        (cat) =>
                          risks.filter(
                            (r) =>
                              r.risk_category === cat &&
                              (r.risk_score || 0) >= 15,
                          ).length,
                      ),
                      itemStyle: { color: "#dc2626" },
                    },
                    {
                      name: "High (9-14)",
                      type: "bar",
                      data: uniqueCategories.map(
                        (cat) =>
                          risks.filter(
                            (r) =>
                              r.risk_category === cat &&
                              (r.risk_score || 0) >= 9 &&
                              (r.risk_score || 0) < 15,
                          ).length,
                      ),
                      itemStyle: { color: "#f97316" },
                    },
                    {
                      name: "Medium (4-8)",
                      type: "bar",
                      data: uniqueCategories.map(
                        (cat) =>
                          risks.filter(
                            (r) =>
                              r.risk_category === cat &&
                              (r.risk_score || 0) >= 4 &&
                              (r.risk_score || 0) < 9,
                          ).length,
                      ),
                      itemStyle: { color: "#fbbf24" },
                    },
                    {
                      name: "Low (<4)",
                      type: "bar",
                      data: uniqueCategories.map(
                        (cat) =>
                          risks.filter(
                            (r) =>
                              r.risk_category === cat &&
                              (r.risk_score || 0) < 4,
                          ).length,
                      ),
                      itemStyle: { color: "#10b981" },
                    },
                  ],
                  legend: {
                    textStyle: { color: "#a1a1aa" },
                    bottom: 0,
                  },
                }}
                style={{ width: "100%", height: "100%" }}
              />
            </div>
          </Tab>

          <Tab key="bubble" title="Bubble Map">
            <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-700 mt-4 h-[700px]">
              <ReactECharts
                option={{
                  tooltip: {
                    formatter: (params: any) => {
                      if (params.componentSubType === "scatter") {
                        const statusColors: { [key: string]: string } = {
                          "Not Started": "red",
                          "In Progress": "yellow",
                          Complete: "green",
                          "On Hold": "gray",
                        };
                        return `<strong>${params.data[3]}</strong><br/>Likelihood: ${params.data[0]}/5<br/>Impact: ${params.data[1]}/5<br/>Risk Score: ${params.data[2]}<br/>Category: ${params.data[4]}<br/><strong>Mitigation: ${params.data[5]}</strong>`;
                      }
                      return "";
                    },
                    backgroundColor: "rgba(24,24,27,0.95)",
                    borderColor: "#63636e",
                    textStyle: { color: "#e4e4e7" },
                    confine: true,
                  },
                  grid: {
                    left: "15%",
                    right: "15%",
                    bottom: "10%",
                    top: "10%",
                    containLabel: true,
                  },
                  xAxis: {
                    name: "Likelihood",
                    nameTextStyle: { color: "#a1a1aa", fontSize: 12 },
                    type: "value",
                    min: 0,
                    max: 5.5,
                    axisLine: { lineStyle: { color: "#3f3f46" } },
                    axisLabel: { color: "#a1a1aa" },
                    splitLine: { lineStyle: { color: "#27272a" } },
                  },
                  yAxis: {
                    name: "Impact",
                    nameTextStyle: { color: "#a1a1aa", fontSize: 12 },
                    type: "value",
                    min: 0,
                    max: 5.5,
                    axisLine: { lineStyle: { color: "#3f3f46" } },
                    axisLabel: { color: "#a1a1aa" },
                    splitLine: { lineStyle: { color: "#27272a" } },
                  },
                  legend: {
                    data: ["Not Started", "In Progress", "Complete", "On Hold"],
                    textStyle: { color: "#a1a1aa" },
                    top: 10,
                  },
                  series: [
                    {
                      name: "Not Started",
                      type: "scatter",
                      symbolSize: (val: any) => Math.max(val[2] * 2, 10),
                      data: risks
                        .filter(
                          (r) =>
                            (r.mitigation_status || "Not Started") ===
                            "Not Started",
                        )
                        .map((r) => [
                          r.likelihood_score || 2,
                          r.impact_score || 2,
                          r.risk_score || 0,
                          r.title,
                          r.risk_category,
                        ]),
                      itemStyle: {
                        color: "#dc2626",
                        opacity: 0.7,
                        borderColor: "#e4e4e7",
                        borderWidth: 1.5,
                      },
                      emphasis: {
                        itemStyle: {
                          borderColor: "#fff",
                          borderWidth: 2.5,
                          opacity: 1,
                          shadowColor: "rgba(255,255,255,0.5)",
                          shadowBlur: 10,
                        },
                      },
                    },
                    {
                      name: "In Progress",
                      type: "scatter",
                      symbolSize: (val: any) => Math.max(val[2] * 2, 10),
                      data: risks
                        .filter((r) => r.mitigation_status === "In Progress")
                        .map((r) => [
                          r.likelihood_score || 2,
                          r.impact_score || 2,
                          r.risk_score || 0,
                          r.title,
                          r.risk_category,
                        ]),
                      itemStyle: {
                        color: "#f59e0b",
                        opacity: 0.7,
                        borderColor: "#e4e4e7",
                        borderWidth: 1.5,
                      },
                      emphasis: {
                        itemStyle: {
                          borderColor: "#fff",
                          borderWidth: 2.5,
                          opacity: 1,
                          shadowColor: "rgba(255,255,255,0.5)",
                          shadowBlur: 10,
                        },
                      },
                    },
                    {
                      name: "Complete",
                      type: "scatter",
                      symbolSize: (val: any) => Math.max(val[2] * 2, 10),
                      data: risks
                        .filter((r) => r.mitigation_status === "Complete")
                        .map((r) => [
                          r.likelihood_score || 2,
                          r.impact_score || 2,
                          r.risk_score || 0,
                          r.title,
                          r.risk_category,
                        ]),
                      itemStyle: {
                        color: "#10b981",
                        opacity: 0.7,
                        borderColor: "#e4e4e7",
                        borderWidth: 1.5,
                      },
                      emphasis: {
                        itemStyle: {
                          borderColor: "#fff",
                          borderWidth: 2.5,
                          opacity: 1,
                          shadowColor: "rgba(255,255,255,0.5)",
                          shadowBlur: 10,
                        },
                      },
                    },
                    {
                      name: "On Hold",
                      type: "scatter",
                      symbolSize: (val: any) => Math.max(val[2] * 2, 10),
                      data: risks
                        .filter((r) => r.mitigation_status === "On Hold")
                        .map((r) => [
                          r.likelihood_score || 2,
                          r.impact_score || 2,
                          r.risk_score || 0,
                          r.title,
                          r.risk_category,
                        ]),
                      itemStyle: {
                        color: "#6b7280",
                        opacity: 0.7,
                        borderColor: "#e4e4e7",
                        borderWidth: 1.5,
                      },
                      emphasis: {
                        itemStyle: {
                          borderColor: "#fff",
                          borderWidth: 2.5,
                          opacity: 1,
                          shadowColor: "rgba(255,255,255,0.5)",
                          shadowBlur: 10,
                        },
                      },
                    },
                  ],
                }}
                style={{ width: "100%", height: "100%" }}
              />
            </div>
          </Tab>
        </Tabs>
      </div>

      {/* Filters */}
      <div className="p-6 border-b border-zinc-800 bg-zinc-900/30">
        <div className="flex items-center gap-2 mb-4">
          <IconFilter size={20} className="text-zinc-500" />
          <h3 className="text-sm font-semibold text-zinc-100">
            Filters & Sort
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <Select
            label="Status"
            placeholder="All statuses"
            value={filterStatus}
            onChange={(e) =>
              handleFilterChange(
                e.target.value,
                filterCategory,
                filterOwner,
                sortBy,
              )
            }
            className="w-full dark"
            classNames={{
              base: "dark bg-zinc-900",
              label: "text-zinc-400",
              trigger:
                "bg-zinc-900 border-zinc-700 data-[hover=true]:border-zinc-600",
              popoverContent: "bg-zinc-900 border-zinc-700",
            }}
          >
            <SelectItem key="Open" value="Open">
              Open
            </SelectItem>
            <SelectItem key="Mitigated" value="Mitigated">
              Mitigated
            </SelectItem>
            <SelectItem key="Closed" value="Closed">
              Closed
            </SelectItem>
          </Select>
          <Select
            label="Category"
            placeholder="All categories"
            value={filterCategory}
            onChange={(e) =>
              handleFilterChange(
                filterStatus,
                e.target.value,
                filterOwner,
                sortBy,
              )
            }
            className="w-full dark"
            classNames={{
              base: "dark bg-zinc-900",
              label: "text-zinc-400",
              trigger:
                "bg-zinc-900 border-zinc-700 data-[hover=true]:border-zinc-600",
              popoverContent: "bg-zinc-900 border-zinc-700",
            }}
          >
            {uniqueCategories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </Select>
          <Select
            label="Owner"
            placeholder="All owners"
            value={filterOwner}
            onChange={(e) =>
              handleFilterChange(
                filterStatus,
                filterCategory,
                e.target.value,
                sortBy,
              )
            }
            className="w-full dark"
            classNames={{
              base: "dark bg-zinc-900",
              label: "text-zinc-400",
              trigger:
                "bg-zinc-900 border-zinc-700 data-[hover=true]:border-zinc-600",
              popoverContent: "bg-zinc-900 border-zinc-700",
            }}
          >
            {uniqueOwners.map((owner) => (
              <SelectItem key={owner as string} value={owner as string}>
                {owner}
              </SelectItem>
            ))}
          </Select>
          <Select
            label="Sort By"
            value={sortBy}
            onChange={(e) =>
              handleFilterChange(
                filterStatus,
                filterCategory,
                filterOwner,
                e.target.value,
              )
            }
            className="w-full dark"
            classNames={{
              base: "dark bg-zinc-900",
              label: "text-zinc-400",
              trigger:
                "bg-zinc-900 border-zinc-700 data-[hover=true]:border-zinc-600",
              popoverContent: "bg-zinc-900 border-zinc-700",
            }}
          >
            <SelectItem key="risk_score_desc" value="risk_score_desc">
              Risk Score (High→Low)
            </SelectItem>
            <SelectItem key="risk_score_asc" value="risk_score_asc">
              Risk Score (Low→High)
            </SelectItem>
            <SelectItem key="title_asc" value="title_asc">
              Title (A→Z)
            </SelectItem>
            <SelectItem key="newest" value="newest">
              Newest First
            </SelectItem>
          </Select>
          <Button
            isIconOnly
            className="bg-zinc-700 hover:bg-zinc-600 text-zinc-100"
            onPress={loadRisks}
          >
            <IconRefresh size={20} />
          </Button>
        </div>
      </div>

      {/* Risks Table */}
      <div className="flex-1 overflow-auto p-6 bg-zinc-950">
        <Table
          aria-label="Risk register"
          className="bg-zinc-900 dark"
          classNames={{
            base: "bg-zinc-900",
            table: "bg-zinc-900",
            th: "bg-zinc-800 text-zinc-100 border-zinc-700",
            td: "text-zinc-100 border-zinc-700",
          }}
        >
          <TableHeader>
            <TableColumn key="title" className="bg-zinc-800 text-zinc-100">
              TITLE
            </TableColumn>
            <TableColumn key="category" className="bg-zinc-800 text-zinc-100">
              CATEGORY
            </TableColumn>
            <TableColumn key="risk_score" className="bg-zinc-800 text-zinc-100">
              RISK SCORE
            </TableColumn>
            <TableColumn key="likelihood" className="bg-zinc-800 text-zinc-100">
              LIKELIHOOD
            </TableColumn>
            <TableColumn key="impact" className="bg-zinc-800 text-zinc-100">
              IMPACT
            </TableColumn>
            <TableColumn key="status" className="bg-zinc-800 text-zinc-100">
              STATUS
            </TableColumn>
            <TableColumn
              key="mitigation_status"
              className="bg-zinc-800 text-zinc-100"
            >
              MITIGATION
            </TableColumn>
            <TableColumn key="owner" className="bg-zinc-800 text-zinc-100">
              OWNER
            </TableColumn>
            <TableColumn key="actions" className="bg-zinc-800 text-zinc-100">
              ACTIONS
            </TableColumn>
          </TableHeader>
          <TableBody
            items={filteredRisks}
            emptyContent="No risks found"
            isLoading={loading}
          >
            {(risk) => (
              <TableRow
                key={risk.id}
                className="hover:bg-zinc-800 cursor-pointer border-zinc-700"
              >
                <TableCell className="max-w-xs truncate text-zinc-100">
                  {risk.title}
                </TableCell>
                <TableCell>
                  <Chip
                    size="sm"
                    color={getCategoryColor(risk.risk_category) as any}
                    variant="flat"
                    className="capitalize"
                  >
                    {risk.risk_category}
                  </Chip>
                </TableCell>
                <TableCell>
                  <Chip
                    size="sm"
                    color={getRiskColor(risk.risk_score || 0) as any}
                    variant="flat"
                  >
                    {getRiskLabel(risk.risk_score || 0)} ({risk.risk_score})
                  </Chip>
                </TableCell>
                <TableCell className="text-center text-zinc-300">
                  {risk.likelihood_score || "-"}/5
                </TableCell>
                <TableCell className="text-center text-zinc-300">
                  {risk.impact_score || "-"}/5
                </TableCell>
                <TableCell>
                  <Chip
                    size="sm"
                    color={getStatusColor(risk.status) as any}
                    variant="flat"
                    className="capitalize"
                  >
                    {risk.status}
                  </Chip>
                </TableCell>
                <TableCell>
                  <Chip
                    size="sm"
                    color={getMitigationColor(risk.mitigation_status) as any}
                    variant="flat"
                    className="capitalize text-xs"
                  >
                    {risk.mitigation_status}
                  </Chip>
                </TableCell>
                <TableCell className="text-sm text-zinc-500">
                  {risk.risk_owner || "-"}
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant="flat"
                    className="bg-zinc-700 hover:bg-zinc-600 text-zinc-100"
                    onPress={() => {
                      setSelectedRisk(risk);
                      onOpen();
                    }}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        size="2xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <Chip
                    color={getRiskColor(selectedRisk?.risk_score || 0) as any}
                    variant="flat"
                  >
                    {getRiskLabel(selectedRisk?.risk_score || 0)}
                  </Chip>
                  {selectedRisk?.title}
                </div>
              </ModalHeader>
              <ModalBody>
                {selectedRisk && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-zinc-500">Risk Score</p>
                        <p className="text-xl font-bold text-zinc-100">
                          {selectedRisk.risk_score || "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-zinc-500">Category</p>
                        <p className="text-xl font-bold text-zinc-100">
                          {selectedRisk.risk_category}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-zinc-500">
                          Likelihood Score
                        </p>
                        <p className="text-xl font-bold text-zinc-100">
                          {selectedRisk.likelihood_score || "-"}/5
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-zinc-500">Impact Score</p>
                        <p className="text-xl font-bold text-zinc-100">
                          {selectedRisk.impact_score || "-"}/5
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-zinc-500">Status</p>
                        <Chip
                          size="sm"
                          color={getStatusColor(selectedRisk.status) as any}
                          variant="flat"
                          className="capitalize"
                        >
                          {selectedRisk.status}
                        </Chip>
                      </div>
                      <div>
                        <p className="text-sm text-zinc-500">
                          Mitigation Status
                        </p>
                        <Chip
                          size="sm"
                          color={
                            getMitigationColor(
                              selectedRisk.mitigation_status,
                            ) as any
                          }
                          variant="flat"
                          className="capitalize"
                        >
                          {selectedRisk.mitigation_status}
                        </Chip>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-zinc-500 mb-2">Description</p>
                      <p className="text-zinc-100 bg-zinc-800 p-3 rounded">
                        {selectedRisk.description || "-"}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-zinc-500 mb-2">Risk Owner</p>
                      <p className="text-zinc-100">
                        {selectedRisk.risk_owner || "-"}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-zinc-500 mb-2">
                        Mitigation Plan
                      </p>
                      <p className="text-zinc-100 bg-zinc-800 p-3 rounded">
                        {selectedRisk.mitigation_plan || "-"}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-zinc-500 mb-2">
                        Key Risk Indicator
                      </p>
                      <p className="text-zinc-100">
                        {selectedRisk.key_risk_indicator || "-"}
                      </p>
                    </div>

                    {selectedRisk.next_review_date && (
                      <div>
                        <p className="text-sm text-zinc-500 mb-2">
                          Next Review Date
                        </p>
                        <p className="text-zinc-100">
                          {new Date(
                            selectedRisk.next_review_date,
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    )}

                    <div>
                      <p className="text-sm text-zinc-500 mb-2">
                        Residual Risk Score
                      </p>
                      <p className="text-zinc-100">
                        {selectedRisk.residual_risk_score || "-"}
                      </p>
                    </div>
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button
                  color="default"
                  variant="flat"
                  onPress={onClose}
                  className="bg-zinc-700 hover:bg-zinc-600"
                >
                  Close
                </Button>
                <Button
                  color="primary"
                  onPress={onClose}
                  className="bg-zinc-600 hover:bg-zinc-500"
                >
                  Edit Risk
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
