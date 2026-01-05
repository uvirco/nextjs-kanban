-- Sample Meeting Notes Data
-- First, let's get some IDs we'll need:
-- Replace these with actual IDs from your database

-- Sample Meeting Notes
-- Note: Replace epic_id and created_by with actual UUIDs from your Task and User tables

-- Meeting Note 1: Sprint Planning
INSERT INTO "MeetingNote" (
  id,
  epic_id,
  title,
  meeting_type,
  meeting_date,
  attendees_text,
  agenda,
  notes,
  decisions,
  created_by,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'fc596f3a-4edd-481b-a8bc-bb81efab25a5', -- Replace with your epic ID
  'Sprint Planning - Q1 2025',
  'Planning',
  '2025-01-15 10:00:00',
  ARRAY['John Smith', 'Sarah Johnson', 'Mike Chen', 'Lisa Anderson'],
  'Review roadmap, define sprint goals, estimate story points, assign tasks',
  'Team reviewed the Q1 roadmap and agreed on priorities. Security features take precedence. Backend team will focus on API development while frontend works on UI components.',
  'Approved 23 story points for this sprint. Security audit scheduled for week 3. Daily standups at 9:30 AM.',
  (SELECT id FROM "User" LIMIT 1), -- Will use first user
  NOW(),
  NOW()
);

-- Meeting Note 2: Architecture Review
INSERT INTO "MeetingNote" (
  id,
  epic_id,
  title,
  meeting_type,
  meeting_date,
  attendees_text,
  agenda,
  notes,
  decisions,
  created_by,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'fc596f3a-4edd-481b-a8bc-bb81efab25a5', -- Replace with your epic ID
  'Technical Architecture Review',
  'Review',
  '2025-01-10 14:00:00',
  ARRAY['Mike Chen', 'David Park', 'Emily White'],
  'Database schema design, API architecture, scalability concerns',
  'Discussed microservices vs monolith architecture. Decided on modular monolith for MVP with clear service boundaries. PostgreSQL with Redis for caching.',
  'Use modular monolith pattern. Implement Redis caching. Set up CI/CD pipeline by end of week.',
  (SELECT id FROM "User" LIMIT 1),
  NOW(),
  NOW()
);

-- Meeting Note 3: Stakeholder Update
INSERT INTO "MeetingNote" (
  id,
  epic_id,
  title,
  meeting_type,
  meeting_date,
  attendees_text,
  agenda,
  notes,
  decisions,
  created_by,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'fc596f3a-4edd-481b-a8bc-bb81efab25a5', -- Replace with your epic ID
  'Q1 Stakeholder Update',
  'Status Update',
  '2025-01-08 11:00:00',
  ARRAY['Sarah Johnson', 'Robert Martinez', 'Jennifer Lee', 'Tom Wilson'],
  'Progress update, budget review, timeline confirmation, risk assessment',
  'Project is on track with 65% completion. Minor delays in testing phase due to resource constraints. Budget is within limits.',
  'Approved additional QA resource. Extended testing phase by 1 week. Next update in 2 weeks.',
  (SELECT id FROM "User" LIMIT 1),
  NOW(),
  NOW()
);

-- Action Items for Meeting Note 1
-- Get the meeting note ID first
INSERT INTO meeting_action_items (
  id,
  meeting_note_id,
  description,
  assignee_text,
  status,
  priority,
  due_date,
  created_at,
  updated_at
) VALUES 
(
  gen_random_uuid(),
  (SELECT id FROM "MeetingNote" WHERE title = 'Sprint Planning - Q1 2025' LIMIT 1),
  'Complete API endpoint for user authentication',
  'Mike Chen',
  'in_progress',
  'high',
  '2025-01-20',
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  (SELECT id FROM "MeetingNote" WHERE title = 'Sprint Planning - Q1 2025' LIMIT 1),
  'Design mockups for dashboard layout',
  'Sarah Johnson',
  'in_progress',
  'medium',
  '2025-01-18',
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  (SELECT id FROM "MeetingNote" WHERE title = 'Sprint Planning - Q1 2025' LIMIT 1),
  'Set up testing environment',
  'John Smith',
  'completed',
  'high',
  '2025-01-16',
  NOW(),
  NOW()
);

-- Action Items for Meeting Note 2
INSERT INTO meeting_action_items (
  id,
  meeting_note_id,
  description,
  assignee_text,
  status,
  priority,
  due_date,
  created_at,
  updated_at
) VALUES 
(
  gen_random_uuid(),
  (SELECT id FROM "MeetingNote" WHERE title = 'Technical Architecture Review' LIMIT 1),
  'Create database migration scripts',
  'David Park',
  'in_progress',
  'high',
  '2025-01-25',
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  (SELECT id FROM "MeetingNote" WHERE title = 'Technical Architecture Review' LIMIT 1),
  'Configure Redis cluster',
  'Mike Chen',
  'not_started',
  'medium',
  '2025-01-30',
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  (SELECT id FROM "MeetingNote" WHERE title = 'Technical Architecture Review' LIMIT 1),
  'Document API specifications',
  'Emily White',
  'in_progress',
  'high',
  '2025-01-22',
  NOW(),
  NOW()
);

-- Action Items for Meeting Note 3
INSERT INTO meeting_action_items (
  id,
  meeting_note_id,
  description,
  assignee_text,
  status,
  priority,
  due_date,
  created_at,
  updated_at
) VALUES 
(
  gen_random_uuid(),
  (SELECT id FROM "MeetingNote" WHERE title = 'Q1 Stakeholder Update' LIMIT 1),
  'Hire additional QA engineer',
  'Jennifer Lee',
  'in_progress',
  'critical',
  '2025-01-15',
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  (SELECT id FROM "MeetingNote" WHERE title = 'Q1 Stakeholder Update' LIMIT 1),
  'Update project timeline documentation',
  'Sarah Johnson',
  'completed',
  'medium',
  '2025-01-12',
  NOW(),
  NOW()
);
