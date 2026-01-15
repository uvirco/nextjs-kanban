import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!session || !userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const limit = parseInt(searchParams.get("limit") || "1000");
    const offset = parseInt(searchParams.get("offset") || "0");

    let query = supabaseAdmin
      .from("CRMOrganization")
      .select("id, name, address, website, industry, annualRevenue, numberOfEmployees, countryCode, createdAt, updatedAt")
      .order("name", { ascending: true })
      .range(offset, offset + limit - 1);

    if (search) {
      query = query.or(
        `name.ilike.%${search}%,industry.ilike.%${search}%,address.ilike.%${search}%`
      );
    }

    const { data: organizations, error } = await query;

    if (error) {
      console.error("Error fetching CRM organizations:", error);
      return NextResponse.json(
        { error: "Failed to fetch organizations" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      organizations: organizations || [],
    });
  } catch (error) {
    console.error("Error in CRM organizations API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!session || !userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Validate UUID format
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const validUserId = uuidRegex.test(userId) ? userId : null;

    const { data: organization, error } = await supabaseAdmin
      .from("CRMOrganization")
      .insert({
        ...body,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating CRM organization:", error);
      return NextResponse.json(
        { error: "Failed to create organization" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      organization: organization,
    });
  } catch (error) {
    console.error("Error in CRM organization creation API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}