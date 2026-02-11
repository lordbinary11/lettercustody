import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';

export default async function Home() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  // User is logged in, redirect to their dashboard
  if (user.role === 'secretary') {
    redirect('/dashboard/secretary');
  } else if (user.department === 'Budget') {
    redirect('/dashboard/budget');
  } else if (user.department === 'Payables') {
    redirect('/dashboard/payables');
  } else {
    // Default to budget dashboard for other departments
    redirect('/dashboard/budget');
  }
}
