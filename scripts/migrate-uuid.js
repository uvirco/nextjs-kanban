require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");

let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
let serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Clean up environment variables - remove quotes and whitespace
supabaseUrl = supabaseUrl?.replace(/["\r\n]/g, "").trim();
serviceRoleKey = serviceRoleKey?.replace(/["\r\n]/g, "").trim();

console.log("🔍 Checking environment variables...");
console.log(
  "  Supabase URL:",
  supabaseUrl ? supabaseUrl.substring(0, 40) + "..." : "✗ MISSING"
);
console.log("  Service Role Key:", serviceRoleKey ? "✓" : "✗ MISSING");

if (!supabaseUrl || !serviceRoleKey) {
  console.error("❌ Missing required environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function checkAndMigrate() {
  try {
    console.log("\n📍 Connecting to Supabase...");

    // First, check current schema
    const { data: sampleDeal, error: checkError } = await supabase
      .from("CRMDeal")
      .select("*")
      .limit(1);

    if (checkError) {
      throw new Error(`Failed to query CRMDeal: ${checkError.message}`);
    }

    console.log("✅ Connected to Supabase");

    if (sampleDeal && sampleDeal.length > 0 && "id" in sampleDeal[0]) {
      console.log("✅ CRMDeal already has UUID 'id' column - no migration needed");
      return;
    }

    console.log("\n⚠️  CRMDeal is missing UUID 'id' column");
    console.log("🔨 Applying migration...\n");

    // Try to execute the SQL directly
    // Method 1: Using direct HTTP request with admin privileges
    const sqlStatements = [
      `ALTER TABLE "CRMDeal" ADD COLUMN IF NOT EXISTS "id" UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL;`,
      `CREATE INDEX IF NOT EXISTS idx_crm_deal_id ON "CRMDeal"("id");`,
    ];

    for (const sql of sqlStatements) {
      console.log(`Executing: ${sql.substring(0, 50)}...`);

      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
        },
        body: JSON.stringify({ sql }),
      });

      if (response.ok) {
        console.log("  ✅ Success\n");
      } else if (response.status === 404) {
        console.log(
          "  ⚠️  RPC endpoint not available - using alternative method...\n"
        );

        // Alternative: Try using the query builder with raw SQL
        // This won't work for DDL, so we need to inform the user
        throw new Error(
          "Direct SQL execution not available via API. Please run migration manually."
        );
      } else {
        const errorText = await response.text();
        throw new Error(`API request failed: ${response.status} - ${errorText}`);
      }
    }

    console.log("✨ Migration completed successfully!");

    // Verify
    const { data: verifyDeal } = await supabase
      .from("CRMDeal")
      .select("*")
      .limit(1);

    if (verifyDeal && verifyDeal.length > 0 && "id" in verifyDeal[0]) {
      console.log("✅ Verification passed - UUID column is now present");
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error("\n📖 To run the migration manually:");
    console.error("  1. Go to https://app.supabase.com");
    console.error("  2. Select your project");
    console.error("  3. Go to SQL Editor → New Query");
    console.error("  4. Copy and run the SQL from supabase-add-uuid-to-deal.sql");
    process.exit(1);
  }
}

checkAndMigrate();
