'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { LogoutButton } from '@/components/LogoutButton';
import { Department } from '@/types';

interface ImprovedDashboardLayoutProps {
  children: ReactNode;
  department: Department;
  userName: string;
  userEmail: string;
}

const departmentInfo: Record<Department, { name: string; shortName: string }> = {
  Secretary: { name: "Secretary's Office", shortName: 'Secretary' },
  Budget: { name: 'Budget Department', shortName: 'Budget' },
  Payables: { name: 'Payables Department', shortName: 'Payables' },
  Payroll: { name: 'Payroll Department', shortName: 'Payroll' },
  StudentSection: { name: 'Student Section', shortName: 'Students' },
  CashOffice: { name: 'Cash Office', shortName: 'Cash Office' },
  FinalAccounts: { name: 'Final Accounts', shortName: 'Final Accounts' },
  Audit: { name: 'Audit Department', shortName: 'Audit' },
};

export function ImprovedDashboardLayout({
  children,
  department,
  userName,
  userEmail,
}: ImprovedDashboardLayoutProps) {
  const pathname = usePathname();
  const deptInfo = departmentInfo[department];
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const isDashboardActive = pathname === `/dashboard/${department.toLowerCase()}`;
  const isHistoryActive = pathname === `/dashboard/${department.toLowerCase()}/history`;

  return (
    <div className="min-h-screen bg-knust-gray-100">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-full w-72 bg-white border-r border-knust-gray-200 flex flex-col z-50 transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Logo/Brand Header */}
        <div className="p-6 border-b border-knust-gray-200">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-knust-green-50 rounded-lg flex items-center justify-center overflow-hidden">
              <Image
                src="/assets/knust.png"
                alt="KNUST Logo"
                width={32}
                height={32}
                className="object-contain"
              />
            </div>
            <div>
              <h1 className="text-lg font-bold text-knust-black">KNUST PaperTrail</h1>
              <p className="text-xs text-knust-gray-500">Finance Office</p>
            </div>
          </Link>
        </div>

        {/* User Profile Section */}
        <div className="p-4 border-b border-knust-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-knust-green-600 flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-knust-black truncate">{userName}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-knust-green-100 text-knust-green-700">
                  {deptInfo.shortName}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-thin">
          <p className="px-3 py-2 text-xs font-semibold text-knust-gray-500 uppercase tracking-wider">
            Main Menu
          </p>
          
          <Link
            href={`/dashboard/${department.toLowerCase()}`}
            prefetch={true}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
              isDashboardActive
                ? 'bg-knust-green-600 text-white shadow-lg'
                : 'text-knust-gray-600 hover:bg-knust-gray-100 hover:text-knust-black'
            }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            <span>Dashboard</span>
          </Link>
          
          {department !== 'Secretary' && (
            <Link
              href={`/dashboard/${department.toLowerCase()}/history`}
              prefetch={true}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                isHistoryActive
                  ? 'bg-knust-green-600 text-white shadow-lg'
                  : 'text-knust-gray-600 hover:bg-knust-gray-100 hover:text-knust-black'
              }`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>History</span>
            </Link>
          )}
        </nav>

        {/* Footer with Logout */}
        <div className="p-4 border-t border-knust-gray-200 mt-auto">
          <LogoutButton />
          <div className="mt-4 text-center">
            <p className="text-xs text-knust-gray-500">
              © {new Date().getFullYear()} KNUST Finance Office
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-72">
        {/* Top Header Bar */}
        <header className="bg-white border-b border-knust-gray-200 sticky top-0 z-30">
          <div className="px-4 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              {/* Mobile menu button */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg text-knust-gray-600 hover:bg-knust-gray-100"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              {/* Page Title */}
              <div className="flex-1 lg:flex-none">
                <h1 className="text-xl lg:text-2xl font-bold text-knust-black">{deptInfo.name}</h1>
                <p className="text-sm text-knust-gray-500 hidden sm:block">{currentDate}</p>
              </div>

              {/* Right side - Notification only */}
              <div className="flex items-center gap-4">
                {/* Notification bell placeholder */}
                <button className="p-2 rounded-lg text-knust-gray-500 hover:bg-knust-gray-100 relative">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
