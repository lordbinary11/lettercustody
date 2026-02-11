'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { receiveLetter, rejectLetter } from '@/app/actions/letterActions';

interface IncomingLetterActionsProps {
  letterId: string;
  movementId: string;
  onSuccess?: () => void;
}

export function IncomingLetterActions({ letterId, movementId, onSuccess }: IncomingLetterActionsProps) {
  const [showReject, setShowReject] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleReceive() {
    setError(null);
    setLoading(true);

    const formData = new FormData();
    formData.append('letter_id', letterId);
    formData.append('movement_id', movementId);

    const result = await receiveLetter(formData);

    setLoading(false);

    if (result.success) {
      onSuccess?.();
      router.refresh();
    } else {
      setError(result.error || 'Failed to receive letter');
    }
  }

  async function handleReject() {
    if (!rejectionReason || rejectionReason.length < 10) {
      setError('Rejection reason must be at least 10 characters');
      return;
    }

    setError(null);
    setLoading(true);

    const formData = new FormData();
    formData.append('letter_id', letterId);
    formData.append('movement_id', movementId);
    formData.append('rejection_reason', rejectionReason);

    const result = await rejectLetter(formData);

    setLoading(false);

    if (result.success) {
      onSuccess?.();
      router.refresh();
    } else {
      setError(result.error || 'Failed to reject letter');
    }
  }

  return (
    <div className="space-y-3 w-full">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-3 py-2 rounded text-sm">
          {error}
        </div>
      )}

      {showReject ? (
        <>
          <textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Enter rejection reason (min 10 characters)..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
          <div className="flex gap-2">
            <button
              onClick={handleReject}
              disabled={loading}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white text-sm font-medium rounded-md"
            >
              {loading ? 'Rejecting...' : 'Confirm Rejection'}
            </button>
            <button
              onClick={() => {
                setShowReject(false);
                setRejectionReason('');
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
            onClick={handleReceive}
            disabled={loading}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white text-sm font-medium rounded-md"
          >
            {loading ? 'Accepting...' : 'Accept'}
          </button>
          <button
            onClick={() => setShowReject(true)}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md"
          >
            Reject
          </button>
        </div>
      )}
    </div>
  );
}
