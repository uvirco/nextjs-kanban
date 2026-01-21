-- Add permissions column to users table for selective access control
-- Using text array to store permissions like ['projects', 'crm']
ALTER TABLE "User" 
ADD COLUMN IF NOT EXISTS permissions TEXT[] DEFAULT ARRAY['projects', 'crm'];

-- Set all existing users to have full access (backward compatibility)
UPDATE "User" 
SET permissions = ARRAY['projects', 'crm']
WHERE permissions IS NULL;

-- Optional: Add comment for documentation
COMMENT ON COLUMN "User".permissions IS 'Array of permission strings: projects, crm, etc.';
