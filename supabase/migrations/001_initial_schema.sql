-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enums
CREATE TYPE letter_status AS ENUM (
  'created',
  'dispatched',
  'received',
  'processing',
  'processed',
  'rejected',
  'archived'
);

CREATE TYPE department AS ENUM (
  'Secretary',
  'Budget',
  'Payables',
  'Payroll',
  'StudentSection',
  'CashOffice',
  'FinalAccounts',
  'Audit'
);

CREATE TYPE user_role AS ENUM (
  'secretary',
  'department_user',
  'payables_user',
  'admin',
  'audit'
);

CREATE TYPE movement_status AS ENUM (
  'dispatched',
  'received',
  'rejected'
);

-- Create profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL UNIQUE,
  role user_role NOT NULL,
  department department,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create letters table
CREATE TABLE letters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  serial_number TEXT UNIQUE,
  subject TEXT NOT NULL,
  date_generated TIMESTAMPTZ,
  date_received TIMESTAMPTZ,
  date_minuted TIMESTAMPTZ,
  dispatch_date TIMESTAMPTZ DEFAULT NOW(),
  amount DECIMAL(15, 2),
  status letter_status NOT NULL DEFAULT 'created',
  current_department department,
  is_archived BOOLEAN NOT NULL DEFAULT FALSE,
  pv_id TEXT,
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create movements table (custody tracking)
CREATE TABLE movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  letter_id UUID NOT NULL REFERENCES letters(id) ON DELETE CASCADE,
  from_department department,
  to_department department NOT NULL,
  dispatched_by UUID NOT NULL REFERENCES profiles(id),
  dispatched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  received_by UUID REFERENCES profiles(id),
  received_at TIMESTAMPTZ,
  rejection_reason TEXT,
  status movement_status NOT NULL DEFAULT 'dispatched',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create processing_notes table
CREATE TABLE processing_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  letter_id UUID NOT NULL REFERENCES letters(id) ON DELETE CASCADE,
  department department NOT NULL,
  note TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_letters_status ON letters(status);
CREATE INDEX idx_letters_current_department ON letters(current_department);
CREATE INDEX idx_letters_created_by ON letters(created_by);
CREATE INDEX idx_movements_letter_id ON movements(letter_id);
CREATE INDEX idx_movements_to_department ON movements(to_department);
CREATE INDEX idx_movements_status ON movements(status);
CREATE INDEX idx_processing_notes_letter_id ON processing_notes(letter_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to letters table
CREATE TRIGGER update_letters_updated_at
  BEFORE UPDATE ON letters
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add trigger to profiles table
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
