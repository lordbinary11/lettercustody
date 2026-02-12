'use client';

import { useState } from 'react';

interface DepartmentSelectProps {
  onDepartmentSelect: (department: string) => void;
  selectedCount: number;
  disabled?: boolean;
}

export function DepartmentSelect({ onDepartmentSelect, selectedCount, disabled = false }: DepartmentSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState('');

  const departments = [
    { value: 'Secretary', label: 'Secretary' },
    { value: 'Budget', label: 'Budget' },
    { value: 'Payables', label: 'Payables' },
    { value: 'Payroll', label: 'Payroll' },
    { value: 'StudentSection', label: 'Student Section' },
    { value: 'CashOffice', label: 'Cash Office' },
    { value: 'FinalAccounts', label: 'Final Accounts' },
    { value: 'Audit', label: 'Audit' }
  ];

  const handleSelect = (department: string) => {
    setSelectedDepartment(department);
    setIsOpen(false);
    onDepartmentSelect(department);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors text-sm flex items-center gap-2"
      >
        {disabled ? 'Processing...' : `Forward ${selectedCount} to Department`}
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-2">
            <div className="text-sm font-medium text-gray-700 mb-2">Select Target Department:</div>
            <div className="space-y-1">
              {departments.map((dept) => (
                <button
                  key={dept.value}
                  onClick={() => handleSelect(dept.value)}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                >
                  {dept.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
