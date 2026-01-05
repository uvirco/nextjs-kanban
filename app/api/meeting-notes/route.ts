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

    // Fetch user data for attendees
    if (meetingNotes && meetingNotes.length > 0) {
      const allAttendeeIds = meetingNotes
        .flatMap((note: any) => note.attendees_text || [])
        .filter((id: string) => id);

      if (allAttendeeIds.length > 0) {
        const { data: users } = await supabaseAdmin
          .from("User")
          .select("id, name, email")
          .in("id", allAttendeeIds);

        const userMap = new Map(users?.map((u: any) => [u.id, u]) || []);

        meetingNotes.forEach((note: any) => {
          note.attendees = (note.attendees_text || [])
            .map((id: string) => userMap.get(id))
            .filter(Boolean);
        });
      }

      // Fetch user data for action item assignees
      const allAssigneeIds = meetingNotes
        .flatMap((note: any) =>
          (note.action_items || []).map((ai: any) => ai.assignee_text)
        )
        .filter((id: string) => id);

      if (allAssigneeIds.length > 0) {
        const { data: assignees } = await supabaseAdmin
          .from("User")
          .select("id, name, email")
          .in("id", allAssigneeIds);

        const assigneeMap = new Map(
          assignees?.map((u: any) => [u.id, u]) || []
        );

        meetingNotes.forEach((note: any) => {
          (note.action_items || []).forEach((item: any) => {
            item.assignee = assigneeMap.get(item.assignee_text);
          });
        });
      }
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
