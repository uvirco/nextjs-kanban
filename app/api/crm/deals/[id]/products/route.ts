import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { supabase } from "@/lib/supabase";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify user has access to this deal
    const { data: deal, error: dealError } = await supabase
      .from("crm_deals")
      .select("id, created_by_user_id, assigned_user_id")
      .eq("id", id)
      .single();

    if (dealError || !deal) {
      return NextResponse.json({ error: "Deal not found" }, { status: 404 });
    }

    if (deal.created_by_user_id !== session.user.id && deal.assigned_user_id !== session.user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Get deal products with product details
    const { data: dealProducts, error } = await supabase
      .from("crm_deal_products")
      .select(`
        *,
        product:crm_products(*)
      `)
      .eq("deal_id", id)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching deal products:", error);
      return NextResponse.json({ error: "Failed to fetch deal products" }, { status: 500 });
    }

    return NextResponse.json({ dealProducts: dealProducts || [] });
  } catch (error) {
    console.error("Error in GET /api/crm/deals/[id]/products:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { productId, quantity, unitPrice, currency } = body;

    if (!productId || !quantity || quantity <= 0) {
      return NextResponse.json({ error: "Invalid product data" }, { status: 400 });
    }

    // Verify user has access to this deal
    const { data: deal, error: dealError } = await supabase
      .from("crm_deals")
      .select("id, created_by_user_id, assigned_user_id")
      .eq("id", id)
      .single();

    if (dealError || !deal) {
      return NextResponse.json({ error: "Deal not found" }, { status: 404 });
    }

    if (deal.created_by_user_id !== session.user.id && deal.assigned_user_id !== session.user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Verify product exists and is active
    const { data: product, error: productError } = await supabase
      .from("crm_products")
      .select("id, active, unit_price, currency")
      .eq("id", productId)
      .eq("active", true)
      .single();

    if (productError || !product) {
      return NextResponse.json({ error: "Product not found or inactive" }, { status: 404 });
    }

    // Use provided unitPrice or default to product's unitPrice
    const finalUnitPrice = unitPrice !== undefined ? unitPrice : product.unit_price;
    const finalCurrency = currency || product.currency || "EUR";

    // Add product to deal
    const { data: dealProduct, error } = await supabase
      .from("crm_deal_products")
      .insert({
        deal_id: id,
        product_id: productId,
        quantity,
        unit_price: finalUnitPrice,
        currency: finalCurrency,
        created_by_user_id: session.user.id,
      })
      .select(`
        *,
        product:crm_products(*)
      `)
      .single();

    if (error) {
      console.error("Error adding product to deal:", error);
      return NextResponse.json({ error: "Failed to add product to deal" }, { status: 500 });
    }

    return NextResponse.json({ dealProduct });
  } catch (error) {
    console.error("Error in POST /api/crm/deals/[id]/products:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
