-- Add batch_id column to letters table to group batch letters
ALTER TABLE letters ADD COLUMN IF NOT EXISTS batch_id UUID;
ALTER TABLE letters ADD COLUMN IF NOT EXISTS batch_index INTEGER;

-- Create batches table to store batch metadata
CREATE TABLE IF NOT EXISTS letter_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_name VARCHAR(255) NOT NULL,
  letter_type VARCHAR(100) NOT NULL,
  total_count INTEGER NOT NULL,
  created_by UUID NOT NULL REFERENCES profiles(id),
  date_generated DATE,
  date_minuted DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create index for faster batch queries
CREATE INDEX IF NOT EXISTS idx_letters_batch_id ON letters(batch_id);
CREATE INDEX IF NOT EXISTS idx_batches_created_by ON letter_batches(created_by);

-- Add RLS policies for letter_batches
ALTER TABLE letter_batches ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view batches they created or batches in their department
CREATE POLICY "Users can view their own batches"
  ON letter_batches FOR SELECT
  USING (
    auth.uid() = created_by OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'audit')
    )
  );

-- Policy: Only secretaries can create batches
CREATE POLICY "Secretaries can create batches"
  ON letter_batches FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'secretary'
    )
  );

-- Policy: Only batch creator can update
CREATE POLICY "Batch creator can update"
  ON letter_batches FOR UPDATE
  USING (auth.uid() = created_by);

-- Add trigger to update updated_at
CREATE OR REPLACE FUNCTION update_letter_batches_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER letter_batches_updated_at
  BEFORE UPDATE ON letter_batches
  FOR EACH ROW
  EXECUTE FUNCTION update_letter_batches_updated_at();
