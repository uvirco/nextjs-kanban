"use client";

import { useState, useEffect } from "react";
import {
  IconActivity,
  IconTrendingUp,
  IconChartBar,
  IconClock,
  IconTimeline,
} from "@tabler/icons-react";
import ActivityTrendsSection from "./ActivityTrendsSection";
import ProgressOverviewSection from "./ProgressOverviewSection";
import SummarySection from "./SummarySection";
import ActivityFeedSection from "./ActivityFeedSection";

interface DashboardClientProps {
  userId: string;
}

interface Epic {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

type TimePeriod = "7d" | "30d" | "90d" | "1y";

export default function DashboardClient({ userId }: DashboardClientProps) {
  const [epics, setEpics] = useState<Epic[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("activities");
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date } | null>(
    null
  );
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("90d");

  useEffect(() => {
    fetchEpics();
    updateDateRange(timePeriod);
  }, [timePeriod]);

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

  const updateDateRange = (period: TimePeriod) => {
    const endDate = new Date();
    const startDate = new Date();

    switch (period) {
      case "7d":
        startDate.setDate(endDate.getDate() - 7);
        break;
      case "30d":
        startDate.setDate(endDate.getDate() - 30);
        break;
      case "90d":
        startDate.setDate(endDate.getDate() - 90);
        break;
      case "1y":
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
    }

    setDateRange({ start: startDate, end: endDate });
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

          {/* Time Period Selector */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setTimePeriod("7d")}
              className={`flex items-center gap-2 px-3 py-1 rounded-md transition-colors text-sm ${
                timePeriod === "7d"
                  ? "bg-blue-600 text-white"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"
              }`}
            >
              <IconClock size={14} />7 Days
            </button>
            <button
              onClick={() => setTimePeriod("30d")}
              className={`flex items-center gap-2 px-3 py-1 rounded-md transition-colors text-sm ${
                timePeriod === "30d"
                  ? "bg-blue-600 text-white"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"
              }`}
            >
              <IconClock size={14} />
              30 Days
            </button>
            <button
              onClick={() => setTimePeriod("90d")}
              className={`flex items-center gap-2 px-3 py-1 rounded-md transition-colors text-sm ${
                timePeriod === "90d"
                  ? "bg-blue-600 text-white"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"
              }`}
            >
              <IconClock size={14} />
              90 Days
            </button>
            <button
              onClick={() => setTimePeriod("1y")}
              className={`flex items-center gap-2 px-3 py-1 rounded-md transition-colors text-sm ${
                timePeriod === "1y"
                  ? "bg-blue-600 text-white"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"
              }`}
            >
              <IconClock size={14} />1 Year
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 mb-8 bg-zinc-900 p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab("feed")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              activeTab === "feed"
                ? "bg-zinc-800 text-white"
                : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
            }`}
          >
            <IconTimeline size={18} />
            Activity Feed
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
        </div>

        {/* Tab Content */}
        {activeTab === "activities" && (
          <ActivityTrendsSection epics={epics} dateRange={dateRange} />
        )}

        {activeTab === "feed" && (
          <ActivityFeedSection dateRange={dateRange} />
        )}

        {activeTab === "progress" && <ProgressOverviewSection />}

        {activeTab === "summary" && <SummarySection />}
      </div>
    </div>
  );
}
