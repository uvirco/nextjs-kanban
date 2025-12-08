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
  dateRange
}: ActivityTrendsSectionProps) {
  return (
    <div className="space-y-8">
      {epics.map((epic) => (
        <Card key={epic.id} className="bg-zinc-900 border-zinc-800 hover:bg-zinc-800 transition-colors">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold text-white">
                {epic.title}
              </CardTitle>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-400">
                  <EpicMonthlyTotal epicId={epic.id} />
                </div>
                <div className="text-sm text-zinc-400">
                  This Month
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <EpicActivityChart epicId={epic.id} dateRange={dateRange} height={250} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}