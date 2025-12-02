import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    const { data: roles, error } = await supabaseAdmin
      .from("EpicRole")
      .select("*")
      .eq("isActive", true)
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
    console.error("Error in GET /api/roles:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}