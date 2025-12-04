"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

interface Epic {
  id: string;
  title: string;
  startDate: string | null;
  dueDate: string | null;
  metrics: {
    totalTasks: number;
    completedTasks: number;
    blockedTasks: number;
    progress: number;
  };
}

interface EpicBurndownChartProps {
  epics: Epic[];
}

export default function EpicBurndownChart({ epics }: EpicBurndownChartProps) {
  // Provide a small mock dataset so the chart is visible for demos when
  // there are no real epics or no progress history yet.
  const MOCK_EPICS: Epic[] = [
    {
      id: "mock-1",
      title: "Sample Epic — Mock Burndown",
      startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10),
      dueDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10),
      metrics: {
        totalTasks: 20,
        completedTasks: 8,
        blockedTasks: 1,
        progress: 40,
      },
    },
    {
      id: "mock-2",
      title: "Sample Epic — Finished",
      startDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10),
      dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10),
      metrics: {
        totalTasks: 12,
        completedTasks: 12,
        blockedTasks: 0,
        progress: 100,
      },
    },
  ];

  // Use real epics when available, otherwise show MOCK_EPICS for preview/demo
  const availableEpics = epics && epics.length > 0 ? epics : MOCK_EPICS;

  const [selectedEpicId, setSelectedEpicId] = useState<string | null>(
    availableEpics.length > 0 ? availableEpics[0].id : null
  );

  const selectedEpic =
    availableEpics.find((e) => e.id === selectedEpicId) || null;

  // Build timeseries for the selected epic
  const series = useMemo(() => {
    if (!selectedEpic) return { dates: [], ideal: [], actual: [], velocity: 0 };

    const { startDate, dueDate, metrics } = selectedEpic;
    const total = Math.max(metrics.totalTasks, 0);
    const completed = Math.max(metrics.completedTasks, 0);

    if (!startDate || !dueDate || total === 0) {
      // no dates or no tasks — return empty
      return { dates: [], ideal: [], actual: [], velocity: 0 };
    }

    const start = new Date(startDate);
    const end = new Date(dueDate);
    // clamp start <= end
    if (end.getTime() < start.getTime()) end.setTime(start.getTime());

    // build an array of days from start to end inclusive
    const days: Date[] = [];
    const cur = new Date(
      start.getFullYear(),
      start.getMonth(),
      start.getDate()
    );
    while (cur <= end) {
      days.push(new Date(cur));
      cur.setDate(cur.getDate() + 1);
    }

    // ideal remaining tasks (linear): starts at total, ends at 0
    const ideal = days.map((d, i) => {
      const t = i / Math.max(days.length - 1, 1);
      return Math.max(0, Math.round(total * (1 - t)));
    });

    // actual remaining tasks: we do not have full history in this view; fall back to distributing completed tasks uniformly across elapsed days
    const now = new Date();
    const elapsedDays = Math.max(
      1,
      Math.ceil(
        (Math.min(now.getTime(), end.getTime()) - start.getTime()) /
          (1000 * 60 * 60 * 24)
      ) + 1
    );
    // completed so far -> put completed points uniformly across elapsed days
    const completedPerDay = completed / elapsedDays;

    const actualRemaining: number[] = [];
    for (let i = 0; i < days.length; i++) {
      const day = days[i];
      // how many days have elapsed up to this day
      const daysElapsedToDay = Math.max(0, Math.min(i + 1, elapsedDays));
      const estimatedCompletedByThisDay = Math.min(
        total,
        Math.round(completedPerDay * daysElapsedToDay)
      );
      actualRemaining.push(Math.max(0, total - estimatedCompletedByThisDay));
    }

    // compute velocity = completed tasks per day over elapsedDays
    const velocity = +(completed / elapsedDays).toFixed(2);

    // format dates as labels
    const labels = days.map((d) =>
      d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    );

    return { dates: labels, ideal, actual: actualRemaining, velocity };
  }, [selectedEpic]);

  // Chart sizing
  const width = 1000;
  const height = 280;
  const padding = 48;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const maxY = useMemo(() => {
    if (!series || series.ideal.length === 0) return 0;
    return Math.max(...series.ideal, ...series.actual, 1);
  }, [series]);

  const xScale = (i: number) =>
    padding + (i / Math.max(series.dates.length - 1, 1)) * chartWidth;
  const yScale = (v: number) =>
    padding + (1 - v / Math.max(maxY, 1)) * chartHeight;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h3 className="text-sm text-zinc-400 font-medium">Burndown Chart</h3>
          <div className="text-xs text-zinc-500">
            (Planned vs Actual progress)
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-zinc-400 mr-2">Epic:</label>
          <select
            value={selectedEpicId ?? ""}
            onChange={(e) => setSelectedEpicId(e.target.value || null)}
            className="px-3 py-1 bg-zinc-800 border border-zinc-700 rounded text-sm text-white"
          >
            {availableEpics.map((e) => (
              <option key={e.id} value={e.id}>
                {e.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {!selectedEpic && (
        <div className="text-zinc-400 text-sm">No epic selected</div>
      )}

      {selectedEpic && series.dates.length === 0 && (
        <div className="text-zinc-400 text-sm">
          Start and due dates or task counts missing for this epic.
        </div>
      )}

      {selectedEpic && series.dates.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 overflow-x-auto">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full"
            style={{ minWidth: `${width}px` }}
          >
            {/* axes */}
            <line
              x1={padding}
              y1={height - padding}
              x2={width - padding}
              y2={height - padding}
              stroke="#374151"
              strokeWidth={2}
            />
            <line
              x1={padding}
              y1={padding}
              x2={padding}
              y2={height - padding}
              stroke="#374151"
              strokeWidth={2}
            />

            {/* grid + labels */}
            {/* horizontal grid */}
            {Array.from({ length: 4 }).map((_, idx) => {
              const y = padding + (idx / 4) * chartHeight;
              return (
                <line
                  key={idx}
                  x1={padding}
                  x2={width - padding}
                  y1={y}
                  y2={y}
                  stroke="#374151"
                  strokeDasharray="4"
                  strokeWidth={1}
                />
              );
            })}

            {/* y labels */}
            {Array.from({ length: 5 }).map((_, idx) => {
              const v = Math.round(maxY * (1 - idx / 4));
              const y = yScale(v);
              return (
                <text
                  key={idx}
                  x={padding - 10}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-zinc-400 text-xs"
                >
                  {v}
                </text>
              );
            })}

            {/* x labels */}
            {series.dates.map((label, i) => (
              <text
                key={i}
                x={xScale(i)}
                y={height - padding + 20}
                textAnchor="middle"
                className="fill-zinc-400 text-xs"
              >
                {label}
              </text>
            ))}

            {/* ideal burndown polyline (to 0) */}
            <polyline
              fill="none"
              stroke="#60a5fa"
              strokeWidth={2}
              strokeDasharray="6,4"
              points={series.ideal
                .map((v, i) => `${xScale(i)},${yScale(v)}`)
                .join(" ")}
            />

            {/* actual progress polyline */}
            <polyline
              fill="none"
              stroke="#34d399"
              strokeWidth={3}
              points={series.actual
                .map((v, i) => `${xScale(i)},${yScale(v)}`)
                .join(" ")}
              className="transition-all"
            />

            {/* points for actual */}
            {series.actual.map((v, i) => (
              <circle
                key={i}
                cx={xScale(i)}
                cy={yScale(v)}
                r={3}
                fill="#34d399"
              />
            ))}

            {/* legend */}
            <g>
              <rect
                x={padding + 10}
                y={padding - 30}
                width={160}
                height={28}
                rx={6}
                fill="#111827"
                opacity={0.7}
              />
              <text
                x={padding + 20}
                y={padding - 12}
                className="fill-zinc-300 text-xs"
              >
                Planned (ideal)
              </text>
              <rect
                x={padding + 20}
                y={padding - 22}
                width={28}
                height={2}
                fill="#60a5fa"
              />
              <text
                x={padding + 120}
                y={padding - 12}
                className="fill-zinc-300 text-xs"
              >
                Actual
              </text>
              <rect
                x={padding + 120}
                y={padding - 22}
                width={28}
                height={2}
                fill="#34d399"
              />
            </g>
          </svg>

          <div className="mt-3 flex items-center justify-between text-xs text-zinc-400">
            <div>
              Epic: <strong className="text-white">{selectedEpic.title}</strong>
            </div>
            <div>
              Tasks:{" "}
              <strong className="text-white">
                {selectedEpic.metrics.totalTasks}
              </strong>
            </div>
            <div>
              Completed:{" "}
              <strong className="text-white">
                {selectedEpic.metrics.completedTasks}
              </strong>
            </div>
            <div>
              Velocity (est.):{" "}
              <strong className="text-white">{series.velocity}/day</strong>
            </div>
          </div>
        </div>
      )}

      {!selectedEpic && availableEpics.length === 0 && (
        <div className="text-zinc-400 text-sm">No epics available</div>
      )}
    </div>
  );
}
