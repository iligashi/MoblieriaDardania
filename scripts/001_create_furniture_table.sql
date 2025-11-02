-- Create furniture table with all required fields
CREATE TABLE IF NOT EXISTS furniture (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  dimensions JSONB NOT NULL, -- {length, width, height, unit}
  material TEXT NOT NULL,
  color TEXT NOT NULL,
  weight DECIMAL(10, 2) NOT NULL,
  weight_unit TEXT NOT NULL DEFAULT 'kg',
  stock INTEGER NOT NULL DEFAULT 0,
  images TEXT[] NOT NULL DEFAULT '{}', -- Array of image URLs
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_furniture_category ON furniture(category);
CREATE INDEX IF NOT EXISTS idx_furniture_price ON furniture(price);
CREATE INDEX IF NOT EXISTS idx_furniture_color ON furniture(color);
CREATE INDEX IF NOT EXISTS idx_furniture_material ON furniture(material);

-- Create admin users table for authentication
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on admin_users
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Admin users can only view their own data
CREATE POLICY "Admin users can view own data" ON admin_users
  FOR SELECT USING (auth.uid() = id);

-- Enable RLS on furniture table
ALTER TABLE furniture ENABLE ROW LEVEL SECURITY;

-- Public can view all furniture (for browsing)
CREATE POLICY "Anyone can view furniture" ON furniture
  FOR SELECT USING (true);

-- Only authenticated admin users can insert furniture
CREATE POLICY "Authenticated admins can insert furniture" ON furniture
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users WHERE id = auth.uid()
    )
  );

-- Only authenticated admin users can update furniture
CREATE POLICY "Authenticated admins can update furniture" ON furniture
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM admin_users WHERE id = auth.uid()
    )
  );

-- Only authenticated admin users can delete furniture
CREATE POLICY "Authenticated admins can delete furniture" ON furniture
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM admin_users WHERE id = auth.uid()
    )
  );
