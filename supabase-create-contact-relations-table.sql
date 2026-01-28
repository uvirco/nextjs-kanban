-- Create ContactRelation table to link contacts to projects, budgets, and tasks
CREATE TABLE public."ContactRelation" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID NOT NULL REFERENCES "Contact"(id) ON DELETE CASCADE,
  parent_type TEXT NOT NULL CHECK (parent_type IN ('project', 'budget_entry', 'task')),
  parent_id TEXT NOT NULL,
  relation_type TEXT NOT NULL CHECK (relation_type IN ('supplier', 'approver', 'team_member', 'stakeholder', 'contractor')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT REFERENCES "User"(id)
);

-- Create indexes for faster queries
CREATE INDEX idx_contact_relation_contact_id ON public."ContactRelation"(contact_id);
CREATE INDEX idx_contact_relation_parent ON public."ContactRelation"(parent_type, parent_id);
CREATE INDEX idx_contact_relation_type ON public."ContactRelation"(relation_type);
CREATE UNIQUE INDEX idx_contact_relation_unique ON public."ContactRelation"(contact_id, parent_type, parent_id, relation_type);

-- Enable RLS
ALTER TABLE public."ContactRelation" ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ContactRelation table
CREATE POLICY "Enable read access for authenticated users" ON public."ContactRelation"
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON public."ContactRelation"
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for relation creator" ON public."ContactRelation"
  FOR UPDATE
  USING (created_by = auth.uid()::text OR auth.role() = 'authenticated')
  WITH CHECK (created_by = auth.uid()::text OR auth.role() = 'authenticated');

CREATE POLICY "Enable delete for relation creator" ON public."ContactRelation"
  FOR DELETE
  USING (created_by = auth.uid()::text OR auth.role() = 'authenticated');
