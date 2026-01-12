"use client";

import { useState, useEffect } from "react";

interface EpicMonthlyTotalProps {
  epicId: string;
}

export default function EpicMonthlyTotal({ epicId }: EpicMonthlyTotalProps) {
  const [total, setTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMonthlyTotal();
  }, [epicId]);

  const fetchMonthlyTotal = async () => {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const response = await fetch(
        `/api/epics/${epicId}/activities?start=${startOfMonth.toISOString()}&end=${endOfMonth.toISOString()}`
      );
      const activities = await response.json();
      setTotal(activities.length);
    } catch (error) {
      console.error("Failed to fetch monthly total:", error);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <span className="animate-pulse">...</span>;
  }

  return <span>{total}</span>;
}
