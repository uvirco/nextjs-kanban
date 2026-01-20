import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { supabase } from "@/lib/supabase";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

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

    // Get deal products with product details
    const { data: dealProducts, error } = await supabase
      .from("CRMDealProduct")
      .select(
        `
        *,
        product:CRMProduct(*)
      `,
      )
      .eq("dealId", id)
      .order("createdAt", { ascending: true });

    if (error) {
      console.error("Error fetching deal products:", error);
      return NextResponse.json(
        { error: "Failed to fetch deal products" },
        { status: 500 },
      );
    }

    return NextResponse.json({ dealProducts: dealProducts || [] });
  } catch (error) {
    console.error("Error in GET /api/crm/deals/[id]/products:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      console.error(
        "POST /api/crm/deals/[id]/products - Unauthorized: no session",
      );
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { productId, quantity, unitPrice, currency } = body;

    console.log("POST /api/crm/deals/[id]/products - Request:", {
      dealId: id,
      productId,
      quantity,
      unitPrice,
      currency,
      userId: session.user.id,
    });

    if (!productId || !quantity || quantity <= 0) {
      return NextResponse.json(
        { error: "Invalid product data" },
        { status: 400 },
      );
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

    // Verify product exists and is active
    const { data: product, error: productError } = await supabase
      .from("CRMProduct")
      .select("id, active, unitPrice, currency")
      .eq("id", productId)
      .eq("active", true)
      .single();

    if (productError || !product) {
      return NextResponse.json(
        { error: "Product not found or inactive" },
        { status: 404 },
      );
    }

    // Use provided unitPrice or default to product's unitPrice
    const finalUnitPrice =
      unitPrice !== undefined ? unitPrice : product.unitPrice;
    const finalCurrency = currency || product.currency || "EUR";

    console.log("About to insert deal product:", {
      dealId: id,
      productId,
      quantity,
      unitPrice: finalUnitPrice,
      currency: finalCurrency,
      createdByUserId: session.user.id,
    });

    // Add product to deal
    // Try with explicit table and column specification
    const insertData = {
      dealId: id,
      productId: productId,
      quantity: quantity,
      unitPrice: finalUnitPrice,
      currency: finalCurrency,
      createdByUserId: session.user.id,
    };
    
    console.log("Insert payload:", insertData);

    const { data: dealProduct, error } = await supabase
      .from("CRMDealProduct")
      .insert([insertData])
      .select(
        `
        id,
        dealId,
        productId,
        quantity,
        unitPrice,
        currency,
        createdAt,
        createdByUserId,
        product:CRMProduct(id, name, productCode, unitPrice, currency)
      `,
      )
      .single();

    if (error) {
      console.error("Error adding product to deal:", error);
      return NextResponse.json(
        { error: "Failed to add product to deal", details: error },
        { status: 500 },
      );
    }

    console.log("Successfully inserted deal product:", dealProduct);

    return NextResponse.json({ dealProduct });
  } catch (error) {
    console.error("Error in POST /api/crm/deals/[id]/products:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
