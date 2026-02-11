'use client';

import { useEffect, useState } from 'react';
import { Letter, Movement, ProcessingNote } from '@/types';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { DepartmentBadge } from '@/components/ui/DepartmentBadge';
import { createClient } from '@/lib/supabase/client';

interface LetterDetailPanelProps {
  letter: Letter;
  movements?: Movement[];
  notes?: ProcessingNote[];
  isOpen: boolean;
  onClose: () => void;
  actions?: React.ReactNode;
}

export function LetterDetailPanel({
  letter,
  movements = [],
  notes: initialNotes = [],
  isOpen,
  onClose,
  actions,
}: LetterDetailPanelProps) {
  const [notes, setNotes] = useState<ProcessingNote[]>(initialNotes);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [allMovements, setAllMovements] = useState<Movement[]>(movements);
  const [loadingMovements, setLoadingMovements] = useState(false);

  // Fetch notes and movements directly from Supabase when panel opens
  useEffect(() => {
    if (isOpen && letter) {
      setLoadingNotes(true);
      setLoadingMovements(true);
      const supabase = createClient();
      
      const fetchData = async () => {
        // Fetch notes
        const { data: notesData, error: notesError } = await supabase
          .from('processing_notes')
          .select('*')
          .eq('letter_id', letter.id)
          .order('created_at', { ascending: true });
        
        if (notesError) {
          console.error('Failed to load notes:', notesError);
        } else if (notesData) {
          setNotes(notesData as ProcessingNote[]);
        }
        setLoadingNotes(false);

        // Fetch movements
        const { data: movementsData, error: movementsError } = await supabase
          .from('movements')
          .select('*')
          .eq('letter_id', letter.id)
          .order('created_at', { ascending: true });
        
        if (movementsError) {
          console.error('Failed to load movements:', movementsError);
        } else if (movementsData) {
          setAllMovements(movementsData as Movement[]);
        }
        setLoadingMovements(false);
      };
      
      fetchData();
    }
  }, [isOpen, letter]);

  if (!isOpen) return null;

  const formatDate = (date: string | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      
      <div className="absolute right-0 top-0 h-full w-full max-w-2xl bg-white shadow-xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-gray-900">Letter Details</h2>
              <StatusBadge status={letter.status} size="sm" />
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

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            {/* Subject */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl font-bold text-gray-900">
                  {letter.subject}
                </span>
              </div>
            </div>

            {/* Serial Number & ID */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Serial Number</h3>
              <p className="text-sm text-gray-900">{letter.serial_number || 'No Serial Number'}</p>
              <p className="text-xs text-gray-500 font-mono mt-1">{letter.id}</p>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 gap-4">
              {letter.amount && (
                <div>
                  <p className="text-sm text-gray-500">Amount</p>
                  <p className="text-base font-medium text-gray-900">
                    GH₵ {letter.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              )}
              {letter.pv_id && (
                <div>
                  <p className="text-sm text-gray-500">PV Number</p>
                  <p className="text-base font-medium text-gray-900">{letter.pv_id}</p>
                </div>
              )}
              <div>
                <h3 className="text-xs font-medium text-gray-500 mb-1">Date Generated</h3>
                <p className="text-sm text-gray-900">{formatDate(letter.date_generated)}</p>
              </div>
              <div>
                <h3 className="text-xs font-medium text-gray-500 mb-1">Date Minuted</h3>
                <p className="text-sm text-gray-900">{formatDate(letter.date_minuted)}</p>
              </div>
              <div>
                <h3 className="text-xs font-medium text-gray-500 mb-1">Date Received</h3>
                <p className="text-sm text-gray-900">{formatDate(letter.date_received)}</p>
              </div>
              <div>
                <h3 className="text-xs font-medium text-gray-500 mb-1">Dispatch Date</h3>
                <p className="text-sm text-gray-900">{formatDate(letter.dispatch_date)}</p>
              </div>
            </div>

            {/* Dispatch History - Full Movement Trail */}
            {loadingMovements ? (
              <div className="border-t border-gray-200 pt-6">
                <div className="text-sm text-gray-500 text-center">Loading dispatch history...</div>
              </div>
            ) : allMovements.length > 0 && (
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Dispatch History</h3>
                <div className="space-y-3">
                  {allMovements.map((movement, index) => (
                    <div key={movement.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`w-2 h-2 rounded-full ${
                          movement.status === 'received' ? 'bg-green-500' :
                          movement.status === 'rejected' ? 'bg-red-500' :
                          'bg-blue-500'
                        }`} />
                        {index < allMovements.length - 1 && (
                          <div className="w-0.5 h-12 bg-gray-200 mt-1" />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-center gap-2 mb-1">
                          {movement.from_department && (
                            <>
                              <DepartmentBadge department={movement.from_department} size="sm" />
                              <span className="text-gray-400">→</span>
                            </>
                          )}
                          <DepartmentBadge department={movement.to_department} size="sm" />
                          <span className={`text-xs font-medium ${
                            movement.status === 'received' ? 'text-green-600' :
                            movement.status === 'rejected' ? 'text-red-600' :
                            'text-blue-600'
                          }`}>
                            {movement.status.charAt(0).toUpperCase() + movement.status.slice(1)}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 space-y-0.5">
                          <p>Dispatched: {formatDateTime(movement.dispatched_at)}</p>
                          {movement.received_at && (
                            <p>Received: {formatDateTime(movement.received_at)}</p>
                          )}
                        </div>
                        {movement.rejection_reason && (
                          <p className="text-xs text-red-600 mt-1 italic">
                            Reason: {movement.rejection_reason}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Processing Notes */}
            {loadingNotes ? (
              <div className="border-t border-gray-200 pt-6">
                <div className="text-sm text-gray-500 text-center">Loading notes...</div>
              </div>
            ) : notes.length > 0 ? (
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Processing Notes</h3>
                <div className="space-y-2">
                  {notes.map((note) => (
                    <div key={note.id} className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                      <div className="flex items-start justify-between mb-2">
                        <DepartmentBadge department={note.department} size="sm" />
                        <span className="text-xs text-gray-500">
                          {formatDateTime(note.created_at)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-900 whitespace-pre-wrap">{note.note}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Timestamps */}
            <div className="pt-4 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-gray-500">Created:</span>
                  <p className="text-gray-900 mt-0.5">{formatDateTime(letter.created_at)}</p>
                </div>
                <div>
                  <span className="text-gray-500">Last Updated:</span>
                  <p className="text-gray-900 mt-0.5">{formatDateTime(letter.updated_at)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions Footer */}
          {actions && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
