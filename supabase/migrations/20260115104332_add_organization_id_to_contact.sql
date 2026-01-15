-- Add organizationId column to CRMContact
ALTER TABLE "CRMContact" ADD COLUMN IF NOT EXISTS "organizationId" TEXT REFERENCES "CRMOrganization"("id");