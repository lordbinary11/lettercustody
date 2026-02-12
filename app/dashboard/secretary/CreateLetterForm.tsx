'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createLetter } from '@/app/actions/letterActions';
import { useToast } from '@/components/ui/Toast';

export function CreateLetterForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { showToast } = useToast();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const result = await createLetter(formData);

    setLoading(false);

    if (result.success) {
      showToast('Letter created successfully', 'success');
      form.reset();
      router.refresh();
    } else {
      const errorMsg = result.error || 'Failed to create letter';
      setError(errorMsg);
      showToast(errorMsg, 'error');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Serial Number */}
      <div>
        <label htmlFor="serial_number" className="block text-sm font-medium text-gray-700 mb-2">
          Serial Number
        </label>
        <input
          type="text"
          id="serial_number"
          name="serial_number"
          placeholder="e.g., LTR-2026-001 or any format"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
        />
      </div>

      {/* Subject */}
      <div>
        <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
          Subject <span className="text-red-500">*</span>
        </label>
        <textarea
          id="subject"
          name="subject"
          required
          rows={3}
          placeholder="Enter letter subject..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
        />
      </div>

      {/* Date Fields Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="date_generated" className="block text-sm font-medium text-gray-700 mb-2">
            Date Generated
          </label>
          <input
            type="date"
            id="date_generated"
            name="date_generated"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
          />
        </div>

        <div>
          <label htmlFor="date_minuted" className="block text-sm font-medium text-gray-700 mb-2">
            Date Minuted
          </label>
          <input
            type="date"
            id="date_minuted"
            name="date_minuted"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
          />
        </div>

        <div>
          <label htmlFor="date_received" className="block text-sm font-medium text-gray-700 mb-2">
            Date Received
          </label>
          <input
            type="date"
            id="date_received"
            name="date_received"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
          />
        </div>

        <div>
          <label htmlFor="dispatch_date" className="block text-sm font-medium text-gray-700 mb-2">
            Date Created<span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            id="dispatch_date"
            name="dispatch_date"
            required
            defaultValue={new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
          />
        </div>
      </div>

      {/* Amount */}
      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
          Amount (GH₵)
        </label>
        <input
          type="text"
          id="amount"
          name="amount"
          placeholder="0.00 or any amount format"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
        />
      </div>

      {/* Submit Button */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-6 py-3 bg-knust-green-600 hover:bg-knust-green-700 disabled:bg-knust-green-300 text-white font-medium rounded-lg transition-colors"
        >
          {loading ? 'Creating...' : 'Create Letter'}
        </button>
      </div>
    </form>
  );
}
