import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const { data: epicMembers, error } = await supabaseAdmin
      .from("EpicMember")
      .select(
        `
        id,
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
      .eq("epicId", params.id)
      .order("createdAt", { ascending: true });

    if (error) {
      console.error("Error fetching epic members:", error);
      return NextResponse.json(
        { error: "Failed to fetch epic team members" },
        { status: 500 }
      );
    }

    return NextResponse.json(epicMembers);
  } catch (error) {
    console.error("Error in GET /api/epics/[id]/members:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const { userId, role } = await request.json();

    if (!userId || !role) {
      return NextResponse.json(
        { error: "userId and role are required" },
        { status: 400 }
      );
    }

    // Check if user is already a member of this epic
    const { data: existingMember } = await supabaseAdmin
      .from("EpicMember")
      .select("id")
      .eq("epicId", params.id)
      .eq("userId", userId)
      .single();

    if (existingMember) {
      return NextResponse.json(
        { error: "User is already a member of this epic" },
        { status: 400 }
      );
    }

    const { data: epicMember, error } = await supabaseAdmin
      .from("EpicMember")
      .insert({
        epicId: params.id,
        userId,
        role,
      })
      .select(
        `
        id,
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
      console.error("Error adding epic member:", error);
      return NextResponse.json(
        { error: "Failed to add team member to epic" },
        { status: 500 }
      );
    }

    return NextResponse.json(epicMember, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/epics/[id]/members:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
