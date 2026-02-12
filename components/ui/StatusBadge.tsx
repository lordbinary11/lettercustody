import { LetterStatus } from '@/types';

interface StatusBadgeProps {
  status: LetterStatus | string;
  size?: 'sm' | 'md';
}

const statusConfig: Record<string, { label: string; className: string }> = {
  new: { label: 'New', className: 'bg-knust-gray-100 text-knust-gray-700 border-knust-gray-300' },
  created: { label: 'New', className: 'bg-knust-gray-100 text-knust-gray-700 border-knust-gray-300' },
  dispatched: { label: 'Dispatched', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  forwarded: { label: 'Forwarded', className: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  processing: { label: 'Processing', className: 'bg-knust-yellow-100 text-knust-yellow-800 border-knust-yellow-300' },
  processed: { label: 'Processed', className: 'bg-purple-50 text-purple-700 border-purple-200' },
  rejected: { label: 'Rejected', className: 'bg-knust-red-50 text-knust-red-700 border-knust-red-200' },
  archived: { label: 'Archived', className: 'bg-knust-gray-100 text-knust-gray-600 border-knust-gray-300' },
  received: { label: 'Processing', className: 'bg-knust-yellow-100 text-knust-yellow-800 border-knust-yellow-300' },
};

const defaultConfig = { label: 'Unknown', className: 'bg-gray-100 text-gray-700 border-gray-300' };

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status] || defaultConfig;
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full border uppercase tracking-wide ${config.className} ${sizeClasses}`}
    >
      {config.label}
    </span>
  );
}
