#!/usr/bin/env node

/**
 * Reset password for a specific user
 * 
 * Usage: 
 *   node scripts/reset-user-password.js <email> [password]
 * 
 * Example:
 *   node scripts/reset-user-password.js pierre@uvirco.com
 *   node scripts/reset-user-password.js pierre@uvirco.com MyNewPassword123!
 */

require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");
const bcrypt = require("bcryptjs");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("❌ Missing environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function resetPassword() {
  const email = process.argv[2];
  let password = process.argv[3] || "TestPassword123!";

  if (!email) {
    console.error("❌ Email required");
    console.error("Usage: node scripts/reset-user-password.js <email> [password]");
    process.exit(1);
  }

  try {
    console.log(`🔍 Looking up user: ${email}\n`);

    // Find user
    const { data: user, error: findError } = await supabase
      .from("User")
      .select("id, email, name, role, isActive")
      .eq("email", email)
      .single();

    if (findError) {
      console.error("❌ User not found:", email);
      process.exit(1);
    }

    console.log("📋 Current user details:");
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Active: ${user.isActive}\n`);

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password and activate user
    const { data: updated, error: updateError } = await supabase
      .from("User")
      .update({
        password: hashedPassword,
        isActive: true,
      })
      .eq("id", user.id)
      .select();

    if (updateError) {
      console.error("❌ Failed to update password:", updateError.message);
      process.exit(1);
    }

    console.log("✅ Password reset successful!\n");
    console.log("📝 New credentials:");
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`   Active: true\n`);
    console.log("💡 You can now sign in with these credentials!");

  } catch (error) {
    console.error("❌ Fatal error:", error.message);
    process.exit(1);
  }
}

resetPassword();
