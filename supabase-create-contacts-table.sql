-- Create Contact table for global suppliers and project participants
CREATE TABLE public."Contact" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  contact_type TEXT NOT NULL CHECK (contact_type IN ('supplier', 'contractor', 'team_member', 'client', 'other')),
  address TEXT,
  city TEXT,
  country TEXT,
  notes TEXT,
  created_by TEXT REFERENCES "User"(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_contact_type ON public."Contact"(contact_type);
CREATE INDEX idx_contact_company ON public."Contact"(company);
CREATE INDEX idx_contact_city ON public."Contact"(city);
CREATE INDEX idx_contact_country ON public."Contact"(country);
CREATE INDEX idx_contact_created_by ON public."Contact"(created_by);
CREATE INDEX idx_contact_email ON public."Contact"(email);

-- Enable RLS
ALTER TABLE public."Contact" ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Contact table
CREATE POLICY "Enable read access for authenticated users" ON public."Contact"
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON public."Contact"
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for contact creator" ON public."Contact"
  FOR UPDATE
  USING (created_by = auth.uid()::text OR auth.role() = 'authenticated')
  WITH CHECK (created_by = auth.uid()::text OR auth.role() = 'authenticated');

CREATE POLICY "Enable delete for contact creator" ON public."Contact"
  FOR DELETE
  USING (created_by = auth.uid()::text OR auth.role() = 'authenticated');
