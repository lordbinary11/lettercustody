import { Department } from '@/types';

interface DepartmentBadgeProps {
  department: Department;
  size?: 'sm' | 'md';
}

const departmentConfig: Record<Department, { label: string; className: string }> = {
  Secretary: { label: 'Secretary', className: 'bg-slate-100 text-slate-700 border-slate-200' },
  Budget: { label: 'Budget', className: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
  Payables: { label: 'Payables', className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  Payroll: { label: 'Payroll', className: 'bg-cyan-100 text-cyan-700 border-cyan-200' },
  StudentSection: { label: 'Student Section', className: 'bg-amber-100 text-amber-700 border-amber-200' },
  CashOffice: { label: 'Cash Office', className: 'bg-teal-100 text-teal-700 border-teal-200' },
  FinalAccounts: { label: 'Final Accounts', className: 'bg-violet-100 text-violet-700 border-violet-200' },
  Audit: { label: 'Audit', className: 'bg-rose-100 text-rose-700 border-rose-200' },
};

export function DepartmentBadge({ department, size = 'md' }: DepartmentBadgeProps) {
  const config = departmentConfig[department];
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-0.5 text-xs';

  return (
    <span
      className={`inline-flex items-center font-medium rounded border ${config.className} ${sizeClasses}`}
    >
      {config.label}
    </span>
  );
}
