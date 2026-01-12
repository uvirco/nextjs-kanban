"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import EpicActivityChart from "./EpicActivityChart";
import EpicMonthlyTotal from "./EpicMonthlyTotal";

interface ActivityTrendsSectionProps {
  epics: any[];
  dateRange?: { start: Date; end: Date } | null;
}

export default function ActivityTrendsSection({
  epics,
  dateRange,
}: ActivityTrendsSectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {epics.map((epic) => (
        <Card
          key={epic.id}
          className="bg-zinc-900 border-zinc-800 hover:bg-zinc-800 transition-colors"
        >
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-white truncate pr-2">
                {epic.title}
              </CardTitle>
              <div className="text-right flex-shrink-0">
                <div className="text-lg font-bold text-blue-400">
                  <EpicMonthlyTotal epicId={epic.id} />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <EpicActivityChart
              epicId={epic.id}
              dateRange={dateRange}
              height={100}
            />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
