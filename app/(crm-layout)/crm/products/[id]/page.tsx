"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { use } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { CRMProduct } from "@/types/crm";

export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<CRMProduct>>({
    name: "",
    productCode: "",
    active: true,
    category: "",
    description: "",
    unitPrice: 0,
    productType: "",
    currency: "EUR",
  });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/crm/products/${id}`);
        if (response.ok) {
          const product = await response.json();
          setFormData(product);
        } else {
          alert("Failed to fetch product");
          router.push("/crm/products");
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        alert("Failed to fetch product");
        router.push("/crm/products");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : type === "number"
            ? parseFloat(value) || 0
            : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`/api/crm/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push("/crm/products");
      } else {
        const error = await response.json();
        alert("Failed to update product: " + error.error);
      }
    } catch (error) {
      console.error("Error updating product:", error);
      alert("Failed to update product");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-6">Loading product...</div>;
  }

  return (
    <div className="p-6">
      <Link
        href="/crm/products"
        className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-6"
      >
        <ArrowLeft size={18} />
        Back to Products
      </Link>

      <Card className="max-w-2xl bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Edit Product</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name || ""}
                  onChange={handleChange}
                  placeholder="e.g., CoroCAM 6D"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="productCode">Product Code *</Label>
                <Input
                  id="productCode"
                  name="productCode"
                  value={formData.productCode || ""}
                  onChange={handleChange}
                  placeholder="e.g., C6000"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  name="category"
                  value={formData.category || ""}
                  onChange={handleChange}
                  placeholder="e.g., Camera Handheld"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="productType">Product Type</Label>
                <Input
                  id="productType"
                  name="productType"
                  value={formData.productType || ""}
                  onChange={handleChange}
                  placeholder="e.g., CC6"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                name="description"
                value={formData.description || ""}
                onChange={handleChange}
                placeholder="Product description..."
                rows={4}
                className="w-full px-3 py-2 rounded-md bg-zinc-950 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="unitPrice">Unit Price</Label>
                <Input
                  id="unitPrice"
                  name="unitPrice"
                  type="number"
                  value={formData.unitPrice || ""}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Input
                  id="currency"
                  name="currency"
                  value={formData.currency || "EUR"}
                  onChange={handleChange}
                  placeholder="EUR"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="active"
                  name="active"
                  checked={formData.active || false}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 accent-indigo-600"
                />
                <Label htmlFor="active" className="mb-0">
                  Active
                </Label>
              </div>
            </div>

            <div className="flex gap-4 pt-6">
              <Button
                type="submit"
                disabled={saving}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {saving ? "Saving..." : "Save Changes"}
              </Button>
              <Link href="/crm/products">
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
