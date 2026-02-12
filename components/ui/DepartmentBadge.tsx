import { Department } from '@/types';

interface DepartmentBadgeProps {
  department: Department;
  size?: 'sm' | 'md';
}

const departmentConfig: Record<Department, { label: string; className: string }> = {
  Secretary: { label: 'Secretary', className: 'bg-knust-gray-100 text-knust-gray-700 border-knust-gray-300' },
  Budget: { label: 'Budget', className: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  Payables: { label: 'Payables', className: 'bg-knust-green-50 text-knust-green-700 border-knust-green-200' },
  Payroll: { label: 'Payroll', className: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  StudentSection: { label: 'Student Section', className: 'bg-knust-yellow-100 text-knust-yellow-800 border-knust-yellow-300' },
  CashOffice: { label: 'Cash Office', className: 'bg-teal-50 text-teal-700 border-teal-200' },
  FinalAccounts: { label: 'Final Accounts', className: 'bg-violet-50 text-violet-700 border-violet-200' },
  Audit: { label: 'Audit', className: 'bg-knust-red-50 text-knust-red-700 border-knust-red-200' },
};

export function DepartmentBadge({ department, size = 'md' }: DepartmentBadgeProps) {
  const config = departmentConfig[department];
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-md border uppercase tracking-wide ${config.className} ${sizeClasses}`}
    >
      {config.label}
    </span>
  );
}
