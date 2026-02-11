import { Letter } from '@/types';
import { LETTER_STATUS_LABELS, LETTER_STATUS_COLORS } from '@/lib/stateMachine';

interface LetterCardProps {
  letter: Letter;
  children?: React.ReactNode;
}

export function LetterCard({ letter, children }: LetterCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-gray-900">
              {letter.serial_number || 'No Serial Number'}
            </h3>
            {letter.is_archived && (
              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                Archived
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 mt-1">{letter.subject}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${LETTER_STATUS_COLORS[letter.status]}`}>
          {LETTER_STATUS_LABELS[letter.status]}
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
        <div>
          <span className="text-gray-500">Current Department:</span>
          <p className="font-medium text-gray-900">{letter.current_department || 'None'}</p>
        </div>
        {letter.amount && (
          <div>
            <span className="text-gray-500">Amount:</span>
            <p className="font-medium text-gray-900">
              {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(letter.amount)}
            </p>
          </div>
        )}
        {letter.date_generated && (
          <div>
            <span className="text-gray-500">Date Generated:</span>
            <p className="font-medium text-gray-900">
              {new Date(letter.date_generated).toLocaleDateString()}
            </p>
          </div>
        )}
        {letter.date_minuted && (
          <div>
            <span className="text-gray-500">Date Minuted:</span>
            <p className="font-medium text-gray-900">
              {new Date(letter.date_minuted).toLocaleDateString()}
            </p>
          </div>
        )}
        {letter.date_received && (
          <div>
            <span className="text-gray-500">Date Received:</span>
            <p className="font-medium text-gray-900">
              {new Date(letter.date_received).toLocaleDateString()}
            </p>
          </div>
        )}
        <div>
          <span className="text-gray-500">Dispatch Date:</span>
          <p className="font-medium text-gray-900">
            {new Date(letter.dispatch_date).toLocaleDateString()}
          </p>
        </div>
        {letter.pv_id && (
          <div>
            <span className="text-gray-500">PV ID:</span>
            <p className="font-medium text-gray-900">{letter.pv_id}</p>
          </div>
        )}
        <div>
          <span className="text-gray-500">Created:</span>
          <p className="font-medium text-gray-900">
            {new Date(letter.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>
      
      {children && (
        <div className="flex gap-2 pt-4 border-t border-gray-200">
          {children}
        </div>
      )}
    </div>
  );
}
