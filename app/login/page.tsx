import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { LoginForm } from './LoginForm';

export default async function LoginPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    // User is already logged in, get their profile and redirect to dashboard
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, department')
      .eq('id', user.id)
      .single();

    if (profile) {
      const userProfile = profile as { role: string; department: string | null };
      if (userProfile.role === 'secretary') {
        redirect('/dashboard/secretary');
      } else if (userProfile.department === 'Budget') {
        redirect('/dashboard/budget');
      } else if (userProfile.department === 'Payables') {
        redirect('/dashboard/payables');
      } else if (userProfile.department === 'CashOffice') {
        redirect('/dashboard/cashoffice');
      } else {
        redirect('/dashboard/cashoffice');
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
          {/* Logo/Header */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl mb-4">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">
              Letter Custody
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Sign in to access your dashboard
            </p>
          </div>

          {/* Login Form */}
          <LoginForm />

          {/* Footer */}
          <div className="text-center">
            <p className="text-xs text-gray-500">
              Secure document tracking system
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
