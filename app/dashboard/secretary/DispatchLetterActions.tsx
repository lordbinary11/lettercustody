'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { dispatchLetter } from '@/app/actions/letterActions';
import { Department } from '@/types';
import { useToast } from '@/components/ui/Toast';
import { DepartmentBadge } from '@/components/ui/DepartmentBadge';

interface DispatchLetterActionsProps {
  letterId: string;
  onSuccess?: () => void;
}

const DEPARTMENTS: Department[] = [
  'Budget',
  'Payables',
  'Payroll',
  'StudentSection',
  'CashOffice',
  'FinalAccounts',
  'Audit',
];

export function DispatchLetterActions({ letterId, onSuccess }: DispatchLetterActionsProps) {
  const [selectedDept, setSelectedDept] = useState<Department | ''>('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { showToast } = useToast();

  async function handleDispatch() {
    if (!selectedDept) {
      showToast('Please select a department', 'warning');
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append('letter_id', letterId);
    formData.append('to_department', selectedDept);

    const result = await dispatchLetter(formData);

    setLoading(false);

    if (result.success) {
      showToast(`Letter dispatched to ${selectedDept} successfully`, 'success');
      onSuccess?.();
      router.refresh();
    } else {
      showToast(result.error || 'Failed to dispatch letter', 'error');
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Department
        </label>
        <div className="grid grid-cols-2 gap-2">
          {DEPARTMENTS.map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`p-3 text-left border rounded-lg transition-all ${
                selectedDept === dept
                  ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <DepartmentBadge department={dept} size="sm" />
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleDispatch}
        disabled={loading || !selectedDept}
        className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-medium rounded-lg transition-colors"
      >
        {loading ? 'Dispatching...' : 'Dispatch Letter'}
      </button>
    </div>
  );
}
