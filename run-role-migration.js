const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  "https://npyxbogffbojqqujnurv.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5weXhib2dmZmJvanFxdWpudXJ2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzAyMjc0NywiZXhwItoyMDc4NTk4NzQ3fQ.vjn32g3jXh9T7ZfeAL93Uc7CRCRMERXbgpKAk7VcTtw"
);

const fs = require("fs");

async function runMigration() {
  console.log("Running Role table migration...\n");

  try {
    const sql = fs.readFileSync("supabase-add-role-table.sql", "utf8");

    // Execute the entire SQL as one statement
    const { data, error } = await supabase.rpc("exec_sql", {
      sql_query: sql,
    });

    if (error) {
      console.log("Migration error:", error.message);
      console.log("Trying individual statements...\n");

      // Split by statement and execute individually if bulk fails
      const statements = sql
        .split(";")
        .map((s) => s.trim())
        .filter((s) => s && !s.startsWith("--") && s !== "");

      for (const statement of statements) {
        try {
          const { error: stmtError } = await supabase.rpc("exec_sql", {
            sql_query: statement + ";",
          });
          if (stmtError && !stmtError.message.includes("does not exist")) {
            console.log("Statement:", statement.substring(0, 80) + "...");
            console.log("Error:", stmtError.message);
          } else {
            console.log("✓ Executed:", statement.substring(0, 60) + "...");
          }
        } catch (e) {
          console.log("Error executing:", statement.substring(0, 80));
          console.log(e.message);
        }
      }
    } else {
      console.log("✓ Migration executed successfully!");
    }

  } catch (e) {
    console.log("Error reading or executing migration:", e.message);
  }

  console.log("\nRole table migration complete!");
  process.exit(0);
}

runMigration();