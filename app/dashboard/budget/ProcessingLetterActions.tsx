'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { addProcessingNote, completeProcessing } from '@/app/actions/letterActions';

interface ProcessingLetterActionsProps {
  letterId: string;
  onSuccess?: () => void;
}

export function ProcessingLetterActions({ letterId, onSuccess }: ProcessingLetterActionsProps) {
  const [showNote, setShowNote] = useState(false);
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleAddNote() {
    if (!note || note.length < 5) {
      setError('Note must be at least 5 characters');
      return;
    }

    setError(null);
    setLoading(true);

    const formData = new FormData();
    formData.append('letter_id', letterId);
    formData.append('note', note);

    const result = await addProcessingNote(formData);

    setLoading(false);

    if (result.success) {
      setNote('');
      setShowNote(false);
      router.refresh();
    } else {
      setError(result.error || 'Failed to add note');
    }
  }

  async function handleComplete() {
    setError(null);
    setLoading(true);

    const formData = new FormData();
    formData.append('letter_id', letterId);

    const result = await completeProcessing(formData);

    setLoading(false);

    if (result.success) {
      onSuccess?.();
      router.refresh();
    } else {
      setError(result.error || 'Failed to mark letter as processed');
    }
  }

  return (
    <div className="space-y-3 w-full">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-3 py-2 rounded text-sm">
          {error}
        </div>
      )}

      {showNote ? (
        <>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            rows={3}
            placeholder="Add processing notes (optional)"
          />
          <div className="flex gap-2">
            <button
              onClick={handleAddNote}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-medium rounded-md"
            >
              {loading ? 'Adding...' : 'Add Note'}
            </button>
            <button
              onClick={() => {
                setShowNote(false);
                setNote('');
                setError(null);
              }}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium rounded-md"
            >
              Cancel
            </button>
          </div>
        </>
      ) : (
        <div className="flex gap-2">
          <button
            onClick={() => setShowNote(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md"
          >
            Add Note
          </button>
          <button
            onClick={handleComplete}
            disabled={loading}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white text-sm font-medium rounded-md"
          >
            {loading ? 'Completing...' : 'Mark as Processed'}
          </button>
        </div>
      )}
    </div>
  );
}
