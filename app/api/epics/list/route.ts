import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch all epics that have the isEpic flag set to true
    const { data: epics, error } = await supabaseAdmin
      .from("Task")
      .select("id, title")
      .eq("isEpic", true)
      .order("title", { ascending: true });

    if (error) {
      console.error("Error fetching epics:", error);
      return NextResponse.json(
        { error: "Failed to fetch epics" },
        { status: 500 }
      );
    }

    return NextResponse.json(epics || []);
  } catch (error) {
    console.error("Failed to fetch epics:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
