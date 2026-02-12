'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from '@/app/actions/authActions';

export function LogoutButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogout() {
    setLoading(true);
    await signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-knust-green-600 hover:bg-knust-green-700 rounded-lg disabled:bg-knust-gray-400 transition-colors duration-200"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
      </svg>
      {loading ? 'Signing out...' : 'Sign Out'}
    </button>
  );
}
