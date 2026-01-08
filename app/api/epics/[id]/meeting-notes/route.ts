import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: epicId } = await params;

    const { data: meetingNotes, error } = await supabaseAdmin
      .from("MeetingNote")
      .select(
        `
        *,
        epic:Task!epic_id(id, title),
        action_items:meeting_action_items(*),
        createdBy:User!created_by(name, email)
      `
      )
      .eq("epic_id", epicId)
      .order("meeting_date", { ascending: false });

    if (error) {
      console.error("Error fetching meeting notes:", error);
      return NextResponse.json(
        { error: "Failed to fetch meeting notes" },
        { status: 500 }
      );
    }

    // Fetch user data for attendees and action item assignees
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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: epicId } = await params;
    const body = await request.json();
    console.log("POST /api/epics/[id]/meeting-notes - Request body:", body);

    const {
      title,
      meetingType,
      meeting_type,
      meetingDate,
      meeting_date,
      attendees,
      agenda,
      notes,
      decisions,
      actionItems,
      type,
    } = body;

    const { data: meetingNote, error } = await supabaseAdmin
      .from("MeetingNote")
      .insert({
        title,
        meeting_type: meetingType || meeting_type || "other",
        meeting_date: (meetingDate || meeting_date) || new Date().toISOString(),
        attendees_text: attendees || [],
        agenda,
        notes,
        decisions,
        type: type || "meeting", // Default to "meeting" for backward compatibility
        epic_id: epicId,
        created_by: session.user.id,
      })
      .select()
      .single();

    console.log("Inserting meeting note with data:", {
      title,
      meeting_type: meetingType || meeting_type || "other",
      meeting_date: meetingDate || meeting_date,
      type: type || "meeting",
    });

    if (error) {
      console.error("Error creating meeting note:", error);
      return NextResponse.json(
        { error: "Failed to create meeting note" },
        { status: 500 }
      );
    }

    // If action items were provided, create them
    let createdActionItems = [];
    if (actionItems && Array.isArray(actionItems) && actionItems.length > 0) {
      const actionItemsToCreate = actionItems.map((item) => ({
        meeting_note_id: meetingNote.id,
        description: item.description,
        assignee_text: item.assignee,
        status: item.status || "pending",
        priority: item.priority || "medium",
        due_date: item.due_date,
      }));

      const { data: actionItemsData, error: actionItemsError } =
        await supabaseAdmin
          .from("meeting_action_items")
          .insert(actionItemsToCreate)
          .select();

      if (actionItemsError) {
        console.error("Error creating action items:", actionItemsError);
        // Don't fail the whole request, just log the error
      } else {
        createdActionItems = actionItemsData || [];
      }
    }

    // Fetch the complete meeting note with relationships
    const { data: completeMeetingNote, error: fetchError } = await supabaseAdmin
      .from("MeetingNote")
      .select(
        `
        *,
        epic:Task!epic_id(id, title),
        action_items:meeting_action_items(*),
        createdBy:User(name, email)
      `
      )
      .eq("id", meetingNote.id)
      .single();

    if (fetchError) {
      console.error("Error fetching complete meeting note:", fetchError);
      return NextResponse.json(meetingNote); // Return basic meeting note if fetch fails
    }

    // Fetch user data for attendees
    if (
      completeMeetingNote.attendees_text &&
      completeMeetingNote.attendees_text.length > 0
    ) {
      const { data: users } = await supabaseAdmin
        .from("User")
        .select("id, name, email")
        .in("id", completeMeetingNote.attendees_text);

      completeMeetingNote.attendees = users || [];
    }

    // Fetch user data for action item assignees
    if (
      completeMeetingNote.action_items &&
      completeMeetingNote.action_items.length > 0
    ) {
      const assigneeIds = completeMeetingNote.action_items
        .map((item: any) => item.assignee_text)
        .filter(Boolean);

      if (assigneeIds.length > 0) {
        const { data: assignees } = await supabaseAdmin
          .from("User")
          .select("id, name, email")
          .in("id", assigneeIds);

        const assigneeMap = new Map(
          assignees?.map((u: any) => [u.id, u]) || []
        );

        completeMeetingNote.action_items.forEach((item: any) => {
          item.assignee = assigneeMap.get(item.assignee_text);
        });
      }
    }

    return NextResponse.json(completeMeetingNote);
  } catch (error) {
    console.error("Failed to create meeting note:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
