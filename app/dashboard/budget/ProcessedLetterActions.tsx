'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { forwardLetter } from '@/app/actions/letterActions';
import { Department } from '@/types';

interface ProcessedLetterActionsProps {
  letterId: string;
  onSuccess?: () => void;
}

const ALL_FORWARD_DEPARTMENTS: Department[] = ['Budget', 'Payables', 'Payroll', 'StudentSection', 'CashOffice', 'FinalAccounts', 'Audit'];

export function ProcessedLetterActions({ letterId, onSuccess }: ProcessedLetterActionsProps) {
  // Filter out Budget department from forward options
  const FORWARD_DEPARTMENTS = ALL_FORWARD_DEPARTMENTS.filter(dept => dept !== 'Budget');
  const [showForward, setShowForward] = useState(false);
  const [selectedDept, setSelectedDept] = useState<Department | ''>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleForward() {
    if (!selectedDept) {
      setError('Please select a department');
      return;
    }

    setError(null);
    setLoading(true);

    const formData = new FormData();
    formData.append('letter_id', letterId);
    formData.append('to_department', selectedDept);

    const result = await forwardLetter(formData);

    setLoading(false);

    if (result.success) {
      onSuccess?.();
      router.refresh();
    } else {
      setError(result.error || 'Failed to forward letter');
    }
  }

  return (
    <div className="space-y-3 w-full">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-3 py-2 rounded text-sm">
          {error}
        </div>
      )}

      {showForward ? (
        <>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value as Department)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
          >
            <option value="">Select department...</option>
            {FORWARD_DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
          <div className="flex gap-2">
            <button
              onClick={handleForward}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-medium rounded-md"
            >
              {loading ? 'Forwarding...' : 'Confirm Forward'}
            </button>
            <button
              onClick={() => {
                setShowForward(false);
                setSelectedDept('');
                setError(null);
              }}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium rounded-md"
            >
              Cancel
            </button>
          </div>
        </>
      ) : (
        <button
          onClick={() => setShowForward(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md"
        >
          Forward to Department
        </button>
      )}
    </div>
  );
}
