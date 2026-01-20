-- Create a separate table for deal notes with full history
-- This allows multiple notes per deal with proper attribution and history

CREATE TABLE IF NOT EXISTS "CRMNote" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "content" TEXT NOT NULL,
  "dealId" INTEGER REFERENCES "CRMDeal"("deal_id") ON DELETE CASCADE,
  "contactId" TEXT REFERENCES "CRMContact"("id") ON DELETE SET NULL,
  "leadId" UUID REFERENCES "CRMLead"("id") ON DELETE SET NULL,
  "createdByUserId" TEXT REFERENCES "User"("id"),
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "isPinned" BOOLEAN DEFAULT false
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS "CRMNote_dealId_idx" ON "CRMNote"("dealId");
CREATE INDEX IF NOT EXISTS "CRMNote_contactId_idx" ON "CRMNote"("contactId");
CREATE INDEX IF NOT EXISTS "CRMNote_leadId_idx" ON "CRMNote"("leadId");
CREATE INDEX IF NOT EXISTS "CRMNote_createdByUserId_idx" ON "CRMNote"("createdByUserId");
CREATE INDEX IF NOT EXISTS "CRMNote_createdAt_idx" ON "CRMNote"("createdAt" DESC);

-- Comments
COMMENT ON TABLE "CRMNote" IS 'Notes/comments for deals, contacts, and leads';
COMMENT ON COLUMN "CRMNote"."content" IS 'Rich text content (HTML from WYSIWYG editor)';
COMMENT ON COLUMN "CRMNote"."isPinned" IS 'Pinned notes show at the top';

-- Migrate existing notes from CRMDeal table (if any exist)
INSERT INTO "CRMNote" ("content", "dealId", "createdAt")
SELECT "notes", "deal_id", NOW()
FROM "CRMDeal"
WHERE "notes" IS NOT NULL AND "notes" != '';

-- Optional: Remove old notes column from CRMDeal after migration
-- Uncomment the line below after verifying the migration worked
-- ALTER TABLE "CRMDeal" DROP COLUMN IF EXISTS "notes";
