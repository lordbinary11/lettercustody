'use client';

import { useState } from 'react';
import { Department } from '@/types';
import { DepartmentBadge } from '@/components/ui/DepartmentBadge';

interface BatchDispatchModalProps {
  batchId: string;
  batchName: string;
  letterCount: number;
  onClose: () => void;
  onSuccess: () => void;
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

export function BatchDispatchModal({
  batchId,
  batchName,
  letterCount,
  onClose,
  onSuccess,
}: BatchDispatchModalProps) {
  const [selectedDept, setSelectedDept] = useState<Department | ''>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDispatch() {
    if (!selectedDept) {
      setError('Please select a department');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/letters/batch/dispatch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          batchId,
          targetDepartment: selectedDept,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to dispatch batch');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to dispatch batch letters');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Dispatch Batch Letters</h2>
            <p className="text-sm text-gray-500 mt-1">
              {batchName} • {letterCount} letter{letterCount !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Bulk Dispatch</p>
                <p>All {letterCount} letters in this batch will be dispatched to the selected department simultaneously.</p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Target Department
            </label>
            <div className="grid grid-cols-2 gap-3">
              {DEPARTMENTS.map((dept) => (
                <button
                  key={dept}
                  type="button"
                  onClick={() => setSelectedDept(dept)}
                  className={`p-4 text-left border-2 rounded-lg transition-all ${
                    selectedDept === dept
                      ? 'border-knust-green-500 bg-knust-green-50 ring-2 ring-knust-green-200'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <DepartmentBadge department={dept} size="sm" />
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDispatch}
              disabled={loading || !selectedDept}
              className="flex-1 px-6 py-3 bg-knust-green-600 text-white rounded-lg hover:bg-knust-green-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Dispatching...' : `Dispatch ${letterCount} Letters`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
