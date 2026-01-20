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
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconCheck,
  IconX,
} from "@tabler/icons-react";
import Link from "next/link";
import { CRMProduct } from "@/types/crm";

export default function CRMProductsPage() {
  const [products, setProducts] = useState<CRMProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/crm/products");
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const response = await fetch(`/api/crm/products/${productId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setProducts(products.filter((p) => p.id !== productId));
      } else {
        alert("Failed to delete product");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Failed to delete product");
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.productCode.toLowerCase().includes(search.toLowerCase()) ||
      product.category?.toLowerCase().includes(search.toLowerCase());

    if (filter === "active") return matchesSearch && product.active;
    if (filter === "inactive") return matchesSearch && !product.active;
    return matchesSearch;
  });

  if (loading) {
    return <div className="p-6">Loading products...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Products</h1>
        <Link href="/crm/products/new">
          <Button className="gap-2">
            <IconPlus size={18} />
            Add Product
          </Button>
        </Link>
      </div>

      <div className="mb-4 flex gap-4">
        <Input
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <select
          value={filter}
          onChange={(e) =>
            setFilter(e.target.value as "all" | "active" | "inactive")
          }
          className="px-3 py-2 rounded-md bg-zinc-800 border border-zinc-700 text-white text-sm"
        >
          <option value="all">All Products</option>
          <option value="active">Active Only</option>
          <option value="inactive">Inactive Only</option>
        </select>
      </div>

      <Tabs defaultValue="table" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="table">Table View</TabsTrigger>
          <TabsTrigger value="cards">Card View</TabsTrigger>
        </TabsList>

        <TabsContent value="table" className="mt-6">
          <div className="rounded-lg border border-zinc-800 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-zinc-800 hover:bg-zinc-900/50">
                  <TableHead className="text-zinc-300">Name</TableHead>
                  <TableHead className="text-zinc-300">Product Code</TableHead>
                  <TableHead className="text-zinc-300">Category</TableHead>
                  <TableHead className="text-zinc-300">Unit Price</TableHead>
                  <TableHead className="text-zinc-300">Product Type</TableHead>
                  <TableHead className="text-zinc-300">Status</TableHead>
                  <TableHead className="text-zinc-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-zinc-500">
                      No products found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((product) => (
                    <TableRow
                      key={product.id}
                      className="border-b border-zinc-800 hover:bg-zinc-900/50"
                    >
                      <TableCell className="text-white font-medium">
                        {product.name}
                      </TableCell>
                      <TableCell className="text-zinc-400">
                        {product.productCode}
                      </TableCell>
                      <TableCell className="text-zinc-400">
                        {product.category || "-"}
                      </TableCell>
                      <TableCell className="text-zinc-400">
                        {product.unitPrice
                          ? `${product.unitPrice.toLocaleString()} ${product.currency || "EUR"}`
                          : "-"}
                      </TableCell>
                      <TableCell className="text-zinc-400">
                        {product.productType || "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {product.active ? (
                            <IconCheck size={16} className="text-green-500" />
                          ) : (
                            <IconX size={16} className="text-red-500" />
                          )}
                          <span className="text-sm">
                            {product.active ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Link href={`/crm/products/${product.id}`}>
                            <Button size="sm" variant="ghost">
                              <IconEdit size={16} />
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteProduct(product.id)}
                            className="text-red-500 hover:text-red-600"
                          >
                            <IconTrash size={16} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="cards" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.length === 0 ? (
              <div className="col-span-full text-center py-8 text-zinc-500">
                No products found
              </div>
            ) : (
              filteredProducts.map((product) => (
                <Card
                  key={product.id}
                  className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors"
                >
                  <CardHeader>
                    <CardTitle className="text-lg text-white">
                      {product.name}
                    </CardTitle>
                    <p className="text-sm text-zinc-400 mt-1">
                      Code: {product.productCode}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {product.category && (
                      <div>
                        <p className="text-xs text-zinc-500">Category</p>
                        <p className="text-sm text-white">{product.category}</p>
                      </div>
                    )}
                    {product.unitPrice && (
                      <div>
                        <p className="text-xs text-zinc-500">Unit Price</p>
                        <p className="text-sm text-white">
                          {product.unitPrice.toLocaleString()}{" "}
                          {product.currency || "EUR"}
                        </p>
                      </div>
                    )}
                    {product.productType && (
                      <div>
                        <p className="text-xs text-zinc-500">Product Type</p>
                        <p className="text-sm text-white">{product.productType}</p>
                      </div>
                    )}
                    <div className="pt-3 border-t border-zinc-800 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        {product.active ? (
                          <IconCheck size={16} className="text-green-500" />
                        ) : (
                          <IconX size={16} className="text-red-500" />
                        )}
                        <span className="text-xs">
                          {product.active ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/crm/products/${product.id}`}>
                          <Button size="sm" variant="ghost">
                            <IconEdit size={16} />
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteProduct(product.id)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <IconTrash size={16} />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
