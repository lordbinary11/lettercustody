import { requireRole } from '@/lib/auth';
import { getAllDepartmentLetters } from '@/lib/db-optimized';
import { ImprovedDashboardLayout } from '@/components/layout/ImprovedDashboardLayout';
import { ImprovedBudgetDashboard } from './ImprovedBudgetDashboard';

export default async function BudgetDashboard() {
  const user = await requireRole(['department_user']);
  
  // Single optimized database call instead of 4 separate calls
  const { incoming, processing, processed } = await getAllDepartmentLetters('Budget');

  return (
    <ImprovedDashboardLayout
      department="Budget"
      userName={user.full_name || user.username || user.email}
      userEmail={user.email}
    >
      <ImprovedBudgetDashboard
        incomingLetters={incoming}
        processingLetters={processing}
        processedLetters={processed}
      />
    </ImprovedDashboardLayout>
  );
}
