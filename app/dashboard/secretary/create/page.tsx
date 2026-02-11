import { requireRole } from '@/lib/auth';
import { ImprovedDashboardLayout } from '@/components/layout/ImprovedDashboardLayout';
import { CreateLetterForm } from '../CreateLetterForm';
import Link from 'next/link';

export default async function CreateLetterPage() {
  const user = await requireRole(['secretary']);

  return (
    <ImprovedDashboardLayout
      department="Secretary"
      userName={user.full_name || user.email}
      userEmail={user.email}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/secretary"
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create New Letter</h1>
            <p className="text-sm text-gray-500 mt-1">Fill in the details to create a new letter</p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <CreateLetterForm />
        </div>
      </div>
    </ImprovedDashboardLayout>
  );
}
