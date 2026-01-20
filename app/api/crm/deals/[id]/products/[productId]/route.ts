import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { supabase } from "@/lib/supabase";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; productId: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, productId } = await params;
    const body = await request.json();
    const { quantity, unitPrice, currency } = body;

    if (
      quantity !== undefined &&
      (quantity <= 0 || !Number.isInteger(quantity))
    ) {
      return NextResponse.json({ error: "Invalid quantity" }, { status: 400 });
    }

    // Verify user has access to this deal
    const { data: deal, error: dealError } = await supabase
      .from("CRMDeal")
      .select("id, createdByUserId, assignedUserId")
      .eq("id", id)
      .single();

    if (dealError || !deal) {
      return NextResponse.json({ error: "Deal not found" }, { status: 404 });
    }

    if (
      deal.createdByUserId !== session.user.id &&
      deal.assignedUserId !== session.user.id
    ) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Update the deal product
    const updateData: any = {};
    if (quantity !== undefined) updateData.quantity = quantity;
    if (unitPrice !== undefined) updateData.unitPrice = unitPrice;
    if (currency !== undefined) updateData.currency = currency;
    updateData.updatedAt = new Date().toISOString();

    const { data: dealProduct, error } = await supabase
      .from("CRMDealProduct")
      .update(updateData)
      .eq("dealId", id)
      .eq("productId", productId)
      .select(
        `
        *,
        product:CRMProduct(*)
      `,
      )
      .single();

    if (error) {
      console.error("Error updating deal product:", error);
      return NextResponse.json(
        { error: "Failed to update deal product" },
        { status: 500 },
      );
    }

    if (!dealProduct) {
      return NextResponse.json(
        { error: "Deal product not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ dealProduct });
  } catch (error) {
    console.error(
      "Error in PUT /api/crm/deals/[id]/products/[productId]:",
      error,
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; productId: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, productId } = await params;

    // Verify user has access to this deal
    const { data: deal, error: dealError } = await supabase
      .from("CRMDeal")
      .select("id, createdByUserId, assignedUserId")
      .eq("id", id)
      .single();

    if (dealError || !deal) {
      return NextResponse.json({ error: "Deal not found" }, { status: 404 });
    }

    if (
      deal.createdByUserId !== session.user.id &&
      deal.assignedUserId !== session.user.id
    ) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Delete the deal product
    const { error } = await supabase
      .from("CRMDealProduct")
      .delete()
      .eq("dealId", id)
      .eq("productId", productId);

    if (error) {
      console.error("Error deleting deal product:", error);
      return NextResponse.json(
        { error: "Failed to remove product from deal" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(
      "Error in DELETE /api/crm/deals/[id]/products/[productId]:",
      error,
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
