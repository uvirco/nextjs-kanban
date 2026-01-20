import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase";

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
    const { data: deal, error: dealError } = await supabaseAdmin
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
    // Use the deal's UUID id field (required for CRMDealProduct.dealId which is UUID type)
    const dealUUID = (deal as any).id;
    if (!dealUUID) {
      console.log("[GET products] Error: CRMDeal has no UUID id field. Database migration needed.");
      return NextResponse.json(
        {
          error:
            "Database schema migration required. Please run the UUID migration in Supabase SQL Editor. See URGENT_MIGRATION_REQUIRED.md for instructions.",
          details:
            "CRMDeal table is missing UUID 'id' column. This column is required for the product management feature to work.",
          instructions: "https://github.com/yourusername/nextjs-kanban-crm#urgent-migration-required",
        },
        { status: 500 }
      );
    }
    console.log("[GET products] Using dealUUID:", dealUUID, "for query (deal_id:", id, ")");
    
    const { data: dealProducts, error } = await supabaseAdmin
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
      .eq("dealId", dealUUID)
      .order("createdAt", { ascending: true });

    if (error) {
      console.error("Error fetching deal products:", error);
      return NextResponse.json(
        { error: "Failed to fetch deal products" },
        { status: 500 },
      );
    }

    // If we have deal products, fetch the product details for each
    let enrichedProducts: any[] = dealProducts || [];
    if (enrichedProducts.length > 0) {
      const productIds = enrichedProducts.map((dp: any) => dp.productId);
      const { data: products } = await supabaseAdmin
        .from("CRMProduct")
        .select("*")
        .in("id", productIds);

      // Map products into deal products
      enrichedProducts = enrichedProducts.map((dp: any) => ({
        ...dp,
        product: products?.find((p: any) => p.id === dp.productId),
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
    const { data: deal, error: dealError } = await supabaseAdmin
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
    const { data: product, error: productError } = await supabaseAdmin
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

    console.log("[POST products] About to insert deal product:", {
      dealId: id,
      productId,
      quantity,
      unitPrice: finalUnitPrice,
      currency: finalCurrency,
      createdByUserId: session.user.id,
    });

    // Add product to deal
    // Use deal.id if available (UUID), otherwise use the numeric id from URL
    const dealUUID = (deal as any).id;
    if (!dealUUID) {
      console.error("[POST products] Error: CRMDeal has no UUID id field. Database migration needed.");
      return NextResponse.json(
        {
          error:
            "Database schema migration required. Please run the UUID migration in Supabase SQL Editor. See URGENT_MIGRATION_REQUIRED.md for instructions.",
          details:
            "CRMDeal table is missing UUID 'id' column. This column is required for the product management feature to work.",
        },
        { status: 500 }
      );
    }
    console.log("[POST products] Using dealUUID:", dealUUID);
    
    // Check if user ID is a valid UUID (Supabase auth.users stores UUIDs)
    // If session user ID is not a UUID format, make createdByUserId optional
    const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      session.user.id
    );
    
    const insertData: any = {
      dealId: dealUUID,
      productId: productId,
      quantity: quantity,
      unitPrice: finalUnitPrice,
      currency: finalCurrency,
    };
    
    // Only include createdByUserId if it's a valid UUID
    if (isValidUUID) {
      insertData.createdByUserId = session.user.id;
      console.log("[POST products] Using createdByUserId:", session.user.id);
    } else {
      console.log("[POST products] Skipping createdByUserId - not a valid UUID format:", session.user.id);
    }
    
    console.log("[POST products] Insert payload:", insertData);

    const { data: dealProduct, error } = await supabaseAdmin
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

    // Include the product details we already fetched earlier
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
