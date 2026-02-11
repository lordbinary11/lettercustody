import { requireRole } from '@/lib/auth';
import { getProcessedLetterHistory } from '@/lib/db';
import { ImprovedDashboardLayout } from '@/components/layout/ImprovedDashboardLayout';
import { LetterHistoryDashboard } from '../../../../components/letters/LetterHistoryDashboard';

export default async function PayablesHistoryPage() {
  const user = await requireRole(['payables_user', 'department_user']);
  
  const processedLetters = await getProcessedLetterHistory('Payables');

  return (
    <ImprovedDashboardLayout
      department="Payables"
      userName={user.full_name || user.username || user.email}
      userEmail={user.email}
    >
      <LetterHistoryDashboard
        letters={processedLetters}
        departmentName="Payables"
      />
    </ImprovedDashboardLayout>
  );
}
