const { createClient } = require("@supabase/supabase-js");
const bcrypt = require("bcryptjs");

const supabase = createClient(
  "https://npyxbogffbojqqujnurv.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5weXhib2dmZmJvanFxdWpudXJ2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzAyMjc0NywiZXhwIjoyMDc4NTk4NzQ3fQ.vjn32g3jXh9T7ZfeAL93Uc7CRCRMERXbgpKAk7VcTtw"
);

async function fixPassword() {
  console.log("Fixing admin password...");

  // Generate correct hash for admin123
  const correctHash = await bcrypt.hash("admin123", 12);
  console.log("New hash:", correctHash);

  // Update the admin user
  const { data, error } = await supabase
    .from("User")
    .update({ password: correctHash })
    .eq("email", "admin@company.com");

  console.log("Update result:", data);
  console.log("Update error:", error);

  // Verify the fix
  const { data: user } = await supabase
    .from("User")
    .select("password")
    .eq("email", "admin@company.com")
    .single();

  if (user) {
    const isValid = await bcrypt.compare("admin123", user.password);
    console.log("Password now valid:", isValid);
  }
}

fixPassword().catch(console.error);
