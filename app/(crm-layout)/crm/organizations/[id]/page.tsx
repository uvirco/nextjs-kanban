"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  IconGlobe,
  IconBuilding,
  IconMapPin,
  IconArrowLeft,
  IconEdit,
  IconCheck,
  IconX,
} from "@tabler/icons-react";

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

export default function OrganizationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const organizationId = params.id as string;
  const [organization, setOrganization] = useState<CRMOrganization | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    website: "",
    industry: "",
    annualRevenue: "",
    numberOfEmployees: "",
    countryCode: "",
  });

  useEffect(() => {
    fetchOrganization();
  }, [organizationId]);

  const fetchOrganization = async () => {
    try {
      const response = await fetch(`/api/crm/organizations/${organizationId}`);
      if (!response.ok) throw new Error("Failed to fetch organization");
      const data = await response.json();
      setOrganization(data.organization);
      setFormData({
        name: data.organization.name || "",
        address: data.organization.address || "",
        website: data.organization.website || "",
        industry: data.organization.industry || "",
        annualRevenue: data.organization.annualRevenue?.toString() || "",
        numberOfEmployees: data.organization.numberOfEmployees?.toString() || "",
        countryCode: data.organization.countryCode || "",
      });
    } catch (error) {
      console.error("Error fetching organization:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const updateData = {
        ...formData,
        annualRevenue: formData.annualRevenue ? parseFloat(formData.annualRevenue) : null,
        numberOfEmployees: formData.numberOfEmployees ? parseInt(formData.numberOfEmployees) : null,
      };

      const response = await fetch(`/api/crm/organizations/${organizationId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        const data = await response.json();
        setOrganization(data.organization);
        setIsEditing(false);
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || "Failed to update organization"}`);
      }
    } catch (error) {
      console.error("Error updating organization:", error);
      alert("Failed to update organization");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-zinc-800 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-zinc-800 rounded"></div>
        </div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-white mb-4">
          Organization not found
        </h1>
        <Button onClick={() => router.push("/crm/organizations")}>
          Back to Organizations
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        onClick={() => router.push("/crm/organizations")}
        variant="ghost"
        className="mb-4 text-zinc-400 hover:text-white"
      >
        <IconArrowLeft className="mr-2" size={18} />
        Back to Organizations
      </Button>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-white text-3xl">
              {isEditing ? (
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="text-3xl font-bold bg-transparent border-none p-0 h-auto text-white"
                  placeholder="Organization name"
                />
              ) : (
                organization.name
              )}
            </CardTitle>
            {organization.industry && !isEditing && (
              <p className="text-zinc-400 text-lg">{organization.industry}</p>
            )}
          </div>
          {!isEditing ? (
            <Button
              onClick={() => setIsEditing(true)}
              variant="outline"
              className="text-zinc-400 border-zinc-600 hover:text-white hover:border-zinc-400"
            >
              <IconEdit className="mr-2" size={18} />
              Edit
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setIsEditing(false);
                  setFormData({
                    name: organization.name || "",
                    address: organization.address || "",
                    website: organization.website || "",
                    industry: organization.industry || "",
                    annualRevenue: organization.annualRevenue?.toString() || "",
                    numberOfEmployees: organization.numberOfEmployees?.toString() || "",
                    countryCode: organization.countryCode || "",
                  });
                }}
                variant="outline"
                disabled={saving}
                className="text-zinc-400 border-zinc-600 hover:text-white hover:border-zinc-400"
              >
                <IconX className="mr-2" size={18} />
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={saving}>
                <IconCheck className="mr-2" size={18} />
                {saving ? "Saving..." : "Save"}
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="industry" className="text-white">
                    Industry
                  </Label>
                  <Input
                    id="industry"
                    name="industry"
                    value={formData.industry}
                    onChange={handleChange}
                    placeholder="Technology"
                    className="mt-1 text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="countryCode" className="text-white">
                    Country Code
                  </Label>
                  <Input
                    id="countryCode"
                    name="countryCode"
                    value={formData.countryCode}
                    onChange={handleChange}
                    placeholder="US"
                    className="mt-1 text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="annualRevenue" className="text-white">
                    Annual Revenue
                  </Label>
                  <Input
                    id="annualRevenue"
                    name="annualRevenue"
                    type="number"
                    value={formData.annualRevenue}
                    onChange={handleChange}
                    placeholder="1000000"
                    className="mt-1 text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="numberOfEmployees" className="text-white">
                    Number of Employees
                  </Label>
                  <Input
                    id="numberOfEmployees"
                    name="numberOfEmployees"
                    type="number"
                    value={formData.numberOfEmployees}
                    onChange={handleChange}
                    placeholder="50"
                    className="mt-1 text-white"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address" className="text-white">
                  Address
                </Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="123 Main St, City, Country"
                  className="mt-1 text-white"
                />
              </div>

              <div>
                <Label htmlFor="website" className="text-white">
                  Website
                </Label>
                <Input
                  id="website"
                  name="website"
                  type="url"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="https://example.com"
                  className="mt-1 text-white"
                />
              </div>
            </form>
          ) : (
            <>
              {/* Organization Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {organization.industry && (
                  <div className="flex items-center gap-3">
                    <IconBuilding className="text-indigo-400" size={20} />
                    <div>
                      <p className="text-zinc-500 text-sm">Industry</p>
                      <p className="text-white">{organization.industry}</p>
                    </div>
                  </div>
                )}

                {organization.website && (
                  <div className="flex items-center gap-3">
                    <IconGlobe className="text-indigo-400" size={20} />
                    <div>
                      <p className="text-zinc-500 text-sm">Website</p>
                      <a
                        href={organization.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300"
                      >
                        {organization.website}
                      </a>
                    </div>
                  </div>
                )}

                {organization.address && (
                  <div className="flex items-center gap-3">
                    <IconMapPin className="text-indigo-400" size={20} />
                    <div>
                      <p className="text-zinc-500 text-sm">Address</p>
                      <p className="text-white">{organization.address}</p>
                    </div>
                  </div>
                )}

                {(organization.annualRevenue || organization.numberOfEmployees) && (
                  <div className="flex items-center gap-3">
                    <IconBuilding className="text-indigo-400" size={20} />
                    <div>
                      <p className="text-zinc-500 text-sm">Company Info</p>
                      <div className="text-white text-sm">
                        {organization.annualRevenue && (
                          <p>Revenue: ${organization.annualRevenue.toLocaleString()}</p>
                        )}
                        {organization.numberOfEmployees && (
                          <p>Employees: {organization.numberOfEmployees}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}