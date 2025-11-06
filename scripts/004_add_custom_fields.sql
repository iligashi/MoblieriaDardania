-- Add custom_fields JSONB column to furniture table
-- This allows storing custom field configurations and values per furniture item

ALTER TABLE furniture ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '[]';

-- Create index for faster queries on custom_fields
CREATE INDEX IF NOT EXISTS idx_furniture_custom_fields ON furniture USING GIN (custom_fields);

-- Add comment to explain the column
COMMENT ON COLUMN furniture.custom_fields IS 'Array of custom field objects with type, key, label, value, and display order';

