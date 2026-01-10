"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  IconUsers,
  IconCurrencyDollar,
  IconTrendingUp,
  IconChecklist,
  IconPlus,
} from "@tabler/icons-react";

export default function CRMHomePage() {
  const [stats, setStats] = useState({
    totalContacts: 0,
    totalDeals: 0,
    pipelineValue: 0,
    dealsClosedThisMonth: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch contacts count
      const contactsRes = await fetch("/api/crm/contacts");
      const contactsData = await contactsRes.json();

      // Fetch deals and calculate stats
      const dealsRes = await fetch("/api/crm/deals");
      const dealsData = await dealsRes.json();

      const deals = dealsData.deals || [];
      const pipelineValue = deals
        .filter(
          (d: any) => d.stage !== "crm-deal-col-lost-0000-0000-0000-000000"
        )
        .reduce(
          (sum: number, deal: any) => sum + parseFloat(deal.value || "0"),
          0
        );

      const now = new Date();
      const thisMonth = now.getMonth();
      const thisYear = now.getFullYear();
      const dealsClosedThisMonth = deals.filter((d: any) => {
        if (d.stage !== "crm-deal-col-won-00000-0000-0000-000000")
          return false;
        const closeDate = new Date(d.expectedCloseDate || d.updatedAt);
        return (
          closeDate.getMonth() === thisMonth &&
          closeDate.getFullYear() === thisYear
        );
      }).length;

      setStats({
        totalContacts: contactsData.contacts?.length || 0,
        totalDeals: deals.length,
        pipelineValue,
        dealsClosedThisMonth,
      });
    } catch (error) {
      console.error("Error fetching CRM stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-zinc-800 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-zinc-800 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">CRM Dashboard</h1>
          <p className="text-zinc-400 mt-1">
            Manage your sales pipeline and customer relationships
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-900/50 to-blue-950/50 border-blue-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-blue-200 flex items-center gap-2">
              <IconUsers size={18} />
              Total Contacts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">
              {stats.totalContacts}
            </div>
            <p className="text-xs text-blue-300 mt-1">Active contacts in CRM</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-900/50 to-purple-950/50 border-purple-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-purple-200 flex items-center gap-2">
              <IconCurrencyDollar size={18} />
              Active Deals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">
              {stats.totalDeals}
            </div>
            <p className="text-xs text-purple-300 mt-1">Deals in pipeline</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-900/50 to-green-950/50 border-green-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-green-200 flex items-center gap-2">
              <IconTrendingUp size={18} />
              Pipeline Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">
              ${stats.pipelineValue.toLocaleString()}
            </div>
            <p className="text-xs text-green-300 mt-1">
              Total opportunity value
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-900/50 to-orange-950/50 border-orange-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-orange-200 flex items-center gap-2">
              <IconChecklist size={18} />
              Closed This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">
              {stats.dealsClosedThisMonth}
            </div>
            <p className="text-xs text-orange-300 mt-1">Deals won this month</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <IconUsers size={20} />
              Contacts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-zinc-400 text-sm">
              Manage your customer and prospect contacts
            </p>
            <div className="flex gap-2">
              <Link href="/crm/contacts">
                <Button variant="outline" className="w-full">
                  View All Contacts
                </Button>
              </Link>
              <Link href="/crm/contacts/new">
                <Button className="bg-indigo-600 hover:bg-indigo-700">
                  <IconPlus size={16} className="mr-1" />
                  Add Contact
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <IconCurrencyDollar size={20} />
              Sales Pipeline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-zinc-400 text-sm">
              Track deals from lead to close
            </p>
            <Link href="/crm/deals">
              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                Open Pipeline
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
