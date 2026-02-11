-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE processing_notes ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Admin can view all profiles
CREATE POLICY "Admin can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'audit')
    )
  );

-- Letters policies
CREATE POLICY "Users can view letters they created"
  ON letters FOR SELECT
  USING (created_by = auth.uid());

CREATE POLICY "Users can view letters for their department"
  ON letters FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() 
      AND department = letters.current_department
    )
  );

CREATE POLICY "Secretary can create letters"
  ON letters FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'secretary'
    )
    AND created_by = auth.uid()
  );

CREATE POLICY "Secretary can update letters they created"
  ON letters FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'secretary'
    )
    AND created_by = auth.uid()
  );

CREATE POLICY "Department users can update letters in their custody"
  ON letters FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() 
      AND department = letters.current_department
    )
  );

CREATE POLICY "Admin and audit can view all letters"
  ON letters FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'audit')
    )
  );

-- Movements policies
CREATE POLICY "Users can view movements for letters they can see"
  ON movements FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM letters
      WHERE letters.id = movements.letter_id
      AND (
        letters.created_by = auth.uid()
        OR letters.current_department IN (
          SELECT department FROM profiles WHERE id = auth.uid()
        )
      )
    )
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'audit')
    )
  );

CREATE POLICY "Secretary can create movements"
  ON movements FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'secretary'
    )
    AND dispatched_by = auth.uid()
  );

CREATE POLICY "Department users can create movements for their department"
  ON movements FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      JOIN letters l ON l.id = movements.letter_id
      WHERE p.id = auth.uid() 
      AND p.department = l.current_department
      AND p.department = movements.from_department
    )
    AND dispatched_by = auth.uid()
  );

CREATE POLICY "Department users can update movements to their department"
  ON movements FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() 
      AND department = movements.to_department
    )
    AND status = 'dispatched'
  );

-- Processing notes policies
CREATE POLICY "Users can view notes for letters they can see"
  ON processing_notes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM letters
      WHERE letters.id = processing_notes.letter_id
      AND (
        letters.created_by = auth.uid()
        OR letters.current_department IN (
          SELECT department FROM profiles WHERE id = auth.uid()
        )
      )
    )
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'audit')
    )
  );

CREATE POLICY "Department users can create notes for their department"
  ON processing_notes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      JOIN letters l ON l.id = processing_notes.letter_id
      WHERE p.id = auth.uid() 
      AND p.department = l.current_department
      AND p.department = processing_notes.department
    )
    AND created_by = auth.uid()
  );
