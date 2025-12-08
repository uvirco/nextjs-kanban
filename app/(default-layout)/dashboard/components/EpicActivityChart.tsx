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
  BarChart,
  Bar,
} from "recharts";
import { IconLoader2, IconCalendar, IconChartBar } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

interface EpicActivityChartProps {
  epicId: string;
  dateRange?: { start: Date; end: Date } | null;
  height?: number;
}

interface ActivityData {
  date: string;
  count: number;
  label: string;
}

type TimeScale = 'daily' | 'monthly';

export default function EpicActivityChart({
  epicId,
  dateRange,
  height = 200
}: EpicActivityChartProps) {
  const [data, setData] = useState<ActivityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeScale, setTimeScale] = useState<TimeScale>('daily');

  useEffect(() => {
    fetchActivityData();
  }, [epicId, dateRange, timeScale]);

  const fetchActivityData = async () => {
    try {
      let url = `/api/epics/${epicId}/activities?timeScale=${timeScale}`;
      if (dateRange) {
        url += `&start=${dateRange.start.toISOString()}&end=${dateRange.end.toISOString()}`;
      }

      const response = await fetch(url);
      const activities = await response.json();

      // Process activities based on time scale
      const processedData = processActivityData(activities, timeScale);
      setData(processedData);
    } catch (error) {
      console.error("Failed to fetch activity data:", error);
    } finally {
      setLoading(false);
    }
  };

  const processActivityData = (activities: any[], scale: TimeScale): ActivityData[] => {
    const activityMap = new Map<string, { count: number; label: string }>();

    activities.forEach((activity: any) => {
      const date = new Date(activity.createdAt);
      let key: string;
      let label: string;

      if (scale === 'monthly') {
        // Group by month for yearly view
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        label = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      } else {
        // Daily view
        key = date.toISOString().split('T')[0];
        label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }

      if (activityMap.has(key)) {
        activityMap.get(key)!.count += 1;
      } else {
        activityMap.set(key, { count: 1, label });
      }
    });

    // Fill in missing periods
    if (dateRange && scale === 'daily') {
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);

      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (!activityMap.has(dateStr)) {
          activityMap.set(dateStr, { count: 0, label });
        }
      }
    } else if (scale === 'monthly' && dateRange) {
      // Fill missing months for yearly view
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);

      for (let d = new Date(startDate); d <= endDate; d.setMonth(d.getMonth() + 1)) {
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const label = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        if (!activityMap.has(key)) {
          activityMap.set(key, { count: 0, label });
        }
      }
    }

    // Convert to array and sort
    return Array.from(activityMap.entries())
      .map(([date, { count, label }]) => ({ date, count, label }))
      .sort((a, b) => a.date.localeCompare(b.date));
  };

  const formatXAxisTick = (value: string, index: number) => {
    if (timeScale === 'monthly') {
      // Show every 3rd month for yearly view
      return index % 3 === 0 ? value.split(' ')[0] : '';
    } else {
      // Show every 7th day for monthly view
      return index % 7 === 0 ? value : '';
    }
  };

  const formatTooltipLabel = (value: string) => {
    const dataPoint = data.find(d => d.date === value);
    return dataPoint ? dataPoint.label : value;
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center`} style={{ height: `${height}px` }}>
        <IconLoader2 className="animate-spin text-blue-500" size={24} />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={`flex items-center justify-center text-zinc-500`} style={{ height: `${height}px` }}>
        No activity data available
      </div>
    );
  }

  return (
    <div>
      {/* Time Scale Selector */}
      <div className="flex gap-2 mb-4">
        <Button
          variant={timeScale === 'daily' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setTimeScale('daily')}
          className="flex items-center gap-2 bg-zinc-800 border-zinc-600 text-zinc-200 hover:bg-zinc-700 hover:text-white"
        >
          <IconCalendar size={14} />
          Daily
        </Button>
        <Button
          variant={timeScale === 'monthly' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setTimeScale('monthly')}
          className="flex items-center gap-2 bg-zinc-800 border-zinc-600 text-zinc-200 hover:bg-zinc-700 hover:text-white"
        >
          <IconChartBar size={14} />
          Monthly
        </Button>
      </div>

      {/* Chart */}
      <div style={{ height: `${height}px` }}>
        <ResponsiveContainer width="100%" height="100%">
          {timeScale === 'monthly' ? (
            <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" stroke="#374151" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12, fill: '#9ca3af' }}
                tickFormatter={formatXAxisTick}
                interval={0}
                stroke="#6b7280"
              />
              <YAxis
                tick={{ fontSize: 12, fill: '#9ca3af' }}
                stroke="#6b7280"
              />
              <Tooltip
                labelFormatter={formatTooltipLabel}
                formatter={(value: number) => [value, "Activities"]}
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '6px',
                  color: '#f9fafb'
                }}
              />
              <Bar
                dataKey="count"
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          ) : (
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" stroke="#374151" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12, fill: '#9ca3af' }}
                tickFormatter={formatXAxisTick}
                interval={0}
                stroke="#6b7280"
              />
              <YAxis
                tick={{ fontSize: 12, fill: '#9ca3af' }}
                stroke="#6b7280"
              />
              <Tooltip
                labelFormatter={formatTooltipLabel}
                formatter={(value: number) => [value, "Activities"]}
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '6px',
                  color: '#f9fafb'
                }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: "#3b82f6", strokeWidth: 2, r: 3 }}
                activeDot={{ r: 5, stroke: "#3b82f6", strokeWidth: 2 }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}