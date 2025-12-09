"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  IconCheck,
  IconClock,
  IconAlertTriangle,
  IconTarget,
} from "@tabler/icons-react";

interface ProgressMetrics {
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  inProgressTasks: number;
}

export default function ProgressOverviewSection() {
  const [metrics, setMetrics] = useState<ProgressMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgressMetrics();
  }, []);

  const fetchProgressMetrics = async () => {
    try {
      // This would typically fetch from an API endpoint that aggregates task data
      // For now, we'll simulate with placeholder data
      const response = await fetch("/api/dashboard/progress");
      const data = await response.json();
      setMetrics(data);
    } catch (error) {
      console.error("Failed to fetch progress metrics:", error);
      // Fallback to placeholder data
      setMetrics({
        totalTasks: 0,
        completedTasks: 0,
        overdueTasks: 0,
        inProgressTasks: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-zinc-900 border-zinc-800 animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-zinc-700 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-zinc-700 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!metrics) return null;

  const completionRate =
    metrics.totalTasks > 0
      ? Math.round((metrics.completedTasks / metrics.totalTasks) * 100)
      : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="bg-zinc-900 border-zinc-800 hover:bg-zinc-800 transition-colors">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-white">
            Total Tasks
          </CardTitle>
          <IconTarget className="h-4 w-4 text-zinc-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">
            {metrics.totalTasks}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-zinc-900 border-zinc-800 hover:bg-zinc-800 transition-colors">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-white">
            Completed
          </CardTitle>
          <IconCheck className="h-4 w-4 text-green-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-400">
            {metrics.completedTasks}
          </div>
          <p className="text-xs text-zinc-400">
            {completionRate}% completion rate
          </p>
        </CardContent>
      </Card>

      <Card className="bg-zinc-900 border-zinc-800 hover:bg-zinc-800 transition-colors">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-white">
            In Progress
          </CardTitle>
          <IconClock className="h-4 w-4 text-blue-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-400">
            {metrics.inProgressTasks}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-zinc-900 border-zinc-800 hover:bg-zinc-800 transition-colors">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-white">
            Overdue
          </CardTitle>
          <IconAlertTriangle className="h-4 w-4 text-red-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-400">
            {metrics.overdueTasks}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
