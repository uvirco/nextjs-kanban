-- Create Goals table for tracking epic/task objectives
-- Run this against your Supabase/Postgres database.

CREATE TABLE IF NOT EXISTS public."Goal" (
  "id" text PRIMARY KEY DEFAULT (gen_random_uuid())::text,
  "taskId" text NOT NULL REFERENCES public."Task"("id") ON DELETE CASCADE,
  "title" text NOT NULL,
  "description" text,
  "achieved" boolean DEFAULT false,
  "achievedAt" timestamptz,
  "achievedByUserId" text REFERENCES public."User"("id") ON DELETE SET NULL,
  "order" integer DEFAULT 0,
  "createdAt" timestamptz DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_goal_taskId ON public."Goal"("taskId");
CREATE INDEX IF NOT EXISTS idx_goal_achieved ON public."Goal"("achieved");

COMMIT;
