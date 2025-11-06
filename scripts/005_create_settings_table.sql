-- Create settings table to store dynamic categories, colors, and materials
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default settings
INSERT INTO settings (key, value) VALUES
  ('categories', '["sofa", "chair", "table", "bed", "desk", "cabinet", "shelf", "other"]'::jsonb),
  ('materials', '["wood", "metal", "plastic", "glass", "fabric", "leather", "mixed"]'::jsonb),
  ('colors', '["white", "black", "brown", "gray", "beige", "blue", "green", "red", "other"]'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Enable RLS on settings table
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Only authenticated admin users can view settings
CREATE POLICY "Authenticated admins can view settings" ON settings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users WHERE id = auth.uid()
    )
  );

-- Only authenticated admin users can update settings
CREATE POLICY "Authenticated admins can update settings" ON settings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM admin_users WHERE id = auth.uid()
    )
  );

-- Only authenticated admin users can insert settings
CREATE POLICY "Authenticated admins can insert settings" ON settings
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users WHERE id = auth.uid()
    )
  );
