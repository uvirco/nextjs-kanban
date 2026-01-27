-- Backfill activities for existing quick notes
-- This migration creates activity records for the 6 quick notes that were added before the ActivityType enum had the QUICK_NOTE_ADDED value

INSERT INTO "Activity" (id, type, content, "userId", "taskId", "createdAt")
SELECT 
  gen_random_uuid(),
  'QUICK_NOTE_ADDED'::ActivityType,
  COALESCE(mn.notes, ''),
  mn.created_by,
  mn.epic_id,
  mn.created_at
FROM "MeetingNote" mn
WHERE mn.epic_id = 'f05759e2-d0d2-4696-8028-e27192b264f2'
AND mn.type = 'quick'
ON CONFLICT DO NOTHING;
