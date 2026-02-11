import { requireRole } from '@/lib/auth';
import { getProcessedLetterHistory } from '@/lib/db';
import { ImprovedDashboardLayout } from '@/components/layout/ImprovedDashboardLayout';
import { LetterHistoryDashboard } from '../../../../components/letters/LetterHistoryDashboard';

export default async function BudgetHistoryPage() {
  const user = await requireRole(['department_user']);
  
  const processedLetters = await getProcessedLetterHistory('Budget');

  return (
    <ImprovedDashboardLayout
      department="Budget"
      userName={user.full_name || user.username || user.email}
      userEmail={user.email}
    >
      <LetterHistoryDashboard
        letters={processedLetters}
        departmentName="Budget"
      />
    </ImprovedDashboardLayout>
  );
}
