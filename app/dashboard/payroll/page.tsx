import { requireRole } from '@/lib/auth';
import { getAllDepartmentLetters } from '@/lib/db-optimized';
import { ImprovedDashboardLayout } from '@/components/layout/ImprovedDashboardLayout';
import { PayrollDashboard } from './PayrollDashboard';

export default async function PayrollPage() {
  const user = await requireRole(['payroll_user', 'department_user', 'admin']);
  
  // Additional check: ensure user belongs to Payroll department
  if (user.department !== 'Payroll') {
    throw new Error(`Unauthorized: You must belong to Payroll department. Your department: ${user.department || 'None'}. Your role: ${user.role}`);
  }
  
  // Single optimized database call instead of 4 separate calls
  const { incoming, processing, processed } = await getAllDepartmentLetters('Payroll');

  return (
    <ImprovedDashboardLayout
      department="Payroll"
      userName={user.full_name || user.username || user.email}
      userEmail={user.email}
    >
      <PayrollDashboard
        incomingLetters={incoming}
        processingLetters={processing}
        processedLetters={processed}
      />
    </ImprovedDashboardLayout>
  );
}
