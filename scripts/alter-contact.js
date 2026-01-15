const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: require('path').join(__dirname, '../.env.local') });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function alterTable() {
  const { data, error } = await supabase.rpc('exec_sql', {
    sql: `ALTER TABLE "CRMContact" ADD COLUMN IF NOT EXISTS "organizationId" TEXT REFERENCES "CRMOrganization"("id");`
  });

  if (error) {
    console.error('Error altering table:', error);
  } else {
    console.log('Column added successfully');
  }
}

alterTable();