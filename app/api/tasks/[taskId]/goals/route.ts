import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { taskId } = await params;

  try {
    const { data: goals, error } = await supabaseAdmin
      .from("Goal")
      .select("*")
      .eq("taskId", taskId)
      .order("order", { ascending: true });

    if (error) {
      console.error("Error fetching goals:", error);
      return NextResponse.json(
        { error: "Failed to fetch goals" },
        { status: 500 }
      );
    }

    return NextResponse.json(goals || []);
  } catch (error) {
    console.error("Error fetching goals:", error);
    return NextResponse.json(
      { error: "Failed to fetch goals" },
      { status: 500 }
    );
  }
}
