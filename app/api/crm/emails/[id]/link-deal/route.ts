import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    const { id } = await params;

    if (!session || !userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { dealId } = await request.json();

    // Get email details before updating
    const { data: email } = await supabaseAdmin
      .from("CRMEmail")
      .select("subject, receivedAt, sentAt, direction")
      .eq("id", id)
      .single();

    const { error } = await supabaseAdmin
      .from("CRMEmail")
      .update({ dealId: dealId || null })
      .eq("id", id);

    if (error) {
      console.error("Error linking email to deal:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // If linking to a deal (not unlinking), create activity
    if (dealId && email) {
      await supabaseAdmin.from("CRMActivity").insert({
        type: "EMAIL",
        content: `Email linked: ${email.subject || "(no subject)"}`,
        dealId: parseInt(dealId),
        createdByUserId: userId,
        createdAt: email.receivedAt || email.sentAt || new Date().toISOString(),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in link-deal API:", error);
    return NextResponse.json(
      { error: "Failed to link email to deal" },
      { status: 500 }
    );
  }
}
