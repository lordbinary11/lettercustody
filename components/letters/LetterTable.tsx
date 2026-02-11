'use client';

import { useState } from 'react';
import { Letter } from '@/types';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { DepartmentBadge } from '@/components/ui/DepartmentBadge';

interface LetterTableProps {
  letters: Letter[];
  onRowClick?: (letter: Letter) => void;
  showDepartment?: boolean;
  emptyMessage?: string;
}

export function LetterTable({ 
  letters, 
  onRowClick, 
  showDepartment = false,
  emptyMessage = 'No letters found'
}: LetterTableProps) {
  const formatDate = (date: string | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatAmount = (amount: number | null) => {
    if (!amount) return '-';
    return `GH₵ ${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(date);
  };

  if (letters.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Letter
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              {showDepartment && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
              )}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Updated
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {letters.map((letter) => (
              <tr
                key={letter.id}
                onClick={() => onRowClick?.(letter)}
                className={`hover:bg-gray-50 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
              >
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900">
                      {letter.serial_number || 'No Serial'}
                    </span>
                    <span className="text-sm text-gray-500 line-clamp-1">
                      {letter.subject}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={letter.status} size="sm" />
                </td>
                {showDepartment && letter.current_department && (
                  <td className="px-6 py-4">
                    <DepartmentBadge department={letter.current_department} size="sm" />
                  </td>
                )}
                <td className="px-6 py-4 text-sm text-gray-900">
                  {formatAmount(letter.amount)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {getTimeAgo(letter.updated_at)}
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRowClick?.(letter);
                    }}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View →
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
