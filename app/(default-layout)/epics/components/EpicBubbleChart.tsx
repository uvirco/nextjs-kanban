"use client";
import { useMemo, useState } from "react";
import Link from "next/link";

interface Epic {
  id: string;
  title: string;
  description: string | null;
  priority: string | null;
  businessValue: string | null;
  riskLevel: string | null;
  dueDate: string | null;
  startDate: string | null;
  readinessScore?: number;
  estimatedEffort?: number | null;
  budgetEstimate?: number | null;
  department?: {
    id: string;
    name: string;
  } | null;
  metrics: {
    totalTasks: number;
    completedTasks: number;
    blockedTasks: number;
    progress: number;
  };
  owner: any;
}

interface EpicBubbleChartProps {
  epics: Epic[];
}

type ChartMode =
  | "value-risk"
  | "readiness-priority"
  | "readiness-value"
  | "readiness-duedate";

export default function EpicBubbleChart({ epics }: EpicBubbleChartProps) {
  const [chartMode, setChartMode] = useState<ChartMode>("value-risk");
  // Value mapping
  const valueToNumber = (value: string | null): number => {
    switch (value?.toUpperCase()) {
      case "CRITICAL":
        return 4;
      case "HIGH":
        return 3;
      case "MEDIUM":
        return 2;
      case "LOW":
        return 1;
      default:
        return 0;
    }
  };

  const riskToNumber = (risk: string | null): number => {
    switch (risk?.toUpperCase()) {
      case "HIGH":
        return 3;
      case "MEDIUM":
        return 2;
      case "LOW":
        return 1;
      default:
        return 0;
    }
  };

  const getPriorityColor = (priority: string | null): string => {
    switch (priority?.toUpperCase()) {
      case "CRITICAL":
        return "#ef4444"; // red-500
      case "HIGH":
        return "#f97316"; // orange-500
      case "MEDIUM":
        return "#eab308"; // yellow-500
      case "LOW":
        return "#22c55e"; // green-500
      default:
        return "#6b7280"; // gray-500
    }
  };

  // Calculate chart dimensions and scales
  const chartData = useMemo(() => {
    // Don't filter - show all epics with default values for missing data
    const maxEffort = Math.max(
      ...epics.map((e) => e.estimatedEffort || e.budgetEstimate || 1),
      1 // Ensure at least 1 to avoid division by zero
    );

    return epics.map((epic) => {
      let x, y, hasAllData;

      switch (chartMode) {
        case "readiness-priority":
          x = epic.readinessScore || 0;
          y = valueToNumber(epic.priority);
          hasAllData = epic.readinessScore !== undefined && epic.priority;
          break;

        case "readiness-value":
          x = epic.readinessScore || 0;
          y = valueToNumber(epic.businessValue);
          hasAllData = epic.readinessScore !== undefined && epic.businessValue;
          break;

        case "readiness-duedate":
          const daysUntilDue = epic.dueDate
            ? Math.ceil(
                (new Date(epic.dueDate).getTime() - Date.now()) /
                  (1000 * 60 * 60 * 24)
              )
            : 0;
          x = epic.readinessScore || 0;
          y = Math.max(0, Math.min(365, daysUntilDue)); // Cap at 1 year
          hasAllData = epic.readinessScore !== undefined && epic.dueDate;
          break;

        case "value-risk":
        default:
          x = valueToNumber(epic.businessValue);
          y = riskToNumber(epic.riskLevel);
          hasAllData =
            epic.businessValue &&
            epic.riskLevel &&
            (epic.estimatedEffort || epic.budgetEstimate);
      }

      return {
        ...epic,
        x,
        y,
        size:
          ((epic.estimatedEffort || epic.budgetEstimate || 5) / maxEffort) *
            50 +
          15,
        color: getPriorityColor(epic.priority),
        incomplete: !hasAllData,
      };
    });
  }, [epics, chartMode]);

  // Get axis configuration based on mode
  const getAxisConfig = () => {
    switch (chartMode) {
      case "readiness-priority":
        return {
          xMax: 100,
          yMax: 4,
          xScale: (value: number) => padding + (value / 100) * chartWidth,
          yScale: (value: number) =>
            height - padding - (value / 4) * chartHeight,
          xLabels: [0, 25, 50, 75, 100],
          yLabels: ["None", "LOW", "MEDIUM", "HIGH", "CRITICAL"],
          xTitle: "Readiness Score (%) →",
          yTitle: "Priority →",
          quadrantLabels: [
            {
              x: 25,
              y: 1,
              label: "Not Ready\nLow Priority",
              class: "text-gray-500",
            },
            {
              x: 75,
              y: 1,
              label: "Ready\nLow Priority",
              class: "text-gray-400",
            },
            {
              x: 25,
              y: 3,
              label: "Not Ready\nHigh Priority\nNEEDS ATTENTION",
              class: "text-yellow-300",
            },
            {
              x: 75,
              y: 3,
              label: "Ready\nHigh Priority\nSTART NOW",
              class: "text-green-300",
            },
          ],
        };

      case "readiness-value":
        return {
          xMax: 100,
          yMax: 4,
          xScale: (value: number) => padding + (value / 100) * chartWidth,
          yScale: (value: number) =>
            height - padding - (value / 4) * chartHeight,
          xLabels: [0, 25, 50, 75, 100],
          yLabels: ["None", "LOW", "MEDIUM", "HIGH", "CRITICAL"],
          xTitle: "Readiness Score (%) →",
          yTitle: "Business Value →",
          quadrantLabels: [
            {
              x: 25,
              y: 1,
              label: "Not Ready\nLow Value",
              class: "text-gray-500",
            },
            { x: 75, y: 1, label: "Ready\nLow Value", class: "text-gray-400" },
            {
              x: 25,
              y: 3,
              label: "Not Ready\nHigh Value\nDEFINE FIRST",
              class: "text-yellow-300",
            },
            {
              x: 75,
              y: 3,
              label: "Ready\nHigh Value\nQUICK WINS",
              class: "text-green-300",
            },
          ],
        };

      case "readiness-duedate":
        return {
          xMax: 100,
          yMax: 365,
          xScale: (value: number) => padding + (value / 100) * chartWidth,
          yScale: (value: number) =>
            height - padding - (value / 365) * chartHeight,
          xLabels: [0, 25, 50, 75, 100],
          yLabels: ["Overdue", "30d", "90d", "180d", "365d"],
          xTitle: "Readiness Score (%) →",
          yTitle: "Days Until Due →",
          quadrantLabels: [
            {
              x: 25,
              y: 90,
              label: "Not Ready\nUrgent\nDANGER ZONE",
              class: "text-red-300",
            },
            {
              x: 75,
              y: 90,
              label: "Ready\nUrgent\nEXECUTE",
              class: "text-orange-300",
            },
            {
              x: 25,
              y: 270,
              label: "Not Ready\nLater\nPLAN NOW",
              class: "text-yellow-300",
            },
            {
              x: 75,
              y: 270,
              label: "Ready\nLater\nON TRACK",
              class: "text-green-300",
            },
          ],
        };

      case "value-risk":
      default:
        return {
          xMax: 4,
          yMax: 3,
          xScale: (value: number) => padding + (value / 4) * chartWidth,
          yScale: (value: number) =>
            height - padding - (value / 3) * chartHeight,
          xLabels: ["None", "LOW", "MEDIUM", "HIGH", "CRITICAL"],
          yLabels: ["None", "LOW", "MEDIUM", "HIGH"],
          xTitle: "Business Value →",
          yTitle: "Risk Level →",
          quadrantLabels: [
            {
              x: 1,
              y: 2.5,
              label: "Low Value\nHigh Risk",
              class: "text-red-300",
            },
            {
              x: 3,
              y: 2.5,
              label: "High Value\nHigh Risk\nNeeds Mitigation",
              class: "text-yellow-300",
            },
            {
              x: 1,
              y: 0.5,
              label: "Low Value\nLow Risk",
              class: "text-gray-400",
            },
            {
              x: 3,
              y: 0.5,
              label: "QUICK WINS\nHigh Value, Low Risk",
              class: "text-green-300",
            },
          ],
        };
    }
  };

  const axisConfig = getAxisConfig();

  // Chart configuration
  const padding = 80;
  const width = 1000;
  const height = 700;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  return (
    <div className="space-y-4">
      {/* Chart Mode Selector */}
      <div className="flex gap-2 bg-zinc-900 border border-zinc-800 rounded-lg p-4">
        <button
          onClick={() => setChartMode("value-risk")}
          className={`px-4 py-2 rounded-lg text-sm transition-colors ${
            chartMode === "value-risk"
              ? "bg-blue-600 text-white"
              : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
          }`}
        >
          Value vs Risk
        </button>
        <button
          onClick={() => setChartMode("readiness-priority")}
          className={`px-4 py-2 rounded-lg text-sm transition-colors ${
            chartMode === "readiness-priority"
              ? "bg-blue-600 text-white"
              : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
          }`}
        >
          Readiness vs Priority
        </button>
        <button
          onClick={() => setChartMode("readiness-value")}
          className={`px-4 py-2 rounded-lg text-sm transition-colors ${
            chartMode === "readiness-value"
              ? "bg-blue-600 text-white"
              : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
          }`}
        >
          Readiness vs Value
        </button>
        <button
          onClick={() => setChartMode("readiness-duedate")}
          className={`px-4 py-2 rounded-lg text-sm transition-colors ${
            chartMode === "readiness-duedate"
              ? "bg-blue-600 text-white"
              : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
          }`}
        >
          Readiness vs Due Date
        </button>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-lg p-4">
        <div>
          <h3 className="text-sm font-medium text-zinc-400 mb-2">
            Priority (Color)
          </h3>
          <div className="flex gap-3">
            {[
              { label: "Critical", color: "#ef4444" },
              { label: "High", color: "#f97316" },
              { label: "Medium", color: "#eab308" },
              { label: "Low", color: "#22c55e" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs text-zinc-400">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-sm font-medium text-zinc-400 mb-2">
            Bubble Size
          </h3>
          <p className="text-xs text-zinc-500">Estimated Effort (hours)</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-zinc-400 mb-2">
            Incomplete Data
          </h3>
          <div className="flex items-center gap-2">
            <svg width="20" height="20">
              <circle
                cx="10"
                cy="10"
                r="8"
                fill="#6b7280"
                opacity="0.6"
                stroke="#71717a"
                strokeWidth="2"
                strokeDasharray="3,3"
              />
            </svg>
            <span className="text-xs text-zinc-500">
              Missing value/risk/effort
            </span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full"
          style={{ minWidth: "1000px" }}
        >
          {/* Background quadrants */}
          <rect
            x={padding}
            y={padding}
            width={chartWidth / 2}
            height={chartHeight / 2}
            fill="#7f1d1d"
            opacity="0.1"
          />
          <rect
            x={padding + chartWidth / 2}
            y={padding}
            width={chartWidth / 2}
            height={chartHeight / 2}
            fill="#854d0e"
            opacity="0.1"
          />
          <rect
            x={padding}
            y={padding + chartHeight / 2}
            width={chartWidth / 2}
            height={chartHeight / 2}
            fill="#3f3f46"
            opacity="0.1"
          />
          <rect
            x={padding + chartWidth / 2}
            y={padding + chartHeight / 2}
            width={chartWidth / 2}
            height={chartHeight / 2}
            fill="#14532d"
            opacity="0.1"
          />

          {/* Grid lines */}
          {chartMode === "value-risk" &&
            [1, 2, 3, 4].map((i) => (
              <line
                key={`v-${i}`}
                x1={axisConfig.xScale(i)}
                y1={padding}
                x2={axisConfig.xScale(i)}
                y2={height - padding}
                stroke="#3f3f46"
                strokeWidth="1"
                strokeDasharray="4"
              />
            ))}
          {chartMode !== "value-risk" &&
            [25, 50, 75].map((i) => (
              <line
                key={`v-${i}`}
                x1={axisConfig.xScale(i)}
                y1={padding}
                x2={axisConfig.xScale(i)}
                y2={height - padding}
                stroke="#3f3f46"
                strokeWidth="1"
                strokeDasharray="4"
              />
            ))}
          {chartMode === "value-risk" &&
            [1, 2, 3].map((i) => (
              <line
                key={`h-${i}`}
                x1={padding}
                y1={axisConfig.yScale(i)}
                x2={width - padding}
                y2={axisConfig.yScale(i)}
                stroke="#3f3f46"
                strokeWidth="1"
                strokeDasharray="4"
              />
            ))}
          {chartMode === "readiness-duedate" &&
            [30, 90, 180, 270].map((i) => (
              <line
                key={`h-${i}`}
                x1={padding}
                y1={axisConfig.yScale(i)}
                x2={width - padding}
                y2={axisConfig.yScale(i)}
                stroke="#3f3f46"
                strokeWidth="1"
                strokeDasharray="4"
              />
            ))}
          {(chartMode === "readiness-priority" ||
            chartMode === "readiness-value") &&
            [1, 2, 3].map((i) => (
              <line
                key={`h-${i}`}
                x1={padding}
                y1={axisConfig.yScale(i)}
                x2={width - padding}
                y2={axisConfig.yScale(i)}
                stroke="#3f3f46"
                strokeWidth="1"
                strokeDasharray="4"
              />
            ))}

          {/* Axes */}
          <line
            x1={padding}
            y1={height - padding}
            x2={width - padding}
            y2={height - padding}
            stroke="#71717a"
            strokeWidth="2"
          />
          <line
            x1={padding}
            y1={padding}
            x2={padding}
            y2={height - padding}
            stroke="#71717a"
            strokeWidth="2"
          />

          {/* X-axis labels */}
          {typeof axisConfig.xLabels[0] === "string"
            ? axisConfig.xLabels.map((label, i) => (
                <text
                  key={`x-${i}`}
                  x={axisConfig.xScale(i)}
                  y={height - padding + 25}
                  textAnchor="middle"
                  className="fill-zinc-400 text-xs"
                >
                  {label}
                </text>
              ))
            : axisConfig.xLabels.map((label, i) => (
                <text
                  key={`x-${label}`}
                  x={axisConfig.xScale(label as number)}
                  y={height - padding + 25}
                  textAnchor="middle"
                  className="fill-zinc-400 text-xs"
                >
                  {label}%
                </text>
              ))}

          {/* Y-axis labels */}
          {typeof axisConfig.yLabels[0] === "string"
            ? axisConfig.yLabels.map((label, i) => (
                <text
                  key={`y-${i}`}
                  x={padding - 10}
                  y={axisConfig.yScale(i) + 4}
                  textAnchor="end"
                  className="fill-zinc-400 text-xs"
                >
                  {label}
                </text>
              ))
            : chartMode === "readiness-duedate"
              ? [0, 30, 90, 180, 365].map((label, i) => (
                  <text
                    key={`y-${label}`}
                    x={padding - 10}
                    y={axisConfig.yScale(label) + 4}
                    textAnchor="end"
                    className="fill-zinc-400 text-xs"
                  >
                    {label === 0 ? "Overdue" : `${label}d`}
                  </text>
                ))
              : null}

          {/* Axis titles */}
          <text
            x={width / 2}
            y={height - 10}
            textAnchor="middle"
            className="fill-zinc-300 text-sm font-medium"
          >
            {axisConfig.xTitle}
          </text>
          <text
            x={20}
            y={height / 2}
            textAnchor="middle"
            className="fill-zinc-300 text-sm font-medium"
            transform={`rotate(-90, 20, ${height / 2})`}
          >
            {axisConfig.yTitle}
          </text>

          {/* Quadrant labels */}
          {axisConfig.quadrantLabels.map((quad, i) => (
            <text
              key={`quad-${i}`}
              x={axisConfig.xScale(quad.x)}
              y={axisConfig.yScale(quad.y)}
              textAnchor="middle"
              className={`${quad.class} text-xs font-medium opacity-50`}
            >
              {quad.label.split("\n").map((line, j) => (
                <tspan
                  key={j}
                  x={axisConfig.xScale(quad.x)}
                  dy={j === 0 ? 0 : 14}
                >
                  {line}
                </tspan>
              ))}
            </text>
          ))}

          {/* Bubbles */}
          {chartData.map((epic) => (
            <g key={epic.id}>
              <a href={`/epics/${epic.id}`}>
                <circle
                  cx={axisConfig.xScale(epic.x)}
                  cy={axisConfig.yScale(epic.y)}
                  r={epic.size}
                  fill={epic.color}
                  opacity="0.6"
                  className="hover:opacity-90 transition-opacity cursor-pointer"
                  stroke={epic.incomplete ? "#71717a" : epic.color}
                  strokeWidth="2"
                  strokeDasharray={epic.incomplete ? "5,5" : "none"}
                />
                <text
                  x={axisConfig.xScale(epic.x)}
                  y={axisConfig.yScale(epic.y) + 4}
                  textAnchor="middle"
                  className="fill-white text-xs font-medium pointer-events-none"
                  style={{ textShadow: "0 1px 2px rgba(0,0,0,0.8)" }}
                >
                  {epic.title.length > 15
                    ? epic.title.substring(0, 15) + "..."
                    : epic.title}
                </text>
              </a>
            </g>
          ))}
        </svg>
      </div>

      {/* Epic list below chart */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
        <h3 className="text-sm font-medium text-zinc-400 mb-3">
          Epics ({chartData.length})
          {chartData.some((e) => e.incomplete) && (
            <span className="ml-2 text-xs text-zinc-500">
              (Dashed border = incomplete data)
            </span>
          )}
        </h3>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {chartData.map((epic) => (
            <Link
              key={epic.id}
              href={`/epics/${epic.id}`}
              className="flex items-center justify-between p-2 hover:bg-zinc-800 rounded transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: epic.color }}
                />
                <span className="text-sm text-white">
                  {epic.title}
                  {epic.incomplete && (
                    <span className="ml-2 text-xs text-zinc-500">
                      (incomplete)
                    </span>
                  )}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-zinc-400">
                <span>Value: {epic.businessValue || "N/A"}</span>
                <span>Risk: {epic.riskLevel || "N/A"}</span>
                <span>
                  Effort: {epic.estimatedEffort || epic.budgetEstimate || "N/A"}
                  h
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {chartData.length === 0 && (
        <div className="text-center text-zinc-400 py-12">
          <p>No epics to display</p>
        </div>
      )}
    </div>
  );
}
