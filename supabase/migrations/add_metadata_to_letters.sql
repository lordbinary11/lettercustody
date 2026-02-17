-- Add metadata column to letters table
ALTER TABLE letters ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Create index for faster metadata queries
CREATE INDEX IF NOT EXISTS idx_letters_metadata ON letters USING gin(metadata);
