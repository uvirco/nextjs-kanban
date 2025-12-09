"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface ColumnEvent {
  date: string;
  columnName: string;
  duration: number;
  isCurrent: boolean;
}

interface TaskColumnTimelineProps {
  taskId: string;
}

export function TaskColumnTimeline({ taskId }: TaskColumnTimelineProps) {
  const [events, setEvents] = useState<ColumnEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/tasks/${taskId}/column-history`)
      .then((res) => res.json())
      .then((data) => {
        setEvents(data.events || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [taskId]);

  if (loading) return <div>Loading timeline...</div>;
  if (!events.length) return <div>No column history available</div>;

  // Transform data for horizontal bar chart
  const chartData = events.map((event, index) => ({
    name: event.columnName,
    duration: event.duration,
    startDate: new Date(event.date).toLocaleDateString(),
    isCurrent: event.isCurrent,
    color: getColumnColor(event.columnName),
  }));

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-4">Column Timeline</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={chartData}
          layout="horizontal"
          margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            type="number"
            label={{ value: "Days", position: "insideBottom", offset: -5 }}
          />
          <YAxis type="category" dataKey="name" width={90} />
          <Tooltip
            formatter={(value: number, name: string, props: any) => [
              `${value} days`,
              `${props.payload.startDate}${props.payload.isCurrent ? " (current)" : ""}`,
            ]}
            labelFormatter={() => ""}
          />
          <Bar dataKey="duration" radius={[0, 4, 4, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// Color mapping for different columns
function getColumnColor(columnName: string): string {
  const colors: Record<string, string> = {
    "To Do": "#ef4444", // red
    "In Progress": "#f59e0b", // amber
    Review: "#3b82f6", // blue
    Done: "#10b981", // green
    Testing: "#8b5cf6", // purple
    Blocked: "#6b7280", // gray
  };

  return colors[columnName] || "#6b7280"; // default gray
}
