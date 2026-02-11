import Link from 'next/link';
import { Profile } from '@/types';
import { LogoutButton } from './LogoutButton';

interface DashboardLayoutProps {
  user: Profile;
  children: React.ReactNode;
}

export function DashboardLayout({ user, children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-gray-900">
                Letter Custody System
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm">
                <span className="text-gray-500">Logged in as:</span>
                <span className="ml-2 font-medium text-gray-900">{user.username}</span>
              </div>
              <div className="text-sm">
                <span className="text-gray-500">Role:</span>
                <span className="ml-2 font-medium text-gray-900 capitalize">{user.role.replace('_', ' ')}</span>
              </div>
              {user.department && (
                <div className="text-sm">
                  <span className="text-gray-500">Department:</span>
                  <span className="ml-2 font-medium text-gray-900">{user.department}</span>
                </div>
              )}
              <LogoutButton />
            </div>
          </div>
        </div>
      </nav>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
