import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { LoginForm } from './LoginForm';
import Image from 'next/image';

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
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-knust-black relative overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <Image
            src="/assets/finance_office.jpg"
            alt="KNUST Finance Office"
            fill
            className="object-cover"
            priority
          />
          {/* Dark overlay for readability */}
          <div className="absolute inset-0 bg-knust-black/70" />
        </div>
        
        {/* Background pattern overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        
        {/* Green accent stripe */}
        <div className="absolute top-0 left-0 w-2 h-full bg-knust-green-500" />
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-12 lg:px-16">
          {/* Logo */}
          <div className="mb-8">
            <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-lg mb-6 overflow-hidden">
              <Image
                src="/assets/knust.png"
                alt="KNUST Logo"
                width={64}
                height={64}
                className="object-contain"
              />
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">KNUST PaperTrail</h1>
            <p className="text-knust-gray-400 text-lg">Letter Custody & Workflow System</p>
          </div>
          
          {/* Features */}
          <div className="space-y-6 mt-8">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-knust-green-500/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-knust-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-white font-semibold">Track Letter Movements</h3>
                <p className="text-knust-gray-400 text-sm">Monitor letters across all finance departments in real-time</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-knust-green-500/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-knust-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 className="text-white font-semibold">Streamlined Workflow</h3>
                <p className="text-knust-gray-400 text-sm">Efficient dispatch, processing, and forwarding of documents</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-knust-yellow-500/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-knust-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-white font-semibold">Complete Audit Trail</h3>
                <p className="text-knust-gray-400 text-sm">Full history and accountability for every document</p>
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="mt-auto pt-12">
            <p className="text-knust-gray-500 text-sm">
              © {new Date().getFullYear()} Kwame Nkrumah University of Science and Technology
            </p>
            <p className="text-knust-gray-600 text-xs mt-1">Finance Office</p>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-knust-gray-50 px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center mx-auto mb-4 shadow-md overflow-hidden border border-knust-gray-200">
              <Image
                src="/assets/knust.png"
                alt="KNUST Logo"
                width={48}
                height={48}
                className="object-contain"
              />
            </div>
            <h1 className="text-2xl font-bold text-knust-black">KNUST PaperTrail</h1>
            <p className="text-knust-gray-500 text-sm mt-1">Finance Office</p>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-knust-gray-200">
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-knust-black">
                Welcome Back
              </h2>
              <p className="mt-2 text-sm text-knust-gray-500">
                Sign in to access your dashboard
              </p>
            </div>

            {/* Login Form */}
            <LoginForm />

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-knust-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-knust-gray-400">Secure Access</span>
              </div>
            </div>

            {/* Help Link */}
            <div className="text-center">
              <p className="text-xs text-knust-gray-500">
                Having trouble signing in?{' '}
                <a href="mailto:support@knust.edu.gh" className="text-knust-green-600 hover:text-knust-green-700 font-medium">
                  Contact IT Support
                </a>
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-xs text-knust-gray-400">
              Protected by KNUST Information Security Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
