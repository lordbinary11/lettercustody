import { z } from 'zod';

export const DepartmentEnum = z.enum([
  'Secretary',
  'Budget',
  'Payables',
  'Payroll',
  'StudentSection',
  'CashOffice',
  'FinalAccounts',
  'Audit',
]);

export const LetterStatusEnum = z.enum([
  'created',
  'dispatched',
  'received',
  'processing',
  'processed',
  'rejected',
  'archived',
]);

export const UserRoleEnum = z.enum([
  'secretary',
  'department_user',
  'payables_user',
  'admin',
  'audit',
]);

export const MovementStatusEnum = z.enum([
  'dispatched',
  'received',
  'rejected',
]);

export const CreateLetterSchema = z.object({
  serial_number: z.string().regex(
    /^[A-Z0-9-]+$/,
    'Serial number must contain only uppercase letters, numbers, and hyphens'
  ).optional().nullable(),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  date_generated: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format').optional().or(z.literal('')).transform(val => val === '' ? undefined : val),
  date_minuted: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format').optional().or(z.literal('')).transform(val => val === '' ? undefined : val),
  amount: z.number().positive('Amount must be positive').optional().nullable(),
});

export const DispatchLetterSchema = z.object({
  letter_id: z.string().uuid('Invalid letter ID'),
  to_department: DepartmentEnum,
});

export const ReceiveLetterSchema = z.object({
  movement_id: z.string().uuid('Invalid movement ID'),
  letter_id: z.string().uuid('Invalid letter ID'),
});

export const RejectLetterSchema = z.object({
  movement_id: z.string().uuid('Invalid movement ID'),
  letter_id: z.string().uuid('Invalid letter ID'),
  rejection_reason: z.string().min(10, 'Rejection reason must be at least 10 characters'),
});

export const AddProcessingNoteSchema = z.object({
  letter_id: z.string().uuid('Invalid letter ID'),
  note: z.string().min(5, 'Note must be at least 5 characters'),
});

export const CompleteProcessingSchema = z.object({
  letter_id: z.string().uuid('Invalid letter ID'),
});

export const AttachPVSchema = z.object({
  letter_id: z.string().uuid('Invalid letter ID'),
  pv_id: z.string().min(1, 'PV ID is required').regex(
    /^PV-[0-9]{4}-[0-9]+$/,
    'PV ID must be in format PV-YYYY-NNNN (e.g., PV-2026-0001)'
  ),
});

export const ForwardLetterSchema = z.object({
  letter_id: z.string().uuid('Invalid letter ID'),
  to_department: DepartmentEnum,
});

export type CreateLetterInput = z.infer<typeof CreateLetterSchema>;
export type DispatchLetterInput = z.infer<typeof DispatchLetterSchema>;
export type ReceiveLetterInput = z.infer<typeof ReceiveLetterSchema>;
export type RejectLetterInput = z.infer<typeof RejectLetterSchema>;
export type AddProcessingNoteInput = z.infer<typeof AddProcessingNoteSchema>;
export type CompleteProcessingInput = z.infer<typeof CompleteProcessingSchema>;
export type AttachPVInput = z.infer<typeof AttachPVSchema>;
export type ForwardLetterInput = z.infer<typeof ForwardLetterSchema>;
