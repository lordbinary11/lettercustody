import { requireRole } from '@/lib/auth';
import { getAllDepartmentLetters } from '@/lib/db-optimized';
import { ImprovedDashboardLayout } from '@/components/layout/ImprovedDashboardLayout';
import { ImprovedCashOfficeDashboard } from './ImprovedCashOfficeDashboard';

export default async function CashOfficeDashboard() {
  const user = await requireRole(['cashoffice_user', 'department_user']);
  
  // Single optimized database call instead of 4 separate calls
  const { incoming, processing, processed } = await getAllDepartmentLetters('CashOffice');

  return (
    <ImprovedDashboardLayout
      department="CashOffice"
      userName={user.full_name || user.username || user.email}
      userEmail={user.email}
    >
      <ImprovedCashOfficeDashboard
        incomingLetters={incoming}
        processingLetters={processing}
        processedLetters={processed}
      />
    </ImprovedDashboardLayout>
  );
}
