"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

interface StatusDistribution extends Record<string, any> {
  status: string;
  count: number;
  color: string;
}

interface TeamActivity {
  user: string;
  tasksCompleted: number;
  tasksCreated: number;
}

interface SummaryData {
  statusDistribution: StatusDistribution[];
  teamActivity: TeamActivity[];
}

export default function SummarySection() {
  const [data, setData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSummaryData();
  }, []);

  const fetchSummaryData = async () => {
    try {
      const response = await fetch("/api/dashboard/summary");
      const summaryData = await response.json();
      setData(summaryData);
    } catch (error) {
      console.error("Failed to fetch summary data:", error);
      // Fallback to placeholder data
      setData({
        statusDistribution: [
          { status: "To Do", count: 15, color: "#8884d8" },
          { status: "In Progress", count: 8, color: "#82ca9d" },
          { status: "Review", count: 5, color: "#ffc658" },
          { status: "Done", count: 12, color: "#ff7300" },
        ],
        teamActivity: [
          { user: "Alice", tasksCompleted: 8, tasksCreated: 3 },
          { user: "Bob", tasksCompleted: 6, tasksCreated: 5 },
          { user: "Charlie", tasksCompleted: 4, tasksCreated: 2 },
          { user: "Diana", tasksCompleted: 7, tasksCreated: 4 },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-zinc-900 border-zinc-800 animate-pulse">
          <CardHeader>
            <div className="h-6 bg-zinc-700 rounded w-1/2"></div>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-zinc-700 rounded"></div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800 animate-pulse">
          <CardHeader>
            <div className="h-6 bg-zinc-700 rounded w-1/2"></div>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-zinc-700 rounded"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="bg-zinc-900 border-zinc-800 hover:bg-zinc-800 transition-colors">
        <CardHeader>
          <CardTitle className="text-white">Task Status Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.statusDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ percent }) => percent ? `${(percent * 100).toFixed(0)}%` : ''}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
                nameKey="status"
              >
                {data.statusDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '6px',
                  color: '#f9fafb'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="bg-zinc-900 border-zinc-800 hover:bg-zinc-800 transition-colors">
        <CardHeader>
          <CardTitle className="text-white">Team Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.teamActivity}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" stroke="#374151" />
              <XAxis
                dataKey="user"
                tick={{ fontSize: 12, fill: '#9ca3af' }}
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
              />
              <Legend />
              <Bar dataKey="tasksCompleted" fill="#3b82f6" name="Tasks Completed" />
              <Bar dataKey="tasksCreated" fill="#10b981" name="Tasks Created" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}