import { requireRole } from '@/lib/auth';
import { getIncomingLetters, getProcessingLetters, getProcessedLetters, getPendingMovement } from '@/lib/db';
import { ImprovedDashboardLayout } from '@/components/layout/ImprovedDashboardLayout';
import { ImprovedPayablesDashboard } from './ImprovedPayablesDashboard';

export default async function PayablesDashboard() {
  const user = await requireRole(['payables_user', 'department_user']);
  
  const incomingLetters = await getIncomingLetters('Payables');
  const processingLetters = await getProcessingLetters('Payables');
  const processedLetters = await getProcessedLetters('Payables');

  // Fetch movements for incoming letters to show source department
  const incomingWithMovements = await Promise.all(
    incomingLetters.map(async (letter) => {
      const movement = await getPendingMovement(letter.id);
      return { ...letter, pendingMovement: movement };
    })
  );

  return (
    <ImprovedDashboardLayout
      department="Payables"
      userName={user.full_name || user.username || user.email}
      userEmail={user.email}
    >
      <ImprovedPayablesDashboard
        incomingLetters={incomingWithMovements as any}
        processingLetters={processingLetters}
        processedLetters={processedLetters}
      />
    </ImprovedDashboardLayout>
  );
}
