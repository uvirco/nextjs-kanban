"use client";

import { useState, useEffect } from "react";
import { IconActivity, IconTrendingUp, IconChartBar } from "@tabler/icons-react";
import EpicActivityChart from "./EpicActivityChart";

interface DashboardClientProps {
  userId: string;
}

interface Epic {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export default function DashboardClient({ userId }: DashboardClientProps) {
  const [epics, setEpics] = useState<Epic[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("activities");

  useEffect(() => {
    fetchEpics();
  }, []);

  const fetchEpics = async () => {
    try {
      const response = await fetch("/api/epics");
      const data = await response.json();
      setEpics(data);
    } catch (error) {
      console.error("Failed to fetch epics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-950">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-zinc-400">
            Overview of your epic activities and progress
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 mb-8 bg-zinc-900 p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab("activities")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              activeTab === "activities"
                ? "bg-zinc-800 text-white"
                : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
            }`}
          >
            <IconActivity size={18} />
            Activity Trends
          </button>
          <button
            onClick={() => setActiveTab("progress")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              activeTab === "progress"
                ? "bg-zinc-800 text-white"
                : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
            }`}
          >
            <IconTrendingUp size={18} />
            Progress Overview
          </button>
          <button
            onClick={() => setActiveTab("summary")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              activeTab === "summary"
                ? "bg-zinc-800 text-white"
                : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
            }`}
          >
            <IconChartBar size={18} />
            Summary
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "activities" && (
          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {epics.map((epic) => (
                <div key={epic.id} className="bg-zinc-900 rounded-lg p-6 hover:bg-zinc-800 transition-colors">
                  <h3 className="text-lg font-semibold mb-4 truncate">
                    {epic.title}
                  </h3>
                  <EpicActivityChart epicId={epic.id} />
                </div>
              ))}
            </div>
            {epics.length === 0 && (
              <div className="text-center py-12">
                <IconActivity size={48} className="mx-auto text-zinc-600 mb-4" />
                <p className="text-zinc-400">No epics found</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "progress" && (
          <div className="bg-zinc-900 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Progress Overview</h3>
            <p className="text-zinc-400">
              Progress charts will be implemented here.
            </p>
          </div>
        )}

        {activeTab === "summary" && (
          <div className="bg-zinc-900 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Summary Statistics</h3>
            <p className="text-zinc-400">
              Summary statistics will be implemented here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}