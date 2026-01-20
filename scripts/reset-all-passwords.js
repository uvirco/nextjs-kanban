#!/usr/bin/env node

/**
 * Reset passwords for all users in the database
 * 
 * Usage: 
 *   node scripts/reset-all-passwords.js [password]
 * 
 * Example:
 *   node scripts/reset-all-passwords.js
 *   node scripts/reset-all-passwords.js MyPassword123!
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

async function resetAllPasswords() {
  const defaultPassword = process.argv[2] || "TestPassword123!";

  try {
    console.log(`🔍 Fetching all users...\n`);

    // Fetch all users
    const { data: users, error: fetchError } = await supabase
      .from("User")
      .select("id, email, name, role, isActive")
      .order("email");

    if (fetchError) {
      console.error("❌ Failed to fetch users:", fetchError.message);
      process.exit(1);
    }

    console.log(`📋 Found ${users.length} users\n`);
    console.log("━".repeat(60));

    let updated = 0;
    let failed = 0;

    // Hash password
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    for (const user of users) {
      try {
        const { error: updateError } = await supabase
          .from("User")
          .update({
            password: hashedPassword,
            isActive: true,
          })
          .eq("id", user.id);

        if (updateError) {
          console.log(`❌ ${user.email.padEnd(30)} - ${updateError.message}`);
          failed++;
        } else {
          console.log(`✅ ${user.email.padEnd(30)} - ${user.role.padEnd(10)} [${user.name}]`);
          updated++;
        }
      } catch (error) {
        console.log(`❌ ${user.email.padEnd(30)} - ${error.message}`);
        failed++;
      }
    }

    console.log("━".repeat(60));
    console.log(`\n📊 Results:`);
    console.log(`   ✅ Updated: ${updated}`);
    console.log(`   ❌ Failed: ${failed}`);
    console.log(`   📝 Password: ${defaultPassword}\n`);

    if (updated > 0) {
      console.log("💡 All users can now sign in with:");
      console.log(`   Password: ${defaultPassword}`);
    }

  } catch (error) {
    console.error("❌ Fatal error:", error.message);
    process.exit(1);
  }
}

resetAllPasswords();
