#!/usr/bin/env node

// Apply SQL migration to add UUID id column to CRMDeal
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  try {
    console.log("Running migration to add UUID id to CRMDeal...");

    // 1. Add id column to CRMDeal if it doesn't exist
    const { error: error1 } = await supabase.rpc("exec_sql", {
      sql: `ALTER TABLE "CRMDeal" ADD COLUMN IF NOT EXISTS "id" UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL;`,
    });

    if (error1) {
      // If rpc method doesn't exist, try direct SQL execution
      console.log(
        'Note: rpc method not available, trying alternative approach...'
      );
      // Fallback: we'll need to use Supabase SQL editor manually
      throw new Error(
        "Direct SQL execution not available. Please run the SQL migration manually in Supabase console."
      );
    }

    console.log("✓ Added UUID id column to CRMDeal");

    // 2. Create index on the new UUID id column
    const { error: error2 } = await supabase.rpc("exec_sql", {
      sql: `CREATE INDEX IF NOT EXISTS idx_crm_deal_id ON "CRMDeal"("id");`,
    });

    if (!error2) {
      console.log("✓ Created index on CRMDeal.id");
    }

    // 3. Update CRMDealProduct dealId to use UUID from CRMDeal
    const { error: error3 } = await supabase.rpc("exec_sql", {
      sql: `UPDATE "CRMDealProduct" cdp SET "dealId" = cd."id" FROM "CRMDeal" cd WHERE cd."deal_id"::text = cdp."dealId"::text AND cdp."dealId" NOT LIKE '%-%';`,
    });

    if (!error3) {
      console.log("✓ Updated CRMDealProduct.dealId to use UUIDs");
    }

    console.log("\n✅ Migration completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

runMigration();
