-- Create budget_entries table with all required columns and constraints
create table public.budget_entries (
  id uuid not null default gen_random_uuid (),
  epic_id text null,
  category text not null,
  description text null,
  amount numeric(10, 2) not null,
  currency text not null default 'USD'::text,
  entry_type text null default 'Expense'::text,
  date date not null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  department_id text null,
  frequency text not null default 'One-time'::text,
  fiscal_year text not null default '2025/2026'::text,
  purchase_date date null,
  constraint budget_entries_pkey primary key (id),
  constraint budget_entries_epic_id_fkey foreign KEY (epic_id) references "Task" (id) on delete CASCADE,
  constraint fk_budget_entries_department foreign KEY (department_id) references "Department" (id) on delete CASCADE,
  constraint budget_entries_entry_type_check check (
    (
      entry_type = any (array['Expense'::text, 'Budget'::text])
    )
  ),
  constraint check_budget_entry_frequency check (
    (
      frequency = any (
        array[
          'One-time'::text,
          'Weekly'::text,
          'Monthly'::text,
          'Quarterly'::text,
          'Yearly'::text
        ]
      )
    )
  ),
  constraint check_budget_entry_link check (
    (
      (
        (epic_id is not null)
        and (department_id is null)
      )
      or (
        (epic_id is null)
        and (department_id is not null)
      )
    )
  )
) TABLESPACE pg_default;

-- Create trigger to automatically update the updated_at timestamp
create trigger budget_entries_set_updated_at BEFORE
update on budget_entries for EACH row
execute FUNCTION set_updated_at ();

-- Create indexes for better query performance
CREATE INDEX idx_budget_entries_epic_id ON public.budget_entries(epic_id);
CREATE INDEX idx_budget_entries_department_id ON public.budget_entries(department_id);
CREATE INDEX idx_budget_entries_date ON public.budget_entries(date);
CREATE INDEX idx_budget_entries_fiscal_year ON public.budget_entries(fiscal_year);

-- Add comments for documentation
COMMENT ON TABLE public.budget_entries IS 'Budget entries and expenses linked to either projects (epics) or departments';
COMMENT ON COLUMN public.budget_entries.id IS 'Unique identifier for the budget entry';
COMMENT ON COLUMN public.budget_entries.epic_id IS 'Foreign key to Task table for project/epic - mutually exclusive with department_id';
COMMENT ON COLUMN public.budget_entries.category IS 'Category of the budget/expense (e.g., Computers, Lab Equipment)';
COMMENT ON COLUMN public.budget_entries.description IS 'Optional description of the budget entry';
COMMENT ON COLUMN public.budget_entries.amount IS 'Amount in the specified currency';
COMMENT ON COLUMN public.budget_entries.currency IS 'Currency code (e.g., USD, ZAR, EUR)';
COMMENT ON COLUMN public.budget_entries.entry_type IS 'Type of entry: Expense or Budget';
COMMENT ON COLUMN public.budget_entries.date IS 'Date of the budget entry';
COMMENT ON COLUMN public.budget_entries.created_at IS 'Timestamp when the budget entry was created';
COMMENT ON COLUMN public.budget_entries.updated_at IS 'Timestamp when the budget entry was last updated';
COMMENT ON COLUMN public.budget_entries.department_id IS 'Foreign key to Department table - mutually exclusive with epic_id';
COMMENT ON COLUMN public.budget_entries.frequency IS 'Frequency of the budget/expense: One-time, Weekly, Monthly, Quarterly, or Yearly';
COMMENT ON COLUMN public.budget_entries.fiscal_year IS 'Fiscal year for this budget/expense (format: 2024/2025, starting April 1)';
COMMENT ON COLUMN public.budget_entries.purchase_date IS 'Purchase date for expenses (null for planned budgets)';
