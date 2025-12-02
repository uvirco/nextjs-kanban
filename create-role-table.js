const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  "https://npyxbogffbojqqujnurv.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5weXhib2dmZmJvanFxdWpudXJ2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzAyMjc0NywiZXhwIjoyMDc4NTk4NzQ3fQ.vjn32g3jXh9T7ZfeAL93Uc7CRCRMERXbgpKAk7VcTtw"
);

async function createRoleTable() {
  console.log("Creating Role table...");

  try {
    // First, try to insert roles directly - this will create the table if it doesn't exist
    const roles = [
      { name: 'Product Manager', description: 'Manages product strategy and roadmap', category: 'management', isActive: true, sortOrder: 1 },
      { name: 'Project Manager', description: 'Manages project execution and delivery', category: 'management', isActive: true, sortOrder: 2 },
      { name: 'Lead Developer', description: 'Senior developer leading technical implementation', category: 'technical', isActive: true, sortOrder: 3 },
      { name: 'Developer', description: 'Software developer implementing features', category: 'technical', isActive: true, sortOrder: 4 },
      { name: 'Designer', description: 'UI/UX designer creating user interfaces', category: 'design', isActive: true, sortOrder: 5 },
      { name: 'UX Designer', description: 'User experience designer focusing on usability', category: 'design', isActive: true, sortOrder: 6 },
      { name: 'QA Engineer', description: 'Quality assurance engineer testing software', category: 'technical', isActive: true, sortOrder: 7 },
      { name: 'DevOps Engineer', description: 'Manages deployment and infrastructure', category: 'technical', isActive: true, sortOrder: 8 },
      { name: 'Business Analyst', description: 'Analyzes business requirements and processes', category: 'business', isActive: true, sortOrder: 9 },
      { name: 'Technical Writer', description: 'Creates technical documentation', category: 'technical', isActive: true, sortOrder: 10 },
      { name: 'Scrum Master', description: 'Facilitates agile development processes', category: 'management', isActive: true, sortOrder: 11 },
      { name: 'Other', description: 'Other role not listed above', category: 'other', isActive: true, sortOrder: 99 }
    ];

    for (const role of roles) {
      const { error: insertError } = await supabase
        .from('Role')
        .upsert(role, { onConflict: 'name' });

      if (insertError) {
        console.error(`Error inserting role ${role.name}:`, insertError);
      } else {
        console.log(`Inserted role: ${role.name}`);
      }
    }

    console.log("Role table creation completed!");

  } catch (error) {
    console.error("Unexpected error:", error);
  }
}

createRoleTable();