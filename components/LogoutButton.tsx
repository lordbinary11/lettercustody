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
      className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md disabled:bg-red-300"
    >
      {loading ? 'Logging out...' : 'Logout'}
    </button>
  );
}
