export type LetterStatus = 
  | 'new'
  | 'dispatched'
  | 'forwarded'
  | 'processing'
  | 'processed'
  | 'rejected'
  | 'archived';

export type Department = 
  | 'Secretary'
  | 'Budget'
  | 'Payables'
  | 'Payroll'
  | 'StudentSection'
  | 'CashOffice'
  | 'FinalAccounts'
  | 'Audit';

export type UserRole = 
  | 'secretary'
  | 'department_user'
  | 'payables_user'
  | 'payroll_user'
  | 'admin'
  | 'audit';

export type MovementStatus = 
  | 'dispatched'
  | 'forwarded'
  | 'received'
  | 'rejected';

export interface Profile {
  id: string;
  username: string;
  role: UserRole;
  department: Department | null;
  email: string;
  full_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface Letter {
  id: string;
  serial_number: string | null;
  subject: string;
  date_generated: string | null;
  date_received: string | null;
  date_minuted: string | null;
  dispatch_date: string;
  amount: number | null;
  status: LetterStatus;
  current_department: Department | null;
  is_archived: boolean;
  pv_id: string | null;
  batch_id: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Movement {
  id: string;
  letter_id: string;
  from_department: Department | null;
  to_department: Department;
  dispatched_by: string;
  dispatched_at: string;
  received_by: string | null;
  received_at: string | null;
  rejection_reason: string | null;
  status: MovementStatus;
  created_at: string;
}

export interface ProcessingNote {
  id: string;
  letter_id: string;
  department: Department;
  note: string;
  created_by: string;
  created_at: string;
}

export interface LetterWithDetails extends Letter {
  creator?: Profile;
  movements?: (Movement & {
    dispatcher?: Profile;
    receiver?: Profile;
  })[];
  notes?: (ProcessingNote & {
    author?: Profile;
  })[];
}
