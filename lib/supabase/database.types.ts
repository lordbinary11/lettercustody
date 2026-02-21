export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          role: 'secretary' | 'department_user' | 'payables_user' | 'admin' | 'audit'
          department: 'Secretary' | 'Budget' | 'Payables' | 'Payroll' | 'StudentSection' | 'CashOffice' | 'FinalAccounts' | 'Audit' | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          role: 'secretary' | 'department_user' | 'payables_user' | 'admin' | 'audit'
          department: 'Secretary' | 'Budget' | 'Payables' | 'Payroll' | 'StudentSection' | 'CashOffice' | 'FinalAccounts' | 'Audit' | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          role?: 'secretary' | 'department_user' | 'payables_user' | 'admin' | 'audit'
          department?: 'Secretary' | 'Budget' | 'Payables' | 'Payroll' | 'StudentSection' | 'CashOffice' | 'FinalAccounts' | 'Audit' | null
          created_at?: string
          updated_at?: string
        }
      }
      letters: {
        Row: {
          id: string
          serial_number: string | null
          subject: string
          date_generated: string | null
          date_received: string | null
          date_minuted: string | null
          dispatch_date: string
          amount: number | null
          status: 'created' | 'dispatched' | 'received' | 'processing' | 'processed' | 'rejected' | 'archived'
          current_department: 'Secretary' | 'Budget' | 'Payables' | 'Payroll' | 'StudentSection' | 'CashOffice' | 'FinalAccounts' | 'Audit' | null
          is_archived: boolean
          pv_id: string | null
          batch_id: string | null
          batch_index: number | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          serial_number?: string | null
          subject: string
          date_generated?: string | null
          date_received?: string | null
          date_minuted?: string | null
          dispatch_date?: string
          amount?: number | null
          status?: 'created' | 'dispatched' | 'received' | 'processing' | 'processed' | 'rejected' | 'archived'
          current_department?: 'Secretary' | 'Budget' | 'Payables' | 'Payroll' | 'StudentSection' | 'CashOffice' | 'FinalAccounts' | 'Audit' | null
          is_archived?: boolean
          pv_id?: string | null
          batch_id?: string | null
          batch_index?: number | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          serial_number?: string | null
          subject?: string
          date_generated?: string | null
          date_received?: string | null
          date_minuted?: string | null
          dispatch_date?: string
          amount?: number | null
          status?: 'created' | 'dispatched' | 'received' | 'processing' | 'processed' | 'rejected' | 'archived'
          current_department?: 'Secretary' | 'Budget' | 'Payables' | 'Payroll' | 'StudentSection' | 'CashOffice' | 'FinalAccounts' | 'Audit' | null
          is_archived?: boolean
          pv_id?: string | null
          batch_id?: string | null
          batch_index?: number | null
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      letter_batches: {
        Row: {
          id: string
          batch_name: string
          letter_type: string
          total_count: number
          created_by: string
          date_generated: string | null
          date_minuted: string | null
          created_at: string
          updated_at: string
          metadata: Json
        }
        Insert: {
          id?: string
          batch_name: string
          letter_type: string
          total_count: number
          created_by: string
          date_generated?: string | null
          date_minuted?: string | null
          created_at?: string
          updated_at?: string
          metadata?: Json
        }
        Update: {
          id?: string
          batch_name?: string
          letter_type?: string
          total_count?: number
          created_by?: string
          date_generated?: string | null
          date_minuted?: string | null
          created_at?: string
          updated_at?: string
          metadata?: Json
        }
      }
      movements: {
        Row: {
          id: string
          letter_id: string
          from_department: 'Secretary' | 'Budget' | 'Payables' | 'Payroll' | 'StudentSection' | 'CashOffice' | 'FinalAccounts' | 'Audit' | null
          to_department: 'Secretary' | 'Budget' | 'Payables' | 'Payroll' | 'StudentSection' | 'CashOffice' | 'FinalAccounts' | 'Audit'
          dispatched_by: string
          dispatched_at: string
          received_by: string | null
          received_at: string | null
          rejection_reason: string | null
          status: 'dispatched' | 'received' | 'rejected'
          created_at: string
        }
        Insert: {
          id?: string
          letter_id: string
          from_department?: 'Secretary' | 'Budget' | 'Payables' | 'Payroll' | 'StudentSection' | 'CashOffice' | 'FinalAccounts' | 'Audit' | null
          to_department: 'Secretary' | 'Budget' | 'Payables' | 'Payroll' | 'StudentSection' | 'CashOffice' | 'FinalAccounts' | 'Audit'
          dispatched_by: string
          dispatched_at?: string
          received_by?: string | null
          received_at?: string | null
          rejection_reason?: string | null
          status?: 'dispatched' | 'received' | 'rejected'
          created_at?: string
        }
        Update: {
          id?: string
          letter_id?: string
          from_department?: 'Secretary' | 'Budget' | 'Payables' | 'Payroll' | 'StudentSection' | 'CashOffice' | 'FinalAccounts' | 'Audit' | null
          to_department?: 'Secretary' | 'Budget' | 'Payables' | 'Payroll' | 'StudentSection' | 'CashOffice' | 'FinalAccounts' | 'Audit'
          dispatched_by?: string
          dispatched_at?: string
          received_by?: string | null
          received_at?: string | null
          rejection_reason?: string | null
          status?: 'dispatched' | 'received' | 'rejected'
          created_at?: string
        }
      }
      processing_notes: {
        Row: {
          id: string
          letter_id: string
          department: 'Secretary' | 'Budget' | 'Payables' | 'Payroll' | 'StudentSection' | 'CashOffice' | 'FinalAccounts' | 'Audit'
          notes: string
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          letter_id: string
          department: 'Secretary' | 'Budget' | 'Payables' | 'Payroll' | 'StudentSection' | 'CashOffice' | 'FinalAccounts' | 'Audit'
          notes: string
          created_by: string
          created_at?: string
        }
        Update: {
          id?: string
          letter_id?: string
          department?: 'Secretary' | 'Budget' | 'Payables' | 'Payroll' | 'StudentSection' | 'CashOffice' | 'FinalAccounts' | 'Audit'
          notes?: string
          created_by?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      letter_status: 'created' | 'dispatched' | 'received' | 'processing' | 'processed' | 'rejected' | 'archived'
      department: 'Secretary' | 'Budget' | 'Payables' | 'Payroll' | 'StudentSection' | 'CashOffice' | 'FinalAccounts' | 'Audit'
      user_role: 'secretary' | 'department_user' | 'payables_user' | 'admin' | 'audit'
      movement_status: 'dispatched' | 'received' | 'rejected'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}