const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  "https://npyxbogffbojqqujnurv.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5weXhib2dmZmJvanFxdWpudXJ2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzAyMjc0NywiZXhwIjoyMDc4NTk4NzQ3fQ.vjn32g3jXh9T7ZfeAL93Uc7CRCRMERXbgpKAk7VcTtw"
);

const fs = require("fs");

async function runMigration() {
  console.log("Running RACI and Stakeholder migration...\n");

  const sql = fs.readFileSync("supabase-add-raci-stakeholder.sql", "utf8");

  // Split by statement and execute
  const statements = sql
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s && !s.startsWith("--") && s !== "");

  for (const statement of statements) {
    try {
      const { error } = await supabase.rpc("exec_sql", {
        sql_query: statement + ";",
      });
      if (error && !error.message.includes("does not exist")) {
        console.log("Statement:", statement.substring(0, 80) + "...");
        console.log("Error:", error.message);
      } else {
        console.log("✓ Executed:", statement.substring(0, 60) + "...");
      }
    } catch (e) {
      console.log("Error executing:", statement.substring(0, 80));
      console.log(e.message);
    }
  }

  console.log("\nMigration complete!");
  process.exit(0);
}

runMigration();
