-- Migration: Add createdAt and updatedAt timestamps to budget_entries table
-- Date: 2026-01-27

-- Add createdAt column with default timestamp
ALTER TABLE budget_entries
ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add updatedAt column with default timestamp
ALTER TABLE budget_entries
ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_budget_entries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to call the function on UPDATE
CREATE TRIGGER budget_entries_update_timestamp
BEFORE UPDATE ON budget_entries
FOR EACH ROW
EXECUTE FUNCTION update_budget_entries_updated_at();

-- Add comments for documentation
COMMENT ON COLUMN budget_entries.created_at IS 'Timestamp when the budget entry was created';
COMMENT ON COLUMN budget_entries.updated_at IS 'Timestamp when the budget entry was last updated';
