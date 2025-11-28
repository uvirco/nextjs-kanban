const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://npyxbogffbojqqujnurv.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5weXhib2dmZmJvanFxdWpudXJ2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzAyMjc0NywiZXhwIjoyMDc4NTk4NzQ3fQ.vjn32g3jXh9T7ZfeAL93Uc7CRCRMERXbgpKAk7VcTtw'
);

(async () => {
  console.log('\n=== Testing Board Access ===\n');
  
  // Test 1: Check all board members
  const { data: members, error: membersError } = await supabase
    .from('BoardMember')
    .select('userId, boardId, role');
  
  console.log('Board Members:', members?.length);
  members?.forEach(m => {
    console.log(`  ${m.userId} -> ${m.boardId} (${m.role})`);
  });
  
  // Test 2: Check if admin-user-id is a member of sample-board-1
  const { data: adminMember, error: adminError } = await supabase
    .from('BoardMember')
    .select('role')
    .eq('boardId', 'sample-board-1')
    .eq('userId', 'admin-user-id')
    .single();
  
  console.log('\nAdmin member check:', { adminMember, adminError });
  
  // Test 3: Check columns for sample-board-1
  const { data: columns, error: columnsError } = await supabase
    .from('Column')
    .select('*')
    .eq('boardId', 'sample-board-1');
  
  console.log('\nColumns for sample-board-1:', columns?.length);
  columns?.forEach(c => {
    console.log(`  ${c.title} (order: ${c.order})`);
  });
  
  process.exit(0);
})();
