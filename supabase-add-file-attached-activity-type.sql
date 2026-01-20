-- Add FILE_ATTACHED to CRMActivityType enum
-- This allows tracking file attachments in the activity timeline

ALTER TYPE "CRMActivityType" ADD VALUE IF NOT EXISTS 'FILE_ATTACHED';

-- The CRMActivity table already exists and will now support FILE_ATTACHED activities
-- When a file is uploaded to a deal/contact/lead, a FILE_ATTACHED activity will be created

-- Example activity content format:
-- "Attached file: document.pdf (234 KB)"
