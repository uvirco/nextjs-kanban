import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; noteId: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { noteId } = await params;

    const { data: meetingNote, error } = await supabaseAdmin
      .from("MeetingNote")
      .select(
        `
        *,
        action_items:meeting_action_items(*),
        createdBy:User(name, email)
      `
      )
      .eq("id", noteId)
      .single();

    if (error) {
      console.error("Error fetching meeting note:", error);
      return NextResponse.json(
        { error: "Failed to fetch meeting note" },
        { status: 500 }
      );
    }

    return NextResponse.json(meetingNote);
  } catch (error) {
    console.error("Failed to fetch meeting note:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; noteId: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { noteId } = await params;
    const body = await request.json();

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
      actionItems, // Array of action items with potential ids
      type,
    } = body;

    // Update the meeting note (without action_items field)
    const { data: meetingNote, error } = await supabaseAdmin
      .from("MeetingNote")
      .update({
        title,
        meeting_type: meetingType || meeting_type,
        meeting_date: meetingDate || meeting_date,
        attendees_text: attendees,
        agenda,
        notes,
        decisions,
        type: type || "meeting", // Include type field
        updated_at: new Date().toISOString(),
      })
      .eq("id", noteId)
      .select()
      .single();

    if (error) {
      console.error("Error updating meeting note:", error);
      return NextResponse.json(
        { error: "Failed to update meeting note" },
        { status: 500 }
      );
    }

    // Handle action items if provided
    if (actionItems !== undefined) {
      // Get existing action items
      const { data: existingActionItems, error: fetchError } =
        await supabaseAdmin
          .from("meeting_action_items")
          .select("id")
          .eq("meeting_note_id", noteId);

      if (fetchError) {
        console.error("Error fetching existing action items:", fetchError);
      } else {
        const existingIds = new Set(
          (existingActionItems || []).map((item: any) => item.id)
        );
        const incomingIds = new Set(
          actionItems.filter((item: any) => item.id).map((item: any) => item.id)
        );

        // Delete action items that are no longer present
        const idsToDelete = Array.from(existingIds).filter(
          (id) => !incomingIds.has(id)
        );
        if (idsToDelete.length > 0) {
          await supabaseAdmin
            .from("meeting_action_items")
            .delete()
            .in("id", idsToDelete);
        }

        // Update or create action items
        for (const item of actionItems) {
          const actionItemData = {
            meeting_note_id: noteId,
            description: item.description,
            assignee_text: item.assignee,
            status: item.status || "pending",
            priority: item.priority || "medium",
            due_date: item.due_date,
            updated_at: new Date().toISOString(),
          };

          if (item.id) {
            // Update existing
            await supabaseAdmin
              .from("meeting_action_items")
              .update(actionItemData)
              .eq("id", item.id);
          } else {
            // Create new
            await supabaseAdmin
              .from("meeting_action_items")
              .insert(actionItemData);
          }
        }
      }
    }

    // Fetch the complete updated meeting note with relationships
    const { data: completeMeetingNote, error: fetchError } = await supabaseAdmin
      .from("MeetingNote")
      .select(
        `
        *,
        action_items:meeting_action_items(*),
        createdBy:User(name, email)
      `
      )
      .eq("id", noteId)
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
    console.error("Failed to update meeting note:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; noteId: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { noteId } = await params;

    const { error } = await supabaseAdmin
      .from("MeetingNote")
      .delete()
      .eq("id", noteId);

    if (error) {
      console.error("Error deleting meeting note:", error);
      return NextResponse.json(
        { error: "Failed to delete meeting note" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete meeting note:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
