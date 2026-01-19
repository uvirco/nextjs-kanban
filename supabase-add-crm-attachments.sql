-- Extend existing Attachment table to support CRM entities
-- Reuse the polymorphic parent_type/parent_id pattern

-- Make taskId nullable (CRM attachments won't have taskId)
ALTER TABLE "Attachment" ALTER COLUMN "taskId" DROP NOT NULL;

-- Make url nullable (for pure file uploads where URL is generated from storage_path)
ALTER TABLE "Attachment" ALTER COLUMN "url" DROP NOT NULL;

-- Add check constraint for valid parent types
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'valid_parent_type'
  ) THEN
    ALTER TABLE "Attachment" 
    ADD CONSTRAINT "valid_parent_type" 
    CHECK (parent_type IN ('task', 'crm_deal', 'crm_contact', 'crm_lead', 'crm_email'));
  END IF;
END $$;

-- Add indexes for CRM lookups
CREATE INDEX IF NOT EXISTS "Attachment_parent_type_parent_id_idx" 
ON "Attachment"("parent_type", "parent_id");

-- Comments
COMMENT ON COLUMN "Attachment"."parent_type" IS 'Type of parent entity: task, crm_deal, crm_contact, crm_lead, crm_email';
COMMENT ON COLUMN "Attachment"."parent_id" IS 'ID of the parent entity (polymorphic reference)';

-- The Attachment table now supports:
-- - task: parent_type='task', parent_id=task.id
-- - crm_deal: parent_type='crm_deal', parent_id=CRMDeal.deal_id
-- - crm_contact: parent_type='crm_contact', parent_id=CRMContact.id
-- - crm_lead: parent_type='crm_lead', parent_id=CRMLead.id
-- - crm_email: parent_type='crm_email', parent_id=CRMEmail.id

-- Note: Existing 'attachments' storage bucket can be reused for CRM files
-- or create a new 'crm-attachments' bucket if separation is preferred

