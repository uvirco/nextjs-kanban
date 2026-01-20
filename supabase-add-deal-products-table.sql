-- Create deal_products table for many-to-many relationship between deals and products
CREATE TABLE IF NOT EXISTS crm_deal_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  deal_id UUID NOT NULL REFERENCES crm_deals(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES crm_products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
  currency VARCHAR(3) DEFAULT 'EUR',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by_user_id UUID REFERENCES auth.users(id),

  -- Ensure unique combination of deal and product
  UNIQUE(deal_id, product_id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_crm_deal_products_deal_id ON crm_deal_products(deal_id);
CREATE INDEX IF NOT EXISTS idx_crm_deal_products_product_id ON crm_deal_products(product_id);

-- Add RLS policies
ALTER TABLE crm_deal_products ENABLE ROW LEVEL SECURITY;

-- Allow users to view deal products for deals they can access
CREATE POLICY "Users can view deal products for accessible deals" ON crm_deal_products
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM crm_deals d
      WHERE d.id = crm_deal_products.deal_id
      AND (d.created_by_user_id = auth.uid() OR d.assigned_user_id = auth.uid())
    )
  );

-- Allow users to insert deal products for deals they can access
CREATE POLICY "Users can insert deal products for accessible deals" ON crm_deal_products
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM crm_deals d
      WHERE d.id = crm_deal_products.deal_id
      AND (d.created_by_user_id = auth.uid() OR d.assigned_user_id = auth.uid())
    )
  );

-- Allow users to update deal products for deals they can access
CREATE POLICY "Users can update deal products for accessible deals" ON crm_deal_products
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM crm_deals d
      WHERE d.id = crm_deal_products.deal_id
      AND (d.created_by_user_id = auth.uid() OR d.assigned_user_id = auth.uid())
    )
  );

-- Allow users to delete deal products for deals they can access
CREATE POLICY "Users can delete deal products for accessible deals" ON crm_deal_products
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM crm_deals d
      WHERE d.id = crm_deal_products.deal_id
      AND (d.created_by_user_id = auth.uid() OR d.assigned_user_id = auth.uid())
    )
  );

-- Insert some sample deal products
INSERT INTO crm_deal_products (deal_id, product_id, quantity, unit_price, currency)
SELECT
  d.id as deal_id,
  p.id as product_id,
  1 as quantity,
  p.unit_price as unit_price,
  COALESCE(p.currency, 'EUR') as currency
FROM crm_deals d
CROSS JOIN crm_products p
WHERE p.active = true
LIMIT 5;