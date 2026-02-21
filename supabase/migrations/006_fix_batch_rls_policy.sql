-- Add RLS policy for department users to view batches dispatched to their department
-- This fixes the issue where payroll users can't see batches they didn't create

-- Drop the existing policy and replace with a more comprehensive one
DROP POLICY IF EXISTS "Users can view their own batches" ON letter_batches;

-- New comprehensive policy: Users can view batches they created, batches in their department, or admin/audit
CREATE POLICY "Users can view their own batches or batches for their department"
  ON letter_batches FOR SELECT
  USING (
    auth.uid() = created_by OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'audit')
    ) OR
    EXISTS (
      -- User can see batches that have letters dispatched to their department
      SELECT 1 FROM movements m
      JOIN letters l ON m.letter_id = l.id
      WHERE m.to_department = (
        SELECT department FROM profiles WHERE profiles.id = auth.uid()
      )
      AND l.batch_id = letter_batches.id
    )
  );
