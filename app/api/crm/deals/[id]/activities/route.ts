import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { auth } from "@/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const { data: activities, error } = await supabaseAdmin
      .from("CRMActivity")
      .select(
        `
        id,
        type,
        content,
        dealId,
        createdAt,
        createdByUserId,
        createdByUser:createdByUserId(id, name, email)
      `
      )
      .eq("dealId", parseInt(id))
      .order("createdAt", { ascending: false });

    if (error) {
      console.error("Error fetching deal activities:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ activities: activities || [] });
  } catch (error) {
    console.error("Error in deal activities API:", error);
    return NextResponse.json(
      { error: "Failed to fetch activities" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { type, content } = body;

    if (!type || !content) {
      return NextResponse.json(
        { error: "Type and content are required" },
        { status: 400 }
      );
    }

    // Get user ID
    const { data: users } = await supabaseAdmin
      .from("User")
      .select("id")
      .eq("email", session.user.email)
      .limit(1);

    const userId = users?.[0]?.id;

    const { data: activity, error } = await supabaseAdmin
      .from("CRMActivity")
      .insert({
        dealId: parseInt(id),
        type,
        content,
        createdByUserId: userId,
        createdAt: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating activity:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ activity }, { status: 201 });
  } catch (error) {
    console.error("Error in create activity API:", error);
    return NextResponse.json(
      { error: "Failed to create activity" },
      { status: 500 }
    );
  }
}
