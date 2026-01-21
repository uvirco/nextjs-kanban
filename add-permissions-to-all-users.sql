-- First, add the module_permissions column if it doesn't exist
ALTER TABLE "User" 
ADD COLUMN IF NOT EXISTS module_permissions JSONB DEFAULT '{"projects": "MEMBER", "crm": "MEMBER"}'::jsonb;

-- Update all existing users to have MEMBER role in both modules
UPDATE "User" 
SET module_permissions = '{"projects": "MEMBER", "crm": "MEMBER"}'::jsonb;

-- Verify the update
SELECT id, name, email, role, module_permissions FROM "User";

-- Example: To give a user ADMIN role in Projects but MEMBER in CRM:
-- UPDATE "User" SET module_permissions = '{"projects": "ADMIN", "crm": "MEMBER"}'::jsonb WHERE email = 'user@example.com';

-- Example: To remove access to a module, omit it from the JSON:
-- UPDATE "User" SET module_permissions = '{"projects": "MEMBER"}'::jsonb WHERE email = 'user@example.com';
-- (This user would have Projects access but NOT CRM access)
