'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/Toast';
import { generateSampleCSV } from '@/lib/csv-parser';

const LETTER_TYPES = [
  { value: 'promotion', label: 'Promotion Letters' },
  { value: 'acceptance', label: 'Acceptance Letters' },
  { value: 'appointment', label: 'Appointment Letters' },
  { value: 'request', label: 'Request Letters' },
  { value: 'notification', label: 'Notification Letters' },
  { value: 'other', label: 'Other' },
];

interface BatchLetterFormProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export function BatchLetterForm({ onClose, onSuccess }: BatchLetterFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any>(null);
  const router = useRouter();
  const { showToast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.csv')) {
        setError('Please upload a CSV file');
        return;
      }
      setCsvFile(file);
      setError(null);

      // Preview first few rows
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        const lines = content.split('\n').slice(0, 4); // Header + 3 rows
        setPreviewData(lines.join('\n'));
      };
      reader.readAsText(file);
    }
  };

  const downloadSampleCSV = () => {
    const csv = generateSampleCSV();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_batch_letters.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    if (!csvFile) {
      setError('Please upload a CSV file');
      setLoading(false);
      return;
    }

    formData.append('csv_file', csvFile);

    try {
      const response = await fetch('/api/letters/batch', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create batch letters');
      }

      showToast(`Successfully created ${data.letters_created} letters in batch "${data.batch.name}"`, 'success');
      router.refresh();
      if (onSuccess) {
        onSuccess();
      } else {
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create batch letters');
      showToast(err.message || 'Failed to create batch letters', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Create Batch Letters</h2>
            <p className="text-sm text-gray-500 mt-1">Upload a CSV file to create multiple letters at once</p>
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

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Batch Name */}
          <div>
            <label htmlFor="batch_name" className="block text-sm font-medium text-gray-700 mb-2">
              Batch Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="batch_name"
              name="batch_name"
              required
              placeholder="e.g., Staff Promotions - February 2026"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-knust-green-500 focus:border-knust-green-500"
            />
          </div>

          {/* Letter Type */}
          <div>
            <label htmlFor="letter_type" className="block text-sm font-medium text-gray-700 mb-2">
              Letter Type <span className="text-red-500">*</span>
            </label>
            <select
              id="letter_type"
              name="letter_type"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-knust-green-500 focus:border-knust-green-500"
            >
              <option value="">Select letter type</option>
              {LETTER_TYPES.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          {/* Subject Template */}
          <div>
            <label htmlFor="subject_template" className="block text-sm font-medium text-gray-700 mb-2">
              Letter Subject <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              <input
                type="text"
                id="subject_template"
                name="subject_template"
                required
                placeholder="e.g., Promotion Letter - "
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-knust-green-500 focus:border-knust-green-500"
              />
              <div className="flex flex-wrap gap-2">
                <p className="text-xs text-gray-600 w-full mb-1">Click to insert information from your CSV:</p>
                <button
                  type="button"
                  onClick={() => {
                    const input = document.getElementById('subject_template') as HTMLInputElement;
                    if (input) {
                      const cursorPos = input.selectionStart || input.value.length;
                      const newValue = input.value.slice(0, cursorPos) + '{staff_name}' + input.value.slice(cursorPos);
                      input.value = newValue;
                      input.focus();
                    }
                  }}
                  className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-medium rounded-md border border-blue-200 transition-colors"
                >
                  + Staff Name
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const input = document.getElementById('subject_template') as HTMLInputElement;
                    if (input) {
                      const cursorPos = input.selectionStart || input.value.length;
                      const newValue = input.value.slice(0, cursorPos) + '{department}' + input.value.slice(cursorPos);
                      input.value = newValue;
                      input.focus();
                    }
                  }}
                  className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-medium rounded-md border border-blue-200 transition-colors"
                >
                  + Department
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const input = document.getElementById('subject_template') as HTMLInputElement;
                    if (input) {
                      const cursorPos = input.selectionStart || input.value.length;
                      const newValue = input.value.slice(0, cursorPos) + '{staff_id}' + input.value.slice(cursorPos);
                      input.value = newValue;
                      input.focus();
                    }
                  }}
                  className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-medium rounded-md border border-blue-200 transition-colors"
                >
                  + Staff ID
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const input = document.getElementById('subject_template') as HTMLInputElement;
                    if (input) {
                      const cursorPos = input.selectionStart || input.value.length;
                      const newValue = input.value.slice(0, cursorPos) + '{amount}' + input.value.slice(cursorPos);
                      input.value = newValue;
                      input.focus();
                    }
                  }}
                  className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-medium rounded-md border border-blue-200 transition-colors"
                >
                  + Amount
                </button>
              </div>
              <p className="text-xs text-gray-500 italic">
                Example: "Promotion Letter - {'{'}staff_name{'}'} - {'{'}department{'}'}" will become "Promotion Letter - John Doe - Finance"
              </p>
            </div>
          </div>

          {/* Serial Number Prefix */}
          <div>
            <label htmlFor="serial_prefix" className="block text-sm font-medium text-gray-700 mb-2">
              Serial Number Prefix (Optional)
            </label>
            <input
              type="text"
              id="serial_prefix"
              name="serial_prefix"
              placeholder="e.g., PROM/2026"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-knust-green-500 focus:border-knust-green-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Letters will be numbered: PREFIX/001, PREFIX/002, etc. Leave empty to use serial numbers from CSV.
            </p>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="date_generated" className="block text-sm font-medium text-gray-700 mb-2">
                Date Generated
              </label>
              <input
                type="date"
                id="date_generated"
                name="date_generated"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-knust-green-500 focus:border-knust-green-500"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-knust-green-500 focus:border-knust-green-500"
              />
            </div>
          </div>

          {/* CSV File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload CSV File <span className="text-red-500">*</span>
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-knust-green-500 transition-colors">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
                id="csv_upload"
              />
              <label htmlFor="csv_upload" className="cursor-pointer">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="mt-2 text-sm text-gray-600">
                  {csvFile ? (
                    <span className="font-medium text-knust-green-600">{csvFile.name}</span>
                  ) : (
                    <>Click to upload or drag and drop</>
                  )}
                </p>
                <p className="text-xs text-gray-500 mt-1">CSV file with staff details</p>
              </label>
            </div>
            <button
              type="button"
              onClick={downloadSampleCSV}
              className="mt-2 text-sm text-knust-green-600 hover:text-knust-green-700 font-medium"
            >
              Download Sample CSV Template
            </button>
          </div>

          {/* Preview */}
          {previewData && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preview (First 3 rows)
              </label>
              <pre className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-xs overflow-x-auto">
                {previewData}
              </pre>
            </div>
          )}

          {/* CSV Format Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">CSV Format Requirements:</h4>
            <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
              <li><strong>Required column:</strong> staff_name</li>
              <li><strong>Optional columns:</strong> staff_id, amount, department, subject, serial_number</li>
              <li>First row must be column headers</li>
              <li>Use comma (,) as separator</li>
              <li>Enclose values with commas in quotes</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !csvFile}
              className="flex-1 px-6 py-3 bg-knust-green-600 text-white rounded-lg hover:bg-knust-green-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Letters...' : 'Create Batch Letters'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
