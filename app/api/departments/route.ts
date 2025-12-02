import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: departments, error } = await supabaseAdmin
      .from("Department")
      .select(
        `
        *,
        manager:User(id, name, email)
      `
      )
      .order("name");

    if (error) {
      console.error("Error fetching departments:", error);
      return NextResponse.json(
        { error: "Failed to fetch departments" },
        { status: 500 }
      );
    }

    return NextResponse.json(departments);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, managerId } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Department name is required" },
        { status: 400 }
      );
    }

    const { data: department, error } = await supabaseAdmin
      .from("Department")
      .insert({
        name,
        description: description || null,
        managerId: managerId || null,
      })
      .select(
        `
        *,
        manager:User(id, name, email)
      `
      )
      .single();

    if (error) {
      console.error("Error creating department:", error);
      return NextResponse.json(
        { error: "Failed to create department" },
        { status: 500 }
      );
    }

    return NextResponse.json(department);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
