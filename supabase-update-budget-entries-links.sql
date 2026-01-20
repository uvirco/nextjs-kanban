-- Migration: Update budget_entries to support linking to project OR department
-- Date: 2025-01-XX

-- Make epic_id nullable and add department_id column
ALTER TABLE budget_entries
ALTER COLUMN epic_id DROP NOT NULL;

ALTER TABLE budget_entries
ADD COLUMN department_id text;

-- Add foreign key constraint to Department table
ALTER TABLE budget_entries
ADD CONSTRAINT fk_budget_entries_department
FOREIGN KEY (department_id) REFERENCES "Department"(id)
ON DELETE CASCADE;

-- Add check constraint to ensure either epic_id or department_id is set (but not both)
ALTER TABLE budget_entries
ADD CONSTRAINT check_budget_entry_link
CHECK (
  (epic_id IS NOT NULL AND department_id IS NULL) OR
  (epic_id IS NULL AND department_id IS NOT NULL)
);

-- Add frequency column to track if cost is one-time, monthly, etc.
ALTER TABLE budget_entries
ADD COLUMN frequency text NOT NULL DEFAULT 'One-time';

-- Add check constraint for valid frequency values
ALTER TABLE budget_entries
ADD CONSTRAINT check_budget_entry_frequency
CHECK (frequency IN ('One-time', 'Weekly', 'Monthly', 'Quarterly', 'Yearly'));

-- Add fiscal year column (format: 2024/2025 starting April 1)
ALTER TABLE budget_entries
ADD COLUMN fiscal_year text NOT NULL DEFAULT '2025/2026';

-- Add purchase month column (nullable, format: YYYY-MM, only for actual expenses)
ALTER TABLE budget_entries
ADD COLUMN purchase_date text;

COMMENT ON COLUMN budget_entries.department_id IS 'Foreign key to Department table - mutually exclusive with epic_id';
COMMENT ON COLUMN budget_entries.frequency IS 'Frequency of the budget/expense: One-time, Weekly, Monthly, Quarterly, or Yearly';
COMMENT ON COLUMN budget_entries.fiscal_year IS 'Fiscal year for this budget/expense (format: 2024/2025, starting April 1)';
COMMENT ON COLUMN budget_entries.purchase_date IS 'Purchase month for expenses (format: YYYY-MM, null for planned budgets)';
COMMENT ON CONSTRAINT check_budget_entry_link ON budget_entries IS 'Ensures budget entry is linked to either a project OR a department, not both';
COMMENT ON CONSTRAINT check_budget_entry_frequency ON budget_entries IS 'Ensures frequency is one of the valid values';
