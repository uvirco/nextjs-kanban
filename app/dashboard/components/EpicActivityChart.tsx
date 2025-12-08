"use client";

import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { IconLoader2 } from "@tabler/icons-react";

interface EpicActivityChartProps {
  epicId: string;
}

interface ActivityData {
  date: string;
  count: number;
}

export default function EpicActivityChart({ epicId }: EpicActivityChartProps) {
  const [data, setData] = useState<ActivityData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivityData();
  }, [epicId]);

  const fetchActivityData = async () => {
    try {
      const response = await fetch(`/api/epics/${epicId}/activities`);
      const activities = await response.json();

      // Process activities into daily counts
      const activityMap = new Map<string, number>();

      activities.forEach((activity: any) => {
        const date = new Date(activity.createdAt).toISOString().split('T')[0];
        activityMap.set(date, (activityMap.get(date) || 0) + 1);
      });

      // Convert to array and sort by date
      const chartData = Array.from(activityMap.entries())
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date));

      setData(chartData);
    } catch (error) {
      console.error("Failed to fetch activity data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <IconLoader2 className="animate-spin text-blue-500" size={24} />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-zinc-500">
        No activity data available
      </div>
    );
  }

  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" stroke="#374151" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12, fill: '#9ca3af' }}
            tickFormatter={(value) => new Date(value).toLocaleDateString()}
            stroke="#6b7280"
          />
          <YAxis
            tick={{ fontSize: 12, fill: '#9ca3af' }}
            stroke="#6b7280"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1f2937',
              border: '1px solid #374151',
              borderRadius: '6px',
              color: '#f9fafb'
            }}
            labelFormatter={(value) => new Date(value).toLocaleDateString()}
            formatter={(value: number) => [value, "Activities"]}
          />
          <Line
            type="monotone"
            dataKey="count"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: "#3b82f6", strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}