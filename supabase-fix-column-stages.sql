-- Fix column stages that are using titles instead of proper slugs
-- This fixes columns where stage = title (e.g., "Deal was WON" instead of "won")

-- Step 1: Temporarily change CRMDeal.stage from enum to TEXT to allow updates
ALTER TABLE "CRMDeal" 
ALTER COLUMN "stage" TYPE TEXT;

-- Step 2: Update columns to use proper stage slugs
UPDATE "CRMColumn"
SET "stage" = 'won'
WHERE "stage" = 'Deal was WON' OR "stage" ILIKE '%won%';

UPDATE "CRMColumn"
SET "stage" = 'lost'
WHERE "stage" = 'Deal was LOST' OR "stage" ILIKE '%lost%';

UPDATE "CRMColumn" SET "stage" = 'prospecting' WHERE "stage" ILIKE 'Prospecting%';
UPDATE "CRMColumn" SET "stage" = 'qualification' WHERE "stage" ILIKE 'Qualification%' OR "stage" ILIKE 'Qualified%';
UPDATE "CRMColumn" SET "stage" = 'proposal' WHERE "stage" ILIKE 'Proposal%';
UPDATE "CRMColumn" SET "stage" = 'negotiation' WHERE "stage" ILIKE 'Negotiation%';
UPDATE "CRMColumn" SET "stage" = 'closed_won' WHERE "stage" ILIKE 'Closed Won%';
UPDATE "CRMColumn" SET "stage" = 'closed_lost' WHERE "stage" ILIKE 'Closed Lost%';

-- Step 3: Update deals to match the new stage slugs
UPDATE "CRMDeal" SET "stage" = 'won' WHERE "stage" = 'Deal was WON' OR "stage" ILIKE '%won%';
UPDATE "CRMDeal" SET "stage" = 'lost' WHERE "stage" = 'Deal was LOST' OR "stage" ILIKE '%lost%';
UPDATE "CRMDeal" SET "stage" = 'prospecting' WHERE "stage" ILIKE 'Prospecting%';
UPDATE "CRMDeal" SET "stage" = 'qualification' WHERE "stage" ILIKE 'Qualification%' OR "stage" ILIKE 'Qualified%';
UPDATE "CRMDeal" SET "stage" = 'proposal' WHERE "stage" ILIKE 'Proposal%';
UPDATE "CRMDeal" SET "stage" = 'negotiation' WHERE "stage" ILIKE 'Negotiation%';
UPDATE "CRMDeal" SET "stage" = 'closed_won' WHERE "stage" ILIKE 'Closed Won%';
UPDATE "CRMDeal" SET "stage" = 'closed_lost' WHERE "stage" ILIKE 'Closed Lost%';

-- Step 4: Change CRMDeal.stage back to enum type (if it was originally an enum)
-- Note: Comment this out if stage should remain TEXT
-- ALTER TABLE "CRMDeal" 
-- ALTER COLUMN "stage" TYPE "CRMDealStage" USING "stage"::"CRMDealStage";

-- Show what we have now
SELECT "id", "title", "stage", "boardId" FROM "CRMColumn" ORDER BY "order";
