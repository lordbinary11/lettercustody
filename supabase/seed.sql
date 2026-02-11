-- Seed data for testing
-- Note: In production, users should be created through Supabase Auth
-- This is just for demonstration purposes

-- Insert test profiles (you'll need to create these users in Supabase Auth first)
-- Example UUIDs - replace with actual user IDs from auth.users

-- INSERT INTO profiles (id, username, role, department) VALUES
-- ('00000000-0000-0000-0000-000000000001', 'secretary1', 'secretary', 'Secretary'),
-- ('00000000-0000-0000-0000-000000000002', 'budget1', 'department_user', 'Budget'),
-- ('00000000-0000-0000-0000-000000000003', 'payables1', 'payables_user', 'Payables'),
-- ('00000000-0000-0000-0000-000000000004', 'admin1', 'admin', NULL);

-- Sample letter data (uncomment after creating users)
-- INSERT INTO letters (
--   serial_number, 
--   subject, 
--   date_generated,
--   date_minuted,
--   dispatch_date,
--   amount,
--   status, 
--   current_department, 
--   is_archived,
--   created_by
-- ) VALUES
-- ('LTR-2026-001', 'Budget Request for Q1', '2026-02-01 10:00:00', '2026-02-01 14:30:00', '2026-02-01 16:00:00', 5000.00, 'created', NULL, FALSE, '00000000-0000-0000-0000-000000000001'),
-- ('LTR-2026-002', 'Payment Voucher Approval', '2026-02-02 09:15:00', NULL, '2026-02-02 11:00:00', 12500.50, 'created', NULL, FALSE, '00000000-0000-0000-0000-000000000001'),
-- (NULL, 'Urgent Purchase Request', '2026-02-03 08:00:00', NULL, '2026-02-03 09:00:00', 750.00, 'created', NULL, FALSE, '00000000-0000-0000-0000-000000000001');
