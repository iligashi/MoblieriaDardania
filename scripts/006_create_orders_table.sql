-- Create orders table to capture customer inquiries / order requests
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  furniture_id UUID NOT NULL REFERENCES furniture(id) ON DELETE CASCADE,
  furniture_title TEXT NOT NULL,
  furniture_price DECIMAL(10, 2) NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT,
  customer_message TEXT,
  send_via_email BOOLEAN DEFAULT FALSE,
  send_via_whatsapp BOOLEAN DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Basic indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_orders_furniture_id ON orders(furniture_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- Enable Row Level Security
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Allow anyone (including anonymous users) to create an order request
CREATE POLICY "Public can create orders" ON orders
  FOR INSERT
  WITH CHECK (true);

-- Only authenticated admin users can view orders
CREATE POLICY "Admins can view orders" ON orders
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can update orders" ON orders
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM admin_users WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users WHERE id = auth.uid()
    )
  );

