import { LetterStatus } from '@/types';

interface StatusBadgeProps {
  status: LetterStatus;
  size?: 'sm' | 'md';
}

const statusConfig: Record<LetterStatus, { label: string; className: string }> = {
  created: { label: 'Created', className: 'bg-gray-100 text-gray-700 border-gray-200' },
  dispatched: { label: 'Dispatched', className: 'bg-blue-100 text-blue-700 border-blue-200' },
  forwarded: { label: 'Forwarded', className: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
  received: { label: 'Received', className: 'bg-green-100 text-green-700 border-green-200' },
  processing: { label: 'Processing', className: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  processed: { label: 'Processed', className: 'bg-purple-100 text-purple-700 border-purple-200' },
  rejected: { label: 'Rejected', className: 'bg-red-100 text-red-700 border-red-200' },
  archived: { label: 'Archived', className: 'bg-slate-100 text-slate-700 border-slate-200' },
};

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status];
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${config.className} ${sizeClasses}`}
    >
      {config.label}
    </span>
  );
}
