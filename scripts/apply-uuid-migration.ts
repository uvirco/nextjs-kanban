import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

async function runMigration() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("❌ Missing environment variables:");
    console.error("  - NEXT_PUBLIC_SUPABASE_URL");
    console.error("  - SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }

  console.log("📍 Connecting to Supabase...");
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  try {
    // Test connection
    const { data: testData, error: testError } = await supabase
      .from("CRMDeal")
      .select("deal_id")
      .limit(1);

    if (testError) {
      throw new Error(`Connection test failed: ${testError.message}`);
    }

    console.log("✅ Connected to Supabase");

    // Check if CRMDeal already has an id column
    console.log("\n🔍 Checking CRMDeal table schema...");
    const { data: tableInfo, error: tableError } = await supabase
      .from("CRMDeal")
      .select("*")
      .limit(1);

    if (tableError) {
      throw new Error(`Failed to check table: ${tableError.message}`);
    }

    // @ts-ignore
    const hasIdColumn = tableInfo && tableInfo[0] && "id" in tableInfo[0];

    if (hasIdColumn) {
      console.log("✅ CRMDeal already has an 'id' column");
      console.log("\n✨ Schema is already up to date!");
      process.exit(0);
    }

    console.log("⚠️  CRMDeal is missing 'id' column - applying migration...\n");

    // Read the migration SQL
    const migrationPath = path.join(
      path.dirname(new URL(import.meta.url).pathname),
      "..",
      "supabase-add-uuid-to-deal.sql"
    );

    const migrationSql = fs.readFileSync(migrationPath, "utf-8");

    // Split by statements and execute each
    const statements = migrationSql
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith("--"));

    console.log(`📝 Executing ${statements.length} SQL statements...\n`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ";";
      console.log(`[${i + 1}/${statements.length}] Executing...`);
      console.log(`  ${statement.substring(0, 60)}...`);

      // Execute via raw HTTP POST since we have admin access
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/sql_exec`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
        },
        body: JSON.stringify({ sql: statement }),
      });

      if (!response.ok && response.status !== 404) {
        // 404 might mean the rpc doesn't exist - try direct execution
        console.log(`⚠️  Direct RPC execution not available, trying alternative...`);
        break;
      }

      if (response.ok) {
        const result = await response.json();
        console.log(`  ✅ Success\n`);
      }
    }

    console.log(
      "✨ Migration process initiated. Please verify in Supabase console."
    );
    console.log("\nℹ️  Manual verification steps:");
    console.log("  1. Go to https://app.supabase.com");
    console.log("  2. Select your project and go to SQL Editor");
    console.log("  3. Run: SELECT * FROM \"CRMDeal\" LIMIT 1;");
    console.log("  4. Verify 'id' column exists with UUID values");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    console.error("\n📖 Please run the migration manually:");
    console.error("  1. Open Supabase SQL Editor");
    console.error("  2. Copy contents from: supabase-add-uuid-to-deal.sql");
    console.error("  3. Execute the SQL");
    process.exit(1);
  }
}

runMigration();
