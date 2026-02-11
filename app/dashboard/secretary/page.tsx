import { requireRole } from '@/lib/auth';
import { getLettersByCreator } from '@/lib/db';
import { ImprovedDashboardLayout } from '@/components/layout/ImprovedDashboardLayout';
import { ImprovedSecretaryDashboard } from './ImprovedSecretaryDashboard';

export default async function SecretaryDashboard() {
  const user = await requireRole(['secretary']);
  const letters = await getLettersByCreator(user.id);

  return (
    <ImprovedDashboardLayout
      department="Secretary"
      userName={user.full_name || user.username || user.email}
      userEmail={user.email}
    >
      <ImprovedSecretaryDashboard letters={letters} />
    </ImprovedDashboardLayout>
  );
}
