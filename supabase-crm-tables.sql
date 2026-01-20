-- Supabase CRM Tables Migration
-- Created: 2026-01-15
-- Description: Consolidated SQL for all CRM tables (excluding CRMLeads)
-- Note: CRMDeal uses sequential deal_id instead of UUID

-- Enable UUID extension (for other tables)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enums for CRM
CREATE TYPE IF NOT EXISTS "CRMDealStage" AS ENUM ('PROSPECTING', 'QUALIFICATION', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST');
CREATE TYPE IF NOT EXISTS "CRMActivityType" AS ENUM ('CALL', 'EMAIL', 'MEETING', 'NOTE');
CREATE TYPE IF NOT EXISTS "CRMEmailDirection" AS ENUM ('INBOUND', 'OUTBOUND');

-- Create sequences
CREATE SEQUENCE IF NOT EXISTS crm_deal_seq START 1;

-- CRMContact table
CREATE TABLE IF NOT EXISTS "CRMContact" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "name" TEXT NOT NULL,
  "email" TEXT,
  "phone" TEXT,
  "company" TEXT,
  "organizationId" TEXT REFERENCES "CRMOrganization"("id"),
  "position" TEXT,
  "address" TEXT,
  "notes" TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "createdByUserId" TEXT REFERENCES "User"("id")
);

-- CRMDeal table (with sequential deal_id)
CREATE TABLE IF NOT EXISTS "CRMDeal" (
  "deal_id" INTEGER PRIMARY KEY DEFAULT nextval('crm_deal_seq'),
  "title" TEXT NOT NULL,
  "contactId" TEXT REFERENCES "CRMContact"("id"),
  "leadId" TEXT, -- References CRMLead if needed, but since excluded, maybe remove or keep for future
  "value" REAL,
  "stage" "CRMDealStage" NOT NULL,
  "expectedCloseDate" TIMESTAMP WITH TIME ZONE,
  "notes" TEXT,
  "columnId" TEXT, -- References CRMColumn if applicable
  "order" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "createdByUserId" TEXT REFERENCES "User"("id"),
  "assignedUserId" TEXT REFERENCES "User"("id")
);

-- CRMActivity table
CREATE TABLE IF NOT EXISTS "CRMActivity" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "type" "CRMActivityType" NOT NULL,
  "content" TEXT,
  "contactId" TEXT REFERENCES "CRMContact"("id"),
  "leadId" TEXT, -- Excluded, but keep for reference
  "dealId" INTEGER REFERENCES "CRMDeal"("deal_id"),
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "createdByUserId" TEXT REFERENCES "User"("id")
);

-- CRMEmail table
CREATE TABLE IF NOT EXISTS "CRMEmail" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT REFERENCES "User"("id"),
  "dealId" INTEGER REFERENCES "CRMDeal"("deal_id"),
  "leadId" TEXT, -- Excluded
  "contactId" TEXT REFERENCES "CRMContact"("id"),
  "subject" TEXT,
  "body" TEXT,
  "fromEmail" TEXT,
  "toEmail" TEXT,
  "ccEmails" TEXT[], -- Array of strings
  "sentAt" TIMESTAMP WITH TIME ZONE,
  "receivedAt" TIMESTAMP WITH TIME ZONE,
  "direction" "CRMEmailDirection" NOT NULL,
  "emailProviderId" TEXT,
  "threadId" TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CRMEmailAttachment table
CREATE TABLE IF NOT EXISTS "CRMEmailAttachment" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "emailId" TEXT NOT NULL REFERENCES "CRMEmail"("id") ON DELETE CASCADE,
  "filename" TEXT NOT NULL,
  "fileUrl" TEXT NOT NULL,
  "fileSize" INTEGER,
  "mimeType" TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CRMColumn table (for board-like structure)
CREATE TABLE IF NOT EXISTS "CRMColumn" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "title" TEXT NOT NULL,
  "boardId" TEXT NOT NULL, -- Could be a CRM board type
  "order" INTEGER NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS "CRMContact_email_idx" ON "CRMContact"("email");
CREATE INDEX IF NOT EXISTS "CRMDeal_contactId_idx" ON "CRMDeal"("contactId");
CREATE INDEX IF NOT EXISTS "CRMDeal_stage_idx" ON "CRMDeal"("stage");
CREATE INDEX IF NOT EXISTS "CRMActivity_contactId_idx" ON "CRMActivity"("contactId");
CREATE INDEX IF NOT EXISTS "CRMActivity_dealId_idx" ON "CRMActivity"("dealId");
CREATE INDEX IF NOT EXISTS "CRMEmail_dealId_idx" ON "CRMEmail"("dealId");
CREATE INDEX IF NOT EXISTS "CRMEmail_contactId_idx" ON "CRMEmail"("contactId");
CREATE INDEX IF NOT EXISTS "CRMEmail_receivedAt_idx" ON "CRMEmail"("receivedAt");
CREATE INDEX IF NOT EXISTS "CRMEmailAttachment_emailId_idx" ON "CRMEmailAttachment"("emailId");
CREATE INDEX IF NOT EXISTS "CRMColumn_boardId_idx" ON "CRMColumn"("boardId");

-- Comments
COMMENT ON TABLE "CRMContact" IS 'CRM contacts database';
COMMENT ON TABLE "CRMDeal" IS 'CRM deals with sequential deal_id';
COMMENT ON TABLE "CRMActivity" IS 'CRM activities log';
COMMENT ON TABLE "CRMEmail" IS 'CRM emails storage';
COMMENT ON TABLE "CRMEmailAttachment" IS 'CRM email attachments';
COMMENT ON TABLE "CRMColumn" IS 'CRM board columns';

