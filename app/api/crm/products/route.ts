import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("CRMProduct")
      .select("*")
      .order("name");

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ products: data || [] });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      productCode,
      active,
      category,
      description,
      unitPrice,
      billingCycle,
      productType,
      currency,
    } = body;

    if (!name || !productCode) {
      return NextResponse.json(
        { error: "Name and Product Code are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("CRMProduct")
      .insert([
        {
          name,
          productCode,
          active: active ?? true,
          category,
          description,
          unitPrice: unitPrice ? parseFloat(unitPrice) : null,
          billingCycle,
          productType,
          currency: currency || "EUR",
          createdByUserId: session.user.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
