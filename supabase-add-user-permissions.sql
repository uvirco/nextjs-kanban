-- Add permissions column to users table for module-specific roles
-- Using JSONB to store roles per module: {"projects": "ADMIN", "crm": "MEMBER"}
ALTER TABLE "User" 
ADD COLUMN IF NOT EXISTS module_permissions JSONB DEFAULT '{"projects": "MEMBER", "crm": "MEMBER"}'::jsonb;

-- Set all existing users to have MEMBER access to both modules (backward compatibility)
UPDATE "User" 
SET module_permissions = '{"projects": "MEMBER", "crm": "MEMBER"}'::jsonb
WHERE module_permissions IS NULL;

-- Optional: Add comment for documentation
COMMENT ON COLUMN "User".module_permissions IS 'Module-specific roles: {"projects": "ADMIN|MEMBER", "crm": "ADMIN|MEMBER"}';
