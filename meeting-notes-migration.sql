-- Add Meeting Notes table for epics (improved schema)
-- Enable pgcrypto extension for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create enum for meeting types
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'meeting_type') THEN
    CREATE TYPE meeting_type AS ENUM ('planning', 'review', 'retrospective', 'stakeholder', 'demo', 'standup', 'other');
  END IF;
END$$;

-- Create MeetingNote table with improved schema
CREATE TABLE IF NOT EXISTS "MeetingNote" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  meeting_type meeting_type NOT NULL DEFAULT 'other',
  meeting_date timestamptz NOT NULL,
  attendees_text text[],           -- Free-text attendee names (original intent)
  attendees uuid[],                -- Optional: array of user IDs for relational links
  agenda text,
  notes text,
  decisions text,
  epic_id text NOT NULL,           -- References Task.id (keep as TEXT for compatibility)
  created_by text NOT NULL,        -- References User.id (keep as TEXT for compatibility)
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create separate table for action items (better relational design)
CREATE TABLE IF NOT EXISTS meeting_action_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_note_id uuid NOT NULL,    -- Foreign key to MeetingNote
  description text NOT NULL,
  assignee_text text,               -- Free-text assignee name
  assignee_id text,                 -- Optional: user ID reference
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  due_date timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Add foreign key constraints
ALTER TABLE "MeetingNote"
  ADD CONSTRAINT "MeetingNote_epic_id_fkey" FOREIGN KEY (epic_id) REFERENCES "Task"(id) ON DELETE CASCADE;

ALTER TABLE "MeetingNote"
  ADD CONSTRAINT "MeetingNote_created_by_fkey" FOREIGN KEY (created_by) REFERENCES "User"(id) ON DELETE SET NULL;

-- Foreign key for action items
ALTER TABLE meeting_action_items
  ADD CONSTRAINT meeting_action_items_meeting_note_id_fkey FOREIGN KEY (meeting_note_id) REFERENCES "MeetingNote"(id) ON DELETE CASCADE;

ALTER TABLE meeting_action_items
  ADD CONSTRAINT meeting_action_items_assignee_id_fkey FOREIGN KEY (assignee_id) REFERENCES "User"(id) ON DELETE SET NULL;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "MeetingNote_epic_date_idx" ON "MeetingNote" (epic_id, meeting_date);
CREATE INDEX IF NOT EXISTS "MeetingNote_created_by_idx" ON "MeetingNote" (created_by);
CREATE INDEX IF NOT EXISTS "MeetingNote_meeting_date_idx" ON "MeetingNote" (meeting_date);

-- Indexes for action items
CREATE INDEX IF NOT EXISTS idx_meeting_action_items_meeting_note_id ON meeting_action_items (meeting_note_id);
CREATE INDEX IF NOT EXISTS idx_meeting_action_items_assignee_id ON meeting_action_items (assignee_id);
CREATE INDEX IF NOT EXISTS idx_meeting_action_items_status ON meeting_action_items (status);
CREATE INDEX IF NOT EXISTS idx_meeting_action_items_due_date ON meeting_action_items (due_date);
