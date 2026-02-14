import { requireRole } from '@/lib/auth';
import { getAllDepartmentLetters } from '@/lib/db-optimized';
import { ImprovedDashboardLayout } from '@/components/layout/ImprovedDashboardLayout';
import { ImprovedPayablesDashboard } from './ImprovedPayablesDashboard';

export default async function PayablesDashboard() {
  const user = await requireRole(['payables_user', 'department_user']);
  
  // Single optimized database call instead of 4 separate calls
  const { incoming, processing, processed } = await getAllDepartmentLetters('Payables');

  return (
    <ImprovedDashboardLayout
      department="Payables"
      userName={user.full_name || user.username || user.email}
      userEmail={user.email}
    >
      <ImprovedPayablesDashboard
        incomingLetters={incoming}
        processingLetters={processing}
        processedLetters={processed}
      />
    </ImprovedDashboardLayout>
  );
}
