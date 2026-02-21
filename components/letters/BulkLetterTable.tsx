'use client';

import { useState, useMemo } from 'react';
import { Letter } from '@/types';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { DepartmentBadge } from '@/components/ui/DepartmentBadge';
import { DepartmentSelect } from '@/components/ui/DepartmentSelect';

interface BulkAction {
  label: string;
  action: (letterIds: string[]) => void;
  icon?: string;
  variant?: 'default' | 'danger';
}

interface BulkLetterTableProps {
  letters: Letter[];
  onRowClick?: (letter: Letter) => void;
  showDepartment?: boolean;
  emptyMessage?: string;
  showBulkActions?: boolean;
  onBulkAccept?: (letterIds: string[]) => void;
  onBulkReject?: (letterIds: string[]) => void;
  onBulkProcess?: (letterIds: string[]) => void;
  onBulkForward?: (letterIds: string[], targetDepartment: string) => void;
  onBulkForwardToDepartment?: (letterIds: string[], targetDepartment: string) => void;
  bulkActions?: BulkAction[];
  isBulkLoading?: boolean;
  bulkActionType?: 'accept-reject' | 'process' | 'forward' | 'forward-custom';
}

type SortField = 'serial_number' | 'subject' | 'status' | 'amount' | 'updated_at';
type SortDirection = 'asc' | 'desc';

export function BulkLetterTable({ 
  letters, 
  onRowClick, 
  bulkActions,
  showDepartment = false,
  emptyMessage = 'No letters found',
  showBulkActions = false,
  onBulkAccept,
  onBulkReject,
  onBulkProcess,
  onBulkForward,
  onBulkForwardToDepartment,
  isBulkLoading = false,
  bulkActionType = 'accept-reject'
}: BulkLetterTableProps) {
  const [sortField, setSortField] = useState<SortField>('updated_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedLetters, setSelectedLetters] = useState<Set<string>>(new Set());

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

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedLetters = useMemo(() => {
    const sorted = [...letters].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'serial_number':
          aValue = a.serial_number || '';
          bValue = b.serial_number || '';
          break;
        case 'subject':
          aValue = a.subject;
          bValue = b.subject;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'amount':
          aValue = a.amount || 0;
          bValue = b.amount || 0;
          break;
        case 'updated_at':
          aValue = new Date(a.updated_at).getTime();
          bValue = new Date(b.updated_at).getTime();
          break;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [letters, sortField, sortDirection]);

  const handleSelectLetter = (letterId: string, checked: boolean) => {
    const newSelected = new Set(selectedLetters);
    if (checked) {
      newSelected.add(letterId);
    } else {
      newSelected.delete(letterId);
    }
    setSelectedLetters(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedLetters(new Set(filteredAndSortedLetters.map(letter => letter.id)));
    } else {
      setSelectedLetters(new Set());
    }
  };

  const handleBulkAccept = () => {
    if (onBulkAccept && selectedLetters.size > 0) {
      onBulkAccept(Array.from(selectedLetters));
    }
  };

  const handleBulkReject = () => {
    if (onBulkReject && selectedLetters.size > 0) {
      onBulkReject(Array.from(selectedLetters));
    }
  };

  const handleBulkProcess = () => {
    if (onBulkProcess && selectedLetters.size > 0) {
      onBulkProcess(Array.from(selectedLetters));
    }
  };

  const handleBulkForward = () => {
    if (onBulkForward && selectedLetters.size > 0) {
      const departments = ['Secretary', 'Budget', 'Payables', 'Payroll', 'StudentSection', 'CashOffice', 'FinalAccounts', 'Audit'];
      const targetDepartment = prompt('Select target department:\n' + departments.map((dept, index) => `${index + 1}. ${dept}`).join('\n'));
      
      if (targetDepartment && departments.includes(targetDepartment)) {
        onBulkForward(Array.from(selectedLetters), targetDepartment);
      } else if (targetDepartment) {
        alert('Invalid department selected');
      }
    }
  };

  const handleBulkForwardToDepartment = () => {
    if (onBulkForwardToDepartment && selectedLetters.size > 0) {
      onBulkForwardToDepartment(Array.from(selectedLetters), '');
    }
  };

  const isAllSelected = filteredAndSortedLetters.length > 0 && 
    selectedLetters.size === filteredAndSortedLetters.length;
  const isSomeSelected = selectedLetters.size > 0 && selectedLetters.size < filteredAndSortedLetters.length;

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    return sortDirection === 'asc' ? (
      <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  return (
    <div className="space-y-4">
      {/* Bulk Actions Bar */}
      {showBulkActions && selectedLetters.size > 0 && (
        <div className="bg-knust-green-50 border border-knust-green-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-knust-green-800">
                {selectedLetters.size} letter{selectedLetters.size !== 1 ? 's' : ''} selected
              </span>
              <button
                onClick={() => setSelectedLetters(new Set())}
                className="text-sm text-knust-green-600 hover:text-knust-green-800 font-medium"
              >
                Clear selection
              </button>
            </div>
            <div className="flex items-center gap-2">
              {bulkActionType === 'accept-reject' && (
                <>
                  <button
                    onClick={handleBulkAccept}
                    disabled={isBulkLoading}
                    className="px-4 py-2.5 bg-knust-green-500 hover:bg-knust-green-700 disabled:bg-knust-gray-400 text-white font-medium rounded-lg transition-colors text-sm shadow-sm"
                  >
                    {isBulkLoading ? 'Processing...' : `Accept All (${selectedLetters.size})`}
                  </button>
                  <button
                    onClick={handleBulkReject}
                    disabled={isBulkLoading}
                    className="px-4 py-2.5 bg-knust-red-500 hover:bg-knust-red-700 disabled:bg-knust-gray-400 text-white font-medium rounded-lg transition-colors text-sm shadow-sm"
                  >
                    {isBulkLoading ? 'Processing...' : `Reject All (${selectedLetters.size})`}
                  </button>
                </>
              )}
              {bulkActionType === 'process' && (
                <>
                  <button
                    onClick={handleBulkProcess}
                    disabled={isBulkLoading}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-knust-gray-400 text-white font-medium rounded-lg transition-colors text-sm shadow-sm"
                  >
                    {isBulkLoading ? 'Processing...' : `Mark Processed (${selectedLetters.size})`}
                  </button>
                </>
              )}
              {bulkActionType === 'forward' && (
                <button
                  onClick={handleBulkForward}
                  disabled={isBulkLoading}
                  className="px-4 py-2.5 bg-knust-green-500 hover:bg-knust-green-700 disabled:bg-knust-gray-400 text-white font-medium rounded-lg transition-colors text-sm shadow-sm"
                >
                  {isBulkLoading ? 'Processing...' : `Forward All (${selectedLetters.size})`}
                </button>
              )}
              {bulkActionType === 'forward-custom' && (
                <DepartmentSelect
                  onDepartmentSelect={(department) => {
                    if (onBulkForwardToDepartment && selectedLetters.size > 0) {
                      onBulkForwardToDepartment(Array.from(selectedLetters), department);
                    }
                  }}
                  selectedCount={selectedLetters.size}
                  disabled={isBulkLoading}
                />
              )}
              {bulkActions && bulkActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => action.action(Array.from(selectedLetters))}
                  disabled={isBulkLoading}
                  className={`px-4 py-2.5 font-medium rounded-lg transition-colors text-sm shadow-sm ${
                    action.variant === 'danger'
                      ? 'bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white'
                      : 'bg-knust-green-500 hover:bg-knust-green-700 disabled:bg-gray-400 text-white'
                  }`}
                >
                  {action.label} ({selectedLetters.size})
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      {filteredAndSortedLetters.length === 0 ? (
        <div className="bg-white rounded-xl border border-knust-gray-200 p-12 text-center">
          <svg className="w-12 h-12 mx-auto text-knust-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <p className="text-knust-gray-500">{emptyMessage}</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-knust-gray-200 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-knust-gray-50 border-b border-knust-gray-200">
                <tr>
                  {showBulkActions && (
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        ref={(input) => {
                          if (input) {
                            input.indeterminate = isSomeSelected;
                          }
                        }}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </th>
                  )}
                  <th 
                    onClick={() => handleSort('serial_number')}
                    className="px-6 py-3 text-left text-xs font-semibold text-knust-gray-600 uppercase tracking-wider cursor-pointer hover:bg-knust-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      Serial No.
                      <SortIcon field="serial_number" />
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('status')}
                    className="px-6 py-3 text-left text-xs font-semibold text-knust-gray-600 uppercase tracking-wider cursor-pointer hover:bg-knust-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      Status
                      <SortIcon field="status" />
                    </div>
                  </th>
                  {showDepartment && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department
                    </th>
                  )}
                  <th 
                    onClick={() => handleSort('amount')}
                    className="px-6 py-3 text-left text-xs font-semibold text-knust-gray-600 uppercase tracking-wider cursor-pointer hover:bg-knust-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      Amount
                      <SortIcon field="amount" />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    PV Number
                  </th>
                  <th 
                    onClick={() => handleSort('updated_at')}
                    className="px-6 py-3 text-left text-xs font-semibold text-knust-gray-600 uppercase tracking-wider cursor-pointer hover:bg-knust-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      Last Updated
                      <SortIcon field="updated_at" />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredAndSortedLetters.map((letter) => (
                  <tr
                    key={letter.id}
                    onClick={() => onRowClick?.(letter)}
                    className="hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-100"
                  >
                    {showBulkActions && (
                      <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedLetters.has(letter.id)}
                          onChange={(e) => handleSelectLetter(letter.id, e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-medium text-knust-black truncate max-w-xs">{letter.subject}</span>
                        <span className="text-sm text-knust-gray-500 truncate max-w-xs">{letter.serial_number || 'No Serial'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={letter.status} size="sm" />
                    </td>
                    {showDepartment && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        {letter.current_department ? (
                          <DepartmentBadge department={letter.current_department} size="sm" />
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </td>
                    )}
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                      {letter.amount ? (
                        `GH₵ ${letter.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                      {letter.pv_id || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                      {getTimeAgo(letter.updated_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1">
                        View
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
