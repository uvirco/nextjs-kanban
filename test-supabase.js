const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  "https://npyxbogffbojqqujnurv.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5weXhib2dmZmJvanFxdWpudXJ2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzAyMjc0NywiZXhwItoyMDc4NTk4NzQ3fQ.vjn32g3jXh9T7ZfeAL93Uc7CRCRMERXbgpKAk7VcTtw"
);

async function testConnection() {
  console.log("Testing Supabase connection...");

  try {
    // Try a simple query to test connection
    const { data, error } = await supabase
      .from("User")
      .select("id")
      .limit(1);

    if (error) {
      console.log("Connection error:", error.message);
    } else {
      console.log("✓ Connection successful! Found", data.length, "users");
    }
  } catch (e) {
    console.log("Connection failed:", e.message);
  }
}

testConnection();