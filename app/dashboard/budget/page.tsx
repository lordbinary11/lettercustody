import { requireRole } from '@/lib/auth';
import { getIncomingLetters, getProcessingLetters, getProcessedLetters, getPendingMovement } from '@/lib/db';
import { ImprovedDashboardLayout } from '@/components/layout/ImprovedDashboardLayout';
import { ImprovedBudgetDashboard } from './ImprovedBudgetDashboard';

export default async function BudgetDashboard() {
  const user = await requireRole(['department_user']);
  
  const incomingLetters = await getIncomingLetters('Budget');
  const processingLetters = await getProcessingLetters('Budget');
  const processedLetters = await getProcessedLetters('Budget');

  // Fetch movements for incoming letters to show source department
  const incomingWithMovements = await Promise.all(
    incomingLetters.map(async (letter) => {
      const movement = await getPendingMovement(letter.id);
      return { ...letter, pendingMovement: movement };
    })
  );

  return (
    <ImprovedDashboardLayout
      department="Budget"
      userName={user.full_name || user.username || user.email}
      userEmail={user.email}
    >
      <ImprovedBudgetDashboard
        incomingLetters={incomingWithMovements as any}
        processingLetters={processingLetters}
        processedLetters={processedLetters}
      />
    </ImprovedDashboardLayout>
  );
}
