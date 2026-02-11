'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogoutButton } from '@/components/LogoutButton';
import { Department } from '@/types';

interface ImprovedDashboardLayoutProps {
  children: ReactNode;
  department: Department;
  userName: string;
  userEmail: string;
}

const departmentInfo: Record<Department, { name: string; icon: string }> = {
  Secretary: { name: "Secretary's Office", icon: '📋' },
  Budget: { name: 'Budget Department', icon: '💰' },
  Payables: { name: 'Payables Department', icon: '💳' },
  Payroll: { name: 'Payroll Department', icon: '👥' },
  StudentSection: { name: 'Student Section', icon: '🎓' },
  CashOffice: { name: 'Cash Office', icon: '🏦' },
  FinalAccounts: { name: 'Final Accounts', icon: '📊' },
  Audit: { name: 'Audit Department', icon: '🔍' },
};

export function ImprovedDashboardLayout({
  children,
  department,
  userName,
  userEmail,
}: ImprovedDashboardLayoutProps) {
  const pathname = usePathname();
  const deptInfo = departmentInfo[department];
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const isDashboardActive = pathname === `/dashboard/${department.toLowerCase()}`;
  const isHistoryActive = pathname === `/dashboard/${department.toLowerCase()}/history`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo/Brand */}
        <div className="p-6 border-b border-gray-200">
          <Link href="/" className="block">
            <h1 className="text-xl font-bold text-gray-900">Letter Custody</h1>
            <p className="text-xs text-gray-500 mt-1">System</p>
          </Link>
        </div>

        {/* Welcome Section */}
        <div className="p-4 border-b border-gray-200">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4">
            <p className="text-xs font-medium text-gray-500 mb-1">Welcome</p>
            <p className="text-sm font-semibold text-gray-900 truncate">{userName}</p>
            <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {department}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          <Link
            href={`/dashboard/${department.toLowerCase()}`}
            prefetch={true}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
              isDashboardActive
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span>Dashboard</span>
          </Link>
          
          {department !== 'Secretary' && (
            <Link
              href={`/dashboard/${department.toLowerCase()}/history`}
              prefetch={true}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isHistoryActive
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>History</span>
            </Link>
          )}
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-gray-200">
          <div className="mb-3">
            <p className="text-sm font-medium text-gray-900 truncate">{userName}</p>
            <p className="text-xs text-gray-500 truncate">{userEmail}</p>
          </div>
          <LogoutButton />
        </div>
      </aside>

      {/* Main Content */}
      <div className="ml-64">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{deptInfo.name}</h1>
                <p className="text-sm text-gray-500 mt-1">{currentDate}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{userName}</p>
                  <p className="text-xs text-gray-500">{department}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
