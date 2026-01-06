import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { z } from "zod";
import { MESSAGES } from "@/utils/messages";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: activityId } = await params;
    const body = await request.json();
    const { content } = body;

    const UpdateActivitySchema = z.object({
      content: z
        .string()
        .trim()
        .min(1, MESSAGES.ACTIVITY.CONTENT_TOO_SHORT)
        .max(10000, "Content too long (max 10000 chars)"),
    });

    const parse = UpdateActivitySchema.safeParse({ content });

    if (!parse.success) {
      return NextResponse.json(
        { error: parse.error.errors.map((e) => e.message).join(", ") },
        { status: 400 }
      );
    }

    // First check if the activity exists and belongs to the user
    const { data: existingActivity, error: fetchError } = await supabaseAdmin
      .from("Activity")
      .select("id, userId, boardId")
      .eq("id", activityId)
      .eq("userId", session.user.id)
      .single();

    if (fetchError || !existingActivity) {
      return NextResponse.json(
        { error: "Activity not found or access denied" },
        { status: 404 }
      );
    }

    // Update the activity
    const { error: updateError } = await supabaseAdmin
      .from("Activity")
      .update({
        content: parse.data.content,
      })
      .eq("id", activityId);

    if (updateError) {
      console.error("Update activity error:", updateError);
      return NextResponse.json(
        { error: MESSAGES.ACTIVITY.UPDATE_FAILURE },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: MESSAGES.ACTIVITY.UPDATE_SUCCESS
    });
  } catch (error) {
    console.error("Failed to update activity:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}