import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    const { data: roles, error } = await supabaseAdmin
      .from("EpicRole")
      .select("*")
      .order("sortOrder", { ascending: true });

    if (error) {
      console.error("Error fetching roles:", error);
      return NextResponse.json(
        { error: "Failed to fetch roles" },
        { status: 500 }
      );
    }

    return NextResponse.json(roles);
  } catch (error) {
    console.error("Error in GET /api/admin/epic-roles:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, category, sortOrder } = body;

    if (!name || !category) {
      return NextResponse.json(
        { error: "Name and category are required" },
        { status: 400 }
      );
    }

    const { data: role, error } = await supabaseAdmin
      .from("EpicRole")
      .insert({
        name,
        description,
        category,
        sortOrder: sortOrder || 0,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating role:", error);
      return NextResponse.json(
        { error: "Failed to create role" },
        { status: 500 }
      );
    }

    return NextResponse.json(role);
  } catch (error) {
    console.error("Error in POST /api/admin/epic-roles:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}