"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewCRMOrganizationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    website: "",
    industry: "",
    annualRevenue: "",
    numberOfEmployees: "",
    countryCode: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/crm/organizations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          annualRevenue: formData.annualRevenue ? parseFloat(formData.annualRevenue) : null,
          numberOfEmployees: formData.numberOfEmployees ? parseInt(formData.numberOfEmployees) : null,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/crm/organizations/${data.organization.id}`);
      } else {
        console.error("Failed to create organization");
      }
    } catch (error) {
      console.error("Error creating organization:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/crm/organizations">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Organizations
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-white">Create New Organization</h1>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Organization Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Input
                  id="industry"
                  value={formData.industry}
                  onChange={(e) => handleChange("industry", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleChange("website", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="countryCode">Country Code</Label>
                <Input
                  id="countryCode"
                  value={formData.countryCode}
                  onChange={(e) => handleChange("countryCode", e.target.value)}
                  placeholder="e.g., US, CA, GB"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="annualRevenue">Annual Revenue</Label>
                <Input
                  id="annualRevenue"
                  type="number"
                  step="0.01"
                  value={formData.annualRevenue}
                  onChange={(e) => handleChange("annualRevenue", e.target.value)}
                  placeholder="e.g., 1000000.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="numberOfEmployees">Number of Employees</Label>
                <Input
                  id="numberOfEmployees"
                  type="number"
                  value={formData.numberOfEmployees}
                  onChange={(e) => handleChange("numberOfEmployees", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Organization"}
              </Button>
              <Link href="/crm/organizations">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}