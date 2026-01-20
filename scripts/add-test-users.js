#!/usr/bin/env node

/**
 * Add test users to the User table in Supabase
 * 
 * Usage: 
 *   node scripts/add-test-users.js
 * 
 * Creates the following test users:
 *   - admin@company.com (already exists, will skip)
 *   - pierre@uvirco.com
 *   - alice@company.com
 *   - bob@company.com
 *   - carol@company.com
 * 
 * All users have password: TestPassword123!
 */

require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");
const bcrypt = require("bcryptjs");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("❌ Missing environment variables");
  console.error("  - NEXT_PUBLIC_SUPABASE_URL");
  console.error("  - SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

const testUsers = [
  {
    email: "pierre@uvirco.com",
    name: "Pierre Dupont",
    role: "MEMBER",
  },
  {
    email: "alice@company.com",
    name: "Alice Johnson",
    role: "MEMBER",
  },
  {
    email: "bob@company.com",
    name: "Bob Smith",
    role: "MEMBER",
  },
  {
    email: "carol@company.com",
    name: "Carol Williams",
    role: "MANAGER",
  },
];

const testPassword = "TestPassword123!";

async function addTestUsers() {
  try {
    console.log("🔍 Checking existing users...\n");

    for (const testUser of testUsers) {
      // Check if user already exists
      const { data: existingUser, error: checkError } = await supabase
        .from("User")
        .select("id, email")
        .eq("email", testUser.email)
        .single();

      if (existingUser) {
        console.log(`✅ User already exists: ${testUser.email}`);
        continue;
      }

      if (checkError && checkError.code !== "PGRST116") {
        // PGRST116 = no rows found (expected)
        console.error(`❌ Error checking user ${testUser.email}:`, checkError.message);
        continue;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(testPassword, 10);

      // Create user
      const { data: newUser, error: insertError } = await supabase
        .from("User")
        .insert({
          email: testUser.email,
          name: testUser.name,
          password: hashedPassword,
          role: testUser.role,
          isActive: true,
        })
        .select();

      if (insertError) {
        console.error(`❌ Failed to create user ${testUser.email}:`, insertError.message);
        continue;
      }

      console.log(`✨ Created user: ${testUser.email}`);
      console.log(`   Name: ${testUser.name}`);
      console.log(`   Role: ${testUser.role}\n`);
    }

    console.log("✅ Done!\n");
    console.log("📝 Test User Credentials:");
    console.log("━".repeat(50));
    for (const user of testUsers) {
      console.log(`Email: ${user.email}`);
      console.log(`Password: ${testPassword}`);
      console.log("─".repeat(50));
    }
    console.log("\n💡 Tip: You can now sign in with any of these users!");

  } catch (error) {
    console.error("❌ Fatal error:", error.message);
    process.exit(1);
  }
}

addTestUsers();
