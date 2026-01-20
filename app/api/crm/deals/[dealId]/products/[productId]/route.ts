import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { supabase } from "@/lib/supabase";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ dealId: string; productId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { dealId, productId } = await params;
    const body = await request.json();
    const { quantity, unitPrice, currency } = body;

    if (quantity !== undefined && (quantity <= 0 || !Number.isInteger(quantity))) {
      return NextResponse.json({ error: "Invalid quantity" }, { status: 400 });
    }

    // Verify user has access to this deal
    const { data: deal, error: dealError } = await supabase
      .from("crm_deals")
      .select("id, created_by_user_id, assigned_user_id")
      .eq("id", dealId)
      .single();

    if (dealError || !deal) {
      return NextResponse.json({ error: "Deal not found" }, { status: 404 });
    }

    if (deal.created_by_user_id !== session.user.id && deal.assigned_user_id !== session.user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Update the deal product
    const updateData: any = {};
    if (quantity !== undefined) updateData.quantity = quantity;
    if (unitPrice !== undefined) updateData.unit_price = unitPrice;
    if (currency !== undefined) updateData.currency = currency;
    updateData.updated_at = new Date().toISOString();

    const { data: dealProduct, error } = await supabase
      .from("crm_deal_products")
      .update(updateData)
      .eq("deal_id", dealId)
      .eq("product_id", productId)
      .select(`
        *,
        product:crm_products(*)
      `)
      .single();

    if (error) {
      console.error("Error updating deal product:", error);
      return NextResponse.json({ error: "Failed to update deal product" }, { status: 500 });
    }

    if (!dealProduct) {
      return NextResponse.json({ error: "Deal product not found" }, { status: 404 });
    }

    return NextResponse.json({ dealProduct });
  } catch (error) {
    console.error("Error in PUT /api/crm/deals/[dealId]/products/[productId]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ dealId: string; productId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { dealId, productId } = await params;

    // Verify user has access to this deal
    const { data: deal, error: dealError } = await supabase
      .from("crm_deals")
      .select("id, created_by_user_id, assigned_user_id")
      .eq("id", dealId)
      .single();

    if (dealError || !deal) {
      return NextResponse.json({ error: "Deal not found" }, { status: 404 });
    }

    if (deal.created_by_user_id !== session.user.id && deal.assigned_user_id !== session.user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Delete the deal product
    const { error } = await supabase
      .from("crm_deal_products")
      .delete()
      .eq("deal_id", dealId)
      .eq("product_id", productId);

    if (error) {
      console.error("Error deleting deal product:", error);
      return NextResponse.json({ error: "Failed to remove product from deal" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/crm/deals/[dealId]/products/[productId]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}