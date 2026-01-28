-- Enable RLS on Contact table
ALTER TABLE public."Contact" ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Contact table (permissive for all authenticated users)
CREATE POLICY "Enable read access" ON public."Contact"
  FOR SELECT
  USING (true);

CREATE POLICY "Enable insert access" ON public."Contact"
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Enable update access" ON public."Contact"
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable delete access" ON public."Contact"
  FOR DELETE
  USING (true);
