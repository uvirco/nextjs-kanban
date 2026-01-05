import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const epicId = searchParams.get("epicId");

    let query = supabaseAdmin
      .from("MeetingNote")
      .select(
        `
        *,
        action_items:meeting_action_items(*),
        createdBy:User!created_by(name, email),
        epic:Task!epic_id(id, title)
      `
      )
      .order("meeting_date", { ascending: false });

    if (epicId) {
      query = query.eq("epic_id", epicId);
    }

    const { data: meetingNotes, error } = await query;

    if (error) {
      console.error("Error fetching meeting notes:", error);
      return NextResponse.json(
        { error: "Failed to fetch meeting notes" },
        { status: 500 }
      );
    }

    return NextResponse.json(meetingNotes || []);
  } catch (error) {
    console.error("Failed to fetch meeting notes:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
