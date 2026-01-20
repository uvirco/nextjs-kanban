-- Add notes field to CRMDeal table
ALTER TABLE "CRMDeal" 
ADD COLUMN IF NOT EXISTS "notes" TEXT;

COMMENT ON COLUMN "CRMDeal"."notes" IS 'Rich text notes/comments for the deal (HTML/Markdown)';
