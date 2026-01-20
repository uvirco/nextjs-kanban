"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { IconTrash, IconPlus } from "@tabler/icons-react";
import { CRMContact } from "@/types/crm";

interface CRMProduct {
  id: string;
  name: string;
  productCode: string;
  unitPrice?: number;
  currency?: string;
}

interface DealProduct {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

interface DealFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  stage: string;
  boardId?: string;
  dealToEdit?: any;
}

export default function DealFormModal({
  isOpen,
  onClose,
  onSuccess,
  stage,
  boardId,
  dealToEdit,
}: DealFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [contacts, setContacts] = useState<CRMContact[]>([]);
  const [products, setProducts] = useState<CRMProduct[]>([]);
  const [dealProducts, setDealProducts] = useState<DealProduct[]>([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedProductQuantity, setSelectedProductQuantity] = useState(1);
  const [selectedProductPrice, setSelectedProductPrice] = useState(0);
  const [formData, setFormData] = useState({
    title: "",
    contactId: "",
    value: "",
    expectedCloseDate: "",
    notes: "",
    stage: stage,
    boardId: boardId || "",
    order: 0,
  });

  useEffect(() => {
    fetchContacts();
    if (boardId === "default-sales-pipeline" || boardId === "sales-pipeline") {
      fetchProducts();
    }
    if (dealToEdit) {
      setFormData({
        title: dealToEdit.title || "",
        contactId: dealToEdit.contactId || "",
        value: dealToEdit.value?.toString() || "",
        expectedCloseDate: dealToEdit.expectedCloseDate || "",
        notes: dealToEdit.notes || "",
        stage: dealToEdit.stage || stage,
        boardId: dealToEdit.boardId || boardId || "",
        order: dealToEdit.order || 0,
      });
    } else {
      setFormData((prev) => ({
        ...prev,
        stage: stage,
        boardId: boardId || "",
      }));
    }
  }, [dealToEdit, stage, boardId]);

  const fetchContacts = async () => {
    try {
      const response = await fetch("/api/crm/contacts");
      if (response.ok) {
        const data = await response.json();
        setContacts(data.contacts);
      }
    } catch (error) {
      console.error("Error fetching contacts:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/crm/products");
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const handleAddProduct = () => {
    if (!selectedProductId) return;

    const product = products.find((p) => p.id === selectedProductId);
    if (!product) return;

    // Check if product is already added
    if (dealProducts.some((dp) => dp.productId === selectedProductId)) {
      alert("This product is already added to the deal");
      return;
    }

    const newDealProduct: DealProduct = {
      productId: selectedProductId,
      productName: product.name,
      quantity: selectedProductQuantity,
      unitPrice: selectedProductPrice || product.unitPrice || 0,
    };

    setDealProducts([...dealProducts, newDealProduct]);
    setSelectedProductId("");
    setSelectedProductQuantity(1);
    setSelectedProductPrice(0);
  };

  const handleRemoveProduct = (productId: string) => {
    setDealProducts(dealProducts.filter((dp) => dp.productId !== productId));
  };

  const updateProductQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) return;
    setDealProducts(
      dealProducts.map((dp) =>
        dp.productId === productId ? { ...dp, quantity } : dp,
      ),
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = dealToEdit
        ? `/api/crm/deals/${dealToEdit.id}`
        : "/api/crm/deals";
      const method = dealToEdit ? "PUT" : "POST";

      const payload = {
        ...formData,
        value: formData.value ? parseFloat(formData.value) : null,
        contactId: formData.contactId || null,
        expectedCloseDate: formData.expectedCloseDate || null,
      };

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const dealData = await response.json();
        const createdDealId =
          dealData.deal?.id || dealData.id || dealData.data?.id;

        // Add products if this is a new deal and products are selected
        if (!dealToEdit && createdDealId && dealProducts.length > 0) {
          const productErrors: string[] = [];
          for (const dealProduct of dealProducts) {
            try {
              const productResponse = await fetch(
                `/api/crm/deals/${createdDealId}/products`,
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    productId: dealProduct.productId,
                    quantity: dealProduct.quantity,
                    unitPrice: dealProduct.unitPrice,
                    currency: "EUR",
                  }),
                },
              );

              if (!productResponse.ok) {
                const errorData = await productResponse.json();
                productErrors.push(
                  `${dealProduct.productName}: ${errorData.error || "Failed to add product"}`,
                );
                console.error(
                  `Failed to add product ${dealProduct.productId}:`,
                  errorData,
                );
              } else {
                console.log(
                  `Successfully added product ${dealProduct.productId} to deal ${createdDealId}`,
                );
              }
            } catch (error) {
              productErrors.push(
                `${dealProduct.productName}: ${error instanceof Error ? error.message : "Unknown error"}`,
              );
              console.error("Error adding product to deal:", error);
            }
          }

          if (productErrors.length > 0) {
            console.warn("Some products failed to add:", productErrors);
          }
        }

        onSuccess();
        onClose();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || "Failed to save deal"}`);
      }
    } catch (error) {
      console.error("Error saving deal:", error);
      alert("Failed to save deal");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-800 border-zinc-700 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-white">
            {dealToEdit ? "Edit Deal" : "Add New Deal"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title" className="text-white">
              Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Deal title"
              className="mt-1 text-white"
            />
          </div>

          <div>
            <Label htmlFor="contactId" className="text-white">
              Contact
            </Label>
            <Select
              value={formData.contactId || "none"}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  contactId: value === "none" ? "" : value,
                })
              }
            >
              <SelectTrigger className="mt-1 text-white">
                <SelectValue placeholder="Select a contact" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                <SelectItem value="none">None</SelectItem>
                {contacts.map((contact) => (
                  <SelectItem key={contact.id} value={contact.id}>
                    {contact.name} {contact.email && `(${contact.email})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="value" className="text-white">
                Deal Value ($)
              </Label>
              <Input
                id="value"
                name="value"
                type="number"
                step="0.01"
                value={formData.value}
                onChange={handleChange}
                placeholder="10000"
                className="mt-1 text-white"
              />
            </div>

            <div>
              <Label htmlFor="expectedCloseDate" className="text-white">
                Expected Close Date
              </Label>
              <Input
                id="expectedCloseDate"
                name="expectedCloseDate"
                type="date"
                value={formData.expectedCloseDate}
                onChange={handleChange}
                className="mt-1 text-white"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes" className="text-white">
              Notes
            </Label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Additional information..."
              className="mt-1 text-white"
              rows={3}
            />
          </div>

          {/* Products Section - Only for CRM Pipeline */}
          {(boardId === "default-sales-pipeline" ||
            boardId === "sales-pipeline") &&
            !dealToEdit && (
              <div className="border-t border-zinc-700 pt-4">
                <h3 className="text-sm font-semibold text-white mb-4">
                  Products
                </h3>

                {/* Add Product Form */}
                <div className="space-y-3 mb-4 p-3 bg-zinc-700 rounded">
                  <div>
                    <Label htmlFor="productId" className="text-white text-sm">
                      Select Product
                    </Label>
                    <Select
                      value={selectedProductId}
                      onValueChange={(value) => {
                        setSelectedProductId(value);
                        const product = products.find((p) => p.id === value);
                        if (product) {
                          setSelectedProductPrice(product.unitPrice || 0);
                        }
                      }}
                    >
                      <SelectTrigger className="mt-1 text-white">
                        <SelectValue placeholder="Choose a product..." />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                        {products
                          .filter(
                            (p) =>
                              !dealProducts.some((dp) => dp.productId === p.id),
                          )
                          .map((product) => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.name} ({product.productCode}) - €
                              {product.unitPrice || 0}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label className="text-white text-sm">Quantity</Label>
                      <Input
                        type="number"
                        min="1"
                        value={selectedProductQuantity}
                        onChange={(e) =>
                          setSelectedProductQuantity(
                            parseInt(e.target.value) || 1,
                          )
                        }
                        className="mt-1 text-white"
                      />
                    </div>

                    <div>
                      <Label className="text-white text-sm">
                        Unit Price (€)
                      </Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={selectedProductPrice}
                        onChange={(e) =>
                          setSelectedProductPrice(
                            parseFloat(e.target.value) || 0,
                          )
                        }
                        placeholder="0.00"
                        className="mt-1 text-white"
                      />
                    </div>

                    <div className="flex items-end">
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleAddProduct}
                        disabled={!selectedProductId}
                        className="w-full bg-indigo-600 hover:bg-indigo-700"
                      >
                        <IconPlus size={16} className="mr-1" />
                        Add
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Products List */}
                {dealProducts.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-300">
                      Added Products ({dealProducts.length})
                    </div>
                    {dealProducts.map((dealProduct) => (
                      <Card
                        key={dealProduct.productId}
                        className="bg-zinc-700 border-zinc-600"
                      >
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-white">
                                {dealProduct.productName}
                              </p>
                              <p className="text-xs text-gray-400">
                                €{dealProduct.unitPrice} ×{" "}
                                {dealProduct.quantity} = €
                                {(
                                  dealProduct.unitPrice * dealProduct.quantity
                                ).toFixed(2)}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  updateProductQuantity(
                                    dealProduct.productId,
                                    dealProduct.quantity - 1,
                                  )
                                }
                                disabled={dealProduct.quantity <= 1}
                                className="h-7 w-7 p-0 text-white"
                              >
                                -
                              </Button>
                              <span className="w-8 text-center text-sm text-white">
                                {dealProduct.quantity}
                              </span>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  updateProductQuantity(
                                    dealProduct.productId,
                                    dealProduct.quantity + 1,
                                  )
                                }
                                className="h-7 w-7 p-0 text-white"
                              >
                                +
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="destructive"
                                onClick={() =>
                                  handleRemoveProduct(dealProduct.productId)
                                }
                                className="h-7 w-7 p-0"
                              >
                                <IconTrash size={14} />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    <div className="bg-zinc-700 p-3 rounded mt-3">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-white">
                          Total Deal Value:
                        </span>
                        <span className="text-lg font-bold text-green-400">
                          €
                          {dealProducts
                            .reduce(
                              (total, dp) => total + dp.quantity * dp.unitPrice,
                              0,
                            )
                            .toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading
                ? "Saving..."
                : dealToEdit
                  ? "Update Deal"
                  : "Create Deal"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
