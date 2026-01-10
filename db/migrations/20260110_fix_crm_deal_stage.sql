-- Add stage field to CRMDeal table and make columnId nullable
-- This allows us to use custom stage identifiers without UUID constraints

ALTER TABLE public."CRMDeal" 
  ADD COLUMN IF NOT EXISTS "stage" TEXT;

-- Update existing records to use stage instead of columnId
UPDATE public."CRMDeal"
SET "stage" = "columnId"
WHERE "stage" IS NULL;

-- Make columnId nullable since we're using stage now
ALTER TABLE public."CRMDeal"
  ALTER COLUMN "columnId" DROP NOT NULL;

COMMIT;
