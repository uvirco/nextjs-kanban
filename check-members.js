const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://npyxbogffbojqqujnurv.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5weXhib2dmZmJvanFxdWpudXJ2Iiwicm9sZSI6InNlZiI6Im5weXhib2dmZmJvanFxdWpudXJ2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzAyMjc0NywiZXhwIjoyMDc4NTk4NzQ3fQ.vjn32g3jXh9T7ZfeAL93Uc7CRCRMERXbgpKAk7VcTtw');
(async () => {
  const { data: members, error } = await supabase.from('BoardMember').select('userId, boardId, role');
  console.log('All board members:');
  members?.forEach(m => console.log(`${m.userId} -> ${m.boardId} (${m.role})`));
})();