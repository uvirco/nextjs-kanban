-- Fix the created_by column to accept TEXT instead of UUID
-- First, drop the foreign key constraint
ALTER TABLE budget_entries 
DROP CONSTRAINT IF EXISTS budget_entries_created_by_fkey;

-- Then change the column type to TEXT
ALTER TABLE budget_entries 
ALTER COLUMN created_by TYPE TEXT;

-- Optionally recreate the foreign key if User.id is also TEXT
-- ALTER TABLE budget_entries
-- ADD CONSTRAINT budget_entries_created_by_fkey 
-- FOREIGN KEY (created_by) REFERENCES "User"(id) ON DELETE SET NULL;
