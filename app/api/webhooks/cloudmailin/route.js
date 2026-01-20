import { NextResponse } from "next/server";
import { supabase } from "../../../../lib/supabase"; // Adjust path if needed

export async function POST(request) {
  try {
    const body = await request.json();

    // CloudMailin sends email data in JSON format
    const { envelope, headers, plain, html, attachments } = body;

    // Extract key fields
    const from = envelope?.from || "";
    const to = envelope?.to?.join(", ") || "";
    const subject = headers?.Subject || "No Subject";
    const bodyText = plain || html || "";

    // Save to Supabase (assuming 'emails' table with columns: from_email, to_email, subject, body, received_at)
    const { data, error } = await supabase.from("emails").insert([
      {
        from_email: from,
        to_email: to,
        subject: subject,
        body: bodyText,
        received_at: new Date().toISOString(),
        // Add more fields if needed, e.g., attachments: JSON.stringify(attachments)
      },
    ]);

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to save email" },
        { status: 500 }
      );
    }

    console.log("Email saved:", data);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Failed to process email" },
      { status: 500 }
    );
  }
}
