-- Migration to update letters table with new fields
-- Run this if you already have the database set up from 001_initial_schema.sql

-- Add new columns to letters table
ALTER TABLE letters 
  ALTER COLUMN serial_number DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS date_generated TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS date_received TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS date_minuted TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS dispatch_date TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS amount DECIMAL(15, 2),
  ADD COLUMN IF NOT EXISTS is_archived BOOLEAN NOT NULL DEFAULT FALSE;

-- Update existing records to have dispatch_date set to created_at if null
UPDATE letters 
SET dispatch_date = created_at 
WHERE dispatch_date IS NULL;

-- Add comment to document the schema changes
COMMENT ON COLUMN letters.serial_number IS 'Optional unique serial number for the letter';
COMMENT ON COLUMN letters.date_generated IS 'Date when the letter was originally generated';
COMMENT ON COLUMN letters.date_received IS 'Date when the letter was received by a department';
COMMENT ON COLUMN letters.date_minuted IS 'Date when the letter was minuted';
COMMENT ON COLUMN letters.dispatch_date IS 'Date when the letter was dispatched';
COMMENT ON COLUMN letters.amount IS 'Monetary amount associated with the letter';
COMMENT ON COLUMN letters.is_archived IS 'Whether the letter has been archived';
