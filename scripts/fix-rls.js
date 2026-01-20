require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");

let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
let serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Clean up environment variables
supabaseUrl = supabaseUrl?.replace(/["\r\n]/g, "").trim();
serviceRoleKey = serviceRoleKey?.replace(/["\r\n]/g, "").trim();

console.log("🔍 Checking environment variables...");
if (!supabaseUrl || !serviceRoleKey) {
  console.error("❌ Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function fixRLSPolicies() {
  try {
    console.log("\n📍 Connecting to Supabase...");

    // Test connection
    const { data: test, error: testError } = await supabase
      .from("CRMDealProduct")
      .select("id")
      .limit(1);

    if (testError) {
      throw new Error(`Connection test failed: ${testError.message}`);
    }

    console.log("✅ Connected to Supabase");

    console.log(
      "\n⚠️  RLS policies on CRMDealProduct are too restrictive for development"
    );
    console.log("🔨 Applying development-friendly RLS policies...\n");

    // The RLS policies need to be updated via Supabase SQL Editor
    // Display instructions for manual execution
    console.log("📖 MANUAL STEPS REQUIRED:\n");
    console.log("1. Go to https://app.supabase.com");
    console.log("2. Select your project");
    console.log("3. Open SQL Editor → New Query");
    console.log("4. Copy and run the SQL from: supabase-fix-rls-dev-mode.sql\n");

    console.log("💡 The SQL will:");
    console.log("   - Drop current restrictive RLS policies");
    console.log("   - Create permissive policies for authenticated users");
    console.log("   - Allow development/testing of the feature\n");

    console.log("⏱️  After running the SQL, restart the dev server:");
    console.log("   npm run dev\n");

    console.log("Then try adding a product to a deal again.");
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

fixRLSPolicies();
