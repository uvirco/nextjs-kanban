-- Add type column to MeetingNote table to distinguish quick notes from meeting notes
-- This column allows us to differentiate between regular meeting notes and quick notes
-- while maintaining backward compatibility with existing meeting notes

-- First check if the column already exists (for safety)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'MeetingNote'
    AND column_name = 'type'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE "MeetingNote" ADD COLUMN "type" text DEFAULT 'meeting' CHECK (type IN ('meeting', 'quick'));
  END IF;
END $$;