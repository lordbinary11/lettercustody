import { requireRole } from '@/lib/auth';
import { getIncomingLetters, getProcessingLetters, getProcessedLetters, getPendingMovement } from '@/lib/db';
import { ImprovedDashboardLayout } from '@/components/layout/ImprovedDashboardLayout';
import { ImprovedCashOfficeDashboard } from './ImprovedCashOfficeDashboard';

export default async function CashOfficeDashboard() {
  const user = await requireRole(['cashoffice_user']);
  
  const incomingLetters = await getIncomingLetters('CashOffice');
  const processingLetters = await getProcessingLetters('CashOffice');
  const processedLetters = await getProcessedLetters('CashOffice');

  // Fetch movements for incoming letters to show source department
  const incomingWithMovements = await Promise.all(
    incomingLetters.map(async (letter) => {
      const movement = await getPendingMovement(letter.id);
      return { ...letter, pendingMovement: movement };
    })
  );

  return (
    <ImprovedDashboardLayout
      department="CashOffice"
      userName={user.full_name || user.username || user.email}
      userEmail={user.email}
    >
      <ImprovedCashOfficeDashboard
        incomingLetters={incomingWithMovements as any}
        processingLetters={processingLetters}
        processedLetters={processedLetters}
      />
    </ImprovedDashboardLayout>
  );
}
