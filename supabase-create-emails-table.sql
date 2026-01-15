-- Create Emails table for storing incoming emails from CloudMailin
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS "emails" (
  "id" SERIAL PRIMARY KEY,
  "from_email" TEXT NOT NULL,
  "to_email" TEXT NOT NULL,
  "subject" TEXT,
  "body" TEXT,
  "received_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Optional: Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_emails_from_email ON "emails"("from_email");
CREATE INDEX IF NOT EXISTS idx_emails_received_at ON "emails"("received_at");