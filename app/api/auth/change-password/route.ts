import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { email, currentPassword, newPassword } = await request.json();

    // Verify user email matches
    if (email !== session.user.email) {
      return NextResponse.json({ error: "Email mismatch" }, { status: 403 });
    }

    // Import supabaseAdmin lazily
    const { supabaseAdmin } = await import("@/lib/supabase");

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 500 }
      );
    }

    // Fetch user from database
    const { data: user, error: fetchError } = await supabaseAdmin
      .from("User")
      .select("id, password")
      .eq("email", email)
      .single();

    if (fetchError || !user) {
      console.error("User fetch error:", fetchError);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify current password
    const passwordValid = await bcrypt.compare(currentPassword, user.password);
    if (!passwordValid) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 401 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    const { error: updateError } = await supabaseAdmin
      .from("User")
      .update({ 
        password: hashedPassword, 
        updatedAt: new Date().toISOString() 
      })
      .eq("id", user.id);

    if (updateError) {
      console.error("Password update error:", updateError);
      return NextResponse.json(
        { error: "Failed to update password" },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: "Password changed successfully" 
    });
  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
