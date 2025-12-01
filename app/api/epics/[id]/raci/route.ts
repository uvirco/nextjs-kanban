import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: epicId } = await params;

    const { data: raciEntries, error } = await supabaseAdmin
      .from("RACIMatrix")
      .select(
        `
        id,
        epicId,
        userId,
        role,
        createdAt,
        user:User (
          id,
          name,
          email,
          image
        )
      `
      )
      .eq("epicId", epicId)
      .order("createdAt", { ascending: true });

    if (error) {
      console.error("Error fetching RACI matrix:", error);
      return NextResponse.json(
        { error: "Failed to fetch RACI matrix" },
        { status: 500 }
      );
    }

    return NextResponse.json(raciEntries);
  } catch (error) {
    console.error("Error in GET /api/epics/[id]/raci:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: epicId } = await params;
    const { userId, role } = await request.json();

    if (!userId || !role) {
      return NextResponse.json(
        { error: "userId and role are required" },
        { status: 400 }
      );
    }

    // Check if this user-role combination already exists for this epic
    const { data: existingEntry } = await supabaseAdmin
      .from("RACIMatrix")
      .select("id")
      .eq("epicId", epicId)
      .eq("userId", userId)
      .eq("role", role)
      .single();

    if (existingEntry) {
      return NextResponse.json(
        {
          error:
            "This RACI role is already assigned to this user for this epic",
        },
        { status: 400 }
      );
    }

    const { data: raciEntry, error } = await supabaseAdmin
      .from("RACIMatrix")
      .insert({
        epicId,
        userId,
        role,
      })
      .select(
        `
        id,
        epicId,
        userId,
        role,
        createdAt,
        user:User (
          id,
          name,
          email,
          image
        )
      `
      )
      .single();

    if (error) {
      console.error("Error creating RACI entry:", error);
      return NextResponse.json(
        { error: "Failed to create RACI entry" },
        { status: 500 }
      );
    }

    return NextResponse.json(raciEntry, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/epics/[id]/raci:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
