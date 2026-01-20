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
      console.log("[GET products] Unauthorized");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    console.log("[GET products] Request:", { dealId: id, userId: session.user.id });

    // Verify user has access to this deal
    // Note: The URL parameter 'id' is actually the numeric deal_id from CRMDeal table
    // We need to select all fields to get the UUID id if it exists
    const { data: deal, error: dealError } = await supabase
      .from("CRMDeal")
      .select("*")
      .eq("deal_id", id)
      .single();

    console.log("[GET products] Deal lookup:", { dealError, deal });

    if (dealError || !deal) {
      console.log("[GET products] Deal not found");
      return NextResponse.json({ error: "Deal not found" }, { status: 404 });
    }

    // Check access - allow if user created it, is assigned to it, or if deal has no owner (null)
    const hasAccess =
      !deal.createdByUserId ||
      !deal.assignedUserId ||
      deal.createdByUserId === session.user.id ||
      deal.assignedUserId === session.user.id;

    if (!hasAccess) {
      console.log("[GET products] Access denied");
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Get deal products - don't use relationship syntax since there's no FK
    const { data: dealProducts, error } = await supabase
      .from("CRMDealProduct")
      .select(
        `
        id,
        dealId,
        productId,
        quantity,
        unitPrice,
        currency,
        createdAt,
        updatedAt,
        createdByUserId
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

    // If we have deal products, fetch the product details for each
    let enrichedProducts = dealProducts || [];
    if (enrichedProducts.length > 0) {
      const productIds = enrichedProducts.map((dp) => dp.productId);
      const { data: products } = await supabase
        .from("CRMProduct")
        .select("*")
        .in("id", productIds);

      // Map products into deal products
      enrichedProducts = enrichedProducts.map((dp) => ({
        ...dp,
        product: products?.find((p) => p.id === dp.productId),
      }));
    }

    return NextResponse.json({ dealProducts: enrichedProducts });
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
      console.error("[POST products] Invalid product data");
      return NextResponse.json(
        { error: "Invalid product data" },
        { status: 400 },
      );
    }

    // Verify user has access to this deal
    // Note: The URL parameter 'id' is actually the numeric deal_id from CRMDeal table
    // We need to select all fields to get the UUID id if it exists
    const { data: deal, error: dealError } = await supabase
      .from("CRMDeal")
      .select("*")
      .eq("deal_id", id)
      .single();

    console.log("[POST products] Deal lookup:", { dealError, deal });

    if (dealError || !deal) {
      console.error("[POST products] Deal not found:", { dealError, id });
      return NextResponse.json({ error: "Deal not found" }, { status: 404 });
    }

    // Check access - allow if user created it, is assigned to it, or if deal has no owner (null)
    const hasAccess =
      !deal.createdByUserId ||
      !deal.assignedUserId ||
      deal.createdByUserId === session.user.id ||
      deal.assignedUserId === session.user.id;

    if (!hasAccess) {
      console.error("[POST products] Access denied:", {
        userId: session.user.id,
        createdBy: deal.createdByUserId,
        assignedTo: deal.assignedUserId,
      });
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Verify product exists and is active
    const { data: product, error: productError } = await supabase
      .from("CRMProduct")
      .select("id, active, unitPrice, currency")
      .eq("id", productId)
      .eq("active", true)
      .single();

    console.log("[POST products] Product lookup:", { productError, product });

    if (productError || !product) {
      console.error("[POST products] Product not found or inactive:", { productError, productId });
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
    // Use deal.id if available (UUID), otherwise use the numeric id from URL
    const dealUUID = deal.id || deal.deal_id;
    
    // Try with explicit table and column specification
    const insertData = {
      dealId: dealUUID,
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
        createdByUserId
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

    // Fetch the product details to include in response
    const { data: product } = await supabase
      .from("CRMProduct")
      .select("*")
      .eq("id", productId)
      .single();

    const dealProductWithProduct = {
      ...dealProduct,
      product,
    };

    console.log("Successfully inserted deal product:", dealProductWithProduct);

    return NextResponse.json({ dealProduct: dealProductWithProduct });
  } catch (error) {
    console.error("Error in POST /api/crm/deals/[id]/products:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
