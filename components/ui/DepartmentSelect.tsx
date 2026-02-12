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
        className="px-4 py-2.5 bg-knust-green-500 hover:bg-knust-green-700 disabled:bg-knust-gray-400 text-white font-medium rounded-lg transition-colors duration-200 text-sm flex items-center gap-2 shadow-sm"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
        {disabled ? 'Processing...' : `Forward ${selectedCount} to Department`}
        <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-knust-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
          <div className="p-3 bg-knust-gray-50 border-b border-knust-gray-200">
            <p className="text-xs font-semibold text-knust-gray-600 uppercase tracking-wide">Select Target Department</p>
          </div>
          <div className="py-1 max-h-64 overflow-y-auto">
            {departments.map((dept) => (
              <button
                key={dept.value}
                onClick={() => handleSelect(dept.value)}
                className="w-full text-left px-4 py-2.5 text-sm text-knust-gray-700 hover:bg-knust-green-50 hover:text-knust-green-700 transition-colors flex items-center gap-3"
              >
                <span className="w-2 h-2 rounded-full bg-knust-green-500"></span>
                {dept.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
