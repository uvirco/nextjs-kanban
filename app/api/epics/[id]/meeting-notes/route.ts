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

    const {
      title,
      meetingType,
      meetingDate,
      attendees,
      agenda,
      notes,
      decisions,
      actionItems,
    } = body;

    const { data: meetingNote, error } = await supabaseAdmin
      .from("MeetingNote")
      .insert({
        title,
        meeting_type: meetingType || "other",
        meeting_date: meetingDate,
        attendees_text: attendees || [],
        agenda,
        notes,
        decisions,
        epic_id: epicId,
        created_by: session.user.id,
      })
      .select()
      .single();

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
        due_date: item.dueDate,
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

    return NextResponse.json(completeMeetingNote);
  } catch (error) {
    console.error("Failed to create meeting note:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
