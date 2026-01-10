-- Add CRM tables for contacts, leads, deals, and activities
-- Run this against your Supabase/Postgres database.

-- CRM Contacts table
CREATE TABLE IF NOT EXISTS public."CRMContact" (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  email text,
  phone text,
  company text,
  position text,
  address text,
  notes text,
  createdAt timestamp with time zone DEFAULT now() NOT NULL,
  updatedAt timestamp with time zone DEFAULT now() NOT NULL,
  createdByUserId uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

-- CRM Leads table (with board-like structure)
CREATE TABLE IF NOT EXISTS public."CRMLead" (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  contactId uuid REFERENCES public."CRMContact"(id) ON DELETE SET NULL,
  status text DEFAULT 'New',
  source text,
  value numeric,
  notes text,
  columnId uuid NOT NULL, -- For board columns
  order integer DEFAULT 0,
  createdAt timestamp with time zone DEFAULT now() NOT NULL,
  updatedAt timestamp with time zone DEFAULT now() NOT NULL,
  createdByUserId uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  assignedUserId uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

-- CRM Deals table (with board-like structure)
CREATE TABLE IF NOT EXISTS public."CRMDeal" (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  contactId uuid REFERENCES public."CRMContact"(id) ON DELETE SET NULL,
  leadId uuid REFERENCES public."CRMLead"(id) ON DELETE SET NULL,
  value numeric,
  stage text DEFAULT 'Prospecting',
  expectedCloseDate date,
  notes text,
  columnId uuid NOT NULL, -- For board columns
  order integer DEFAULT 0,
  createdAt timestamp with time zone DEFAULT now() NOT NULL,
  updatedAt timestamp with time zone DEFAULT now() NOT NULL,
  createdByUserId uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  assignedUserId uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

-- CRM Activities table
CREATE TABLE IF NOT EXISTS public."CRMActivity" (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  type text NOT NULL, -- e.g., 'CALL', 'EMAIL', 'MEETING'
  content text,
  contactId uuid REFERENCES public."CRMContact"(id) ON DELETE CASCADE,
  leadId uuid REFERENCES public."CRMLead"(id) ON DELETE CASCADE,
  dealId uuid REFERENCES public."CRMDeal"(id) ON DELETE CASCADE,
  createdAt timestamp with time zone DEFAULT now() NOT NULL,
  createdByUserId uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

-- CRM Emails table (for email integration)
CREATE TABLE IF NOT EXISTS public."CRMEmail" (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  userId uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  dealId uuid REFERENCES public."CRMDeal"(id) ON DELETE SET NULL,
  leadId uuid REFERENCES public."CRMLead"(id) ON DELETE SET NULL,
  contactId uuid REFERENCES public."CRMContact"(id) ON DELETE SET NULL,
  subject text,
  body text,
  fromEmail text,
  toEmail text,
  ccEmails text[],
  sentAt timestamp with time zone,
  receivedAt timestamp with time zone,
  direction text, -- 'INBOUND' or 'OUTBOUND'
  emailProviderId text, -- for syncing with Gmail/Outlook
  threadId text, -- to group email conversations
  createdAt timestamp with time zone DEFAULT now() NOT NULL
);

-- CRM Email Attachments table
CREATE TABLE IF NOT EXISTS public."CRMEmailAttachment" (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  emailId uuid REFERENCES public."CRMEmail"(id) ON DELETE CASCADE,
  filename text NOT NULL,
  fileUrl text NOT NULL,
  fileSize integer,
  mimeType text,
  createdAt timestamp with time zone DEFAULT now() NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_crmcontact_email ON public."CRMContact"(email);
CREATE INDEX IF NOT EXISTS idx_crmlead_contactid ON public."CRMLead"(contactId);
CREATE INDEX IF NOT EXISTS idx_crmlead_columnid ON public."CRMLead"(columnId);
CREATE INDEX IF NOT EXISTS idx_crmdeal_contactid ON public."CRMDeal"(contactId);
CREATE INDEX IF NOT EXISTS idx_crmdeal_leadid ON public."CRMDeal"(leadId);
CREATE INDEX IF NOT EXISTS idx_crmdeal_columnid ON public."CRMDeal"(columnId);
CREATE INDEX IF NOT EXISTS idx_crmactivity_contactid ON public."CRMActivity"(contactId);
CREATE INDEX IF NOT EXISTS idx_crmactivity_leadid ON public."CRMActivity"(leadId);
CREATE INDEX IF NOT EXISTS idx_crmactivity_dealid ON public."CRMActivity"(dealId);
CREATE INDEX IF NOT EXISTS idx_crmemail_dealid ON public."CRMEmail"(dealId);
CREATE INDEX IF NOT EXISTS idx_crmemail_leadid ON public."CRMEmail"(leadId);
CREATE INDEX IF NOT EXISTS idx_crmemail_contactid ON public."CRMEmail"(contactId);
CREATE INDEX IF NOT EXISTS idx_crmemail_threadid ON public."CRMEmail"(threadId);
CREATE INDEX IF NOT EXISTS idx_crmemailattachment_emailid ON public."CRMEmailAttachment"(emailId);

COMMIT;