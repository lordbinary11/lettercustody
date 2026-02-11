import { requireRole } from '@/lib/auth';
import { getProcessedLetterHistory } from '@/lib/db';
import { ImprovedDashboardLayout } from '@/components/layout/ImprovedDashboardLayout';
import { LetterHistoryDashboard } from '../../../../components/letters/LetterHistoryDashboard';

export default async function CashOfficeHistoryPage() {
  const user = await requireRole(['cashoffice_user']);
  const historyLetters = await getProcessedLetterHistory('CashOffice');

  return (
    <ImprovedDashboardLayout
      department="CashOffice"
      userName={user.full_name || user.username || user.email}
      userEmail={user.email}
    >
      <LetterHistoryDashboard letters={historyLetters} departmentName="Cash Office" />
    </ImprovedDashboardLayout>
  );
}
