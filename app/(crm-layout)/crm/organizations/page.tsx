"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";

interface CRMOrganization {
  id: string;
  name: string;
  address?: string;
  website?: string;
  industry?: string;
  annualRevenue?: number;
  numberOfEmployees?: number;
  countryCode?: string;
  createdAt: Date;
  updatedAt: Date;
}

export default function CRMOrganizationsPage() {
  const [organizations, setOrganizations] = useState<CRMOrganization[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      const response = await fetch("/api/crm/organizations");
      if (response.ok) {
        const data = await response.json();
        setOrganizations(data.organizations);
      }
    } catch (error) {
      console.error("Error fetching organizations:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrganizations = organizations.filter(
    (org) =>
      org.name.toLowerCase().includes(search.toLowerCase()) ||
      org.industry?.toLowerCase().includes(search.toLowerCase()) ||
      org.address?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div className="p-6">Loading organizations...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">CRM Organizations</h1>
        <Link href="/crm/organizations/new">
          <Button>Add Organization</Button>
        </Link>
      </div>

      <div className="mb-4">
        <Input
          placeholder="Search organizations..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <Tabs defaultValue="table" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="table">Table View</TabsTrigger>
          <TabsTrigger value="cards">Card View</TabsTrigger>
        </TabsList>

        <TabsContent value="table" className="mt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Website</TableHead>
                <TableHead>Employees</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrganizations.map((org) => (
                <TableRow key={org.id}>
                  <TableCell>
                    <Link
                      href={`/crm/organizations/${org.id}`}
                      className="text-blue-400 hover:text-blue-300"
                    >
                      {org.name}
                    </Link>
                  </TableCell>
                  <TableCell>{org.industry || "-"}</TableCell>
                  <TableCell>{org.address || "-"}</TableCell>
                  <TableCell>
                    {org.website ? (
                      <a
                        href={org.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300"
                      >
                        {org.website}
                      </a>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>{org.numberOfEmployees || "-"}</TableCell>
                  <TableCell>
                    {new Date(org.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="cards" className="mt-6">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredOrganizations.map((org) => (
              <Card
                key={org.id}
                className="bg-zinc-800 border-zinc-700 hover:border-zinc-600 transition-colors"
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-base text-white">
                    <Link
                      href={`/crm/organizations/${org.id}`}
                      className="hover:text-blue-400 transition-colors"
                    >
                      {org.name}
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-1 text-sm">
                  {org.industry && (
                    <p className="text-zinc-300">{org.industry}</p>
                  )}
                  {org.address && (
                    <p className="text-zinc-400 truncate">{org.address}</p>
                  )}
                  {org.website && (
                    <a
                      href={org.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 text-xs"
                    >
                      {org.website}
                    </a>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {filteredOrganizations.length === 0 && (
        <p className="text-zinc-400 text-center py-8">
          No organizations found.
        </p>
      )}
    </div>
  );
}
