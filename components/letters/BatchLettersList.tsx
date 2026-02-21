'use client';

import { useState, useEffect } from 'react';
import { BatchDispatchModal } from './BatchDispatchModal';
import { BulkLetterTable } from './BulkLetterTable';
import { Letter } from '@/types';

type Department = 'Secretary' | 'Budget' | 'Payables' | 'Payroll' | 'StudentSection' | 'CashOffice' | 'FinalAccounts' | 'Audit';

interface Batch {
  id: string;
  batch_name: string;
  letter_type: string;
  total_count: number;
  created_at: string;
  metadata: any;
}

interface BatchAction {
  label: string;
  action: (batchId: string, toDepartment?: Department) => void;
  icon: string;
}

interface BatchLettersListProps {
  batches: Batch[];
  onRefresh: () => void;
  showBatchActions?: boolean;
  batchActions?: BatchAction[];
  emptyMessage?: string;
}

export function BatchLettersList({ 
  batches, 
  onRefresh, 
  showBatchActions = false, 
  batchActions = [],
  emptyMessage = "No batch letters created yet"
}: BatchLettersListProps) {
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [expandedBatch, setExpandedBatch] = useState<string | null>(null);
  const [batchLetters, setBatchLetters] = useState<Record<string, Letter[]>>({});
  const [loadingBatch, setLoadingBatch] = useState<string | null>(null);
  const [batchStats, setBatchStats] = useState<Record<string, { dispatched: number; total: number }>>({});
  const [showBatchActionModal, setShowBatchActionModal] = useState<string | null>(null);
  const [selectedForwardDepartment, setSelectedForwardDepartment] = useState<Department | ''>('');

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getLetterTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      promotion: 'Promotion Letters',
      acceptance: 'Acceptance Letters',
      appointment: 'Appointment Letters',
      request: 'Request Letters',
      notification: 'Notification Letters',
      other: 'Other',
    };
    return types[type] || type;
  };

  const handleDispatchSuccess = () => {
    // Clear cached batch letters to force refetch
    setBatchLetters({});
    setBatchStats({});
    onRefresh();
  };

  const isBatchFullyDispatched = (batchId: string) => {
    const stats = batchStats[batchId];
    return stats && stats.dispatched === stats.total;
  };

  const getPendingLettersCount = (batchId: string) => {
    const stats = batchStats[batchId];
    if (!stats) return null;
    return stats.total - stats.dispatched;
  };

  const handleBatchAction = (batchId: string, action: BatchAction) => {
    if (action.icon === 'forward') {
      setShowBatchActionModal(batchId);
    } else {
      action.action(batchId);
    }
  };

  const handleForwardConfirm = (batchId: string) => {
    if (selectedForwardDepartment) {
      const forwardAction = batchActions.find(a => a.icon === 'forward');
      if (forwardAction) {
        forwardAction.action(batchId, selectedForwardDepartment);
        setShowBatchActionModal(null);
        setSelectedForwardDepartment('');
      }
    }
  };

  const fetchBatchLetters = async (batchId: string) => {
    if (batchLetters[batchId]) {
      return; // Already fetched
    }

    setLoadingBatch(batchId);
    try {
      const response = await fetch(`/api/letters/batch?batch_id=${batchId}`);
      const data = await response.json();
      
      if (data.letters) {
        const letters = data.letters;
        const dispatchedCount = letters.filter((l: Letter) => l.status !== 'new').length;
        
        setBatchLetters(prev => ({
          ...prev,
          [batchId]: letters
        }));
        
        setBatchStats(prev => ({
          ...prev,
          [batchId]: {
            dispatched: dispatchedCount,
            total: letters.length
          }
        }));
      }
    } catch (error) {
      console.error('Failed to fetch batch letters:', error);
    } finally {
      setLoadingBatch(null);
    }
  };

  const handleToggleExpand = (batchId: string) => {
    const newExpandedBatch = expandedBatch === batchId ? null : batchId;
    setExpandedBatch(newExpandedBatch);
    
    if (newExpandedBatch) {
      fetchBatchLetters(batchId);
    }
  };

  // Fetch dispatch status for all batches on mount
  useEffect(() => {
    batches.forEach(batch => {
      if (!batchStats[batch.id]) {
        fetchBatchStatus(batch.id);
      }
    });
  }, [batches]);

  const fetchBatchStatus = async (batchId: string) => {
    try {
      const response = await fetch(`/api/letters/batch?batch_id=${batchId}`);
      const data = await response.json();
      
      if (data.letters) {
        const letters = data.letters;
        const dispatchedCount = letters.filter((l: Letter) => l.status !== 'new').length;
        
        setBatchStats(prev => ({
          ...prev,
          [batchId]: {
            dispatched: dispatchedCount,
            total: letters.length
          }
        }));
      }
    } catch (error) {
      console.error('Failed to fetch batch status:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Batch Letters</h3>
        <span className="text-sm text-gray-500">{batches.length} batch{batches.length !== 1 ? 'es' : ''}</span>
      </div>

      {batches.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-500">{emptyMessage}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {batches.map((batch) => (
            <div
              key={batch.id}
              className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-lg font-semibold text-gray-900">{batch.batch_name}</h4>
                      <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                        {getLetterTypeLabel(batch.letter_type)}
                      </span>
                      {batchStats[batch.id] && (
                        <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${
                          isBatchFullyDispatched(batch.id)
                            ? 'bg-green-100 text-green-800'
                            : batchStats[batch.id].dispatched > 0
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {isBatchFullyDispatched(batch.id)
                            ? 'All Dispatched'
                            : batchStats[batch.id].dispatched > 0
                            ? `${batchStats[batch.id].dispatched}/${batchStats[batch.id].total} Dispatched`
                            : 'Not Dispatched'}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="font-medium">{batch.total_count} letters</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{formatDate(batch.created_at)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleExpand(batch.id)}
                      className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-1"
                    >
                      {loadingBatch === batch.id ? (
                        <>
                          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Loading...
                        </>
                      ) : (
                        <>
                          {expandedBatch === batch.id ? 'Hide Details' : 'View Details'}
                          <svg className={`w-4 h-4 transition-transform ${expandedBatch === batch.id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </>
                      )}
                    </button>
                    
                    {showBatchActions && batchActions.map((action, index) => (
                      <button
                        key={index}
                        onClick={() => handleBatchAction(batch.id, action)}
                        className={`px-4 py-2 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
                          action.icon === 'processing' ? 'bg-blue-600 hover:bg-blue-700' :
                          action.icon === 'processed' ? 'bg-green-600 hover:bg-green-700' :
                          action.icon === 'forward' ? 'bg-purple-600 hover:bg-purple-700' :
                          action.icon === 'archive' ? 'bg-red-600 hover:bg-red-700' :
                          'bg-knust-green-600 hover:bg-knust-green-700'
                        }`}
                      >
                        {action.label}
                      </button>
                    ))}
                    
                    {!showBatchActions && (batchStats[batch.id] && isBatchFullyDispatched(batch.id) ? (
                      <div className="px-4 py-2 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Fully Dispatched
                      </div>
                    ) : (
                      <button
                        onClick={() => setSelectedBatch(batch)}
                        className="px-4 py-2 bg-knust-green-600 hover:bg-knust-green-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                        {batchStats[batch.id] ? `Dispatch ${getPendingLettersCount(batch.id)} Pending` : 'Dispatch Batch'}
                      </button>
                    ))}
                  </div>
                </div>

                {expandedBatch === batch.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    {/* Batch Metadata */}
                    <div className="grid grid-cols-2 gap-4 text-sm mb-4 pb-4 border-b border-gray-200">
                      <div>
                        <span className="text-gray-600">Batch ID:</span>
                        <span className="ml-2 font-mono text-xs text-gray-900">{batch.id}</span>
                      </div>
                      {batch.metadata && typeof batch.metadata === 'string' && (
                        <>
                          {JSON.parse(batch.metadata).serial_prefix && (
                            <div>
                              <span className="text-gray-600">Serial Prefix:</span>
                              <span className="ml-2 font-medium text-gray-900">
                                {JSON.parse(batch.metadata).serial_prefix}
                              </span>
                            </div>
                          )}
                          {JSON.parse(batch.metadata).csv_filename && (
                            <div>
                              <span className="text-gray-600">CSV File:</span>
                              <span className="ml-2 font-medium text-gray-900">
                                {JSON.parse(batch.metadata).csv_filename}
                              </span>
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {/* Individual Letters Table */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-3">Individual Letters in Batch</h4>
                      {loadingBatch === batch.id ? (
                        <div className="flex items-center justify-center py-8">
                          <svg className="animate-spin h-8 w-8 text-knust-green-600" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        </div>
                      ) : batchLetters[batch.id] ? (
                        <BulkLetterTable
                          letters={batchLetters[batch.id]}
                          onRowClick={(letter) => {
                            // Optional: Handle letter click to show details
                          }}
                          showDepartment={true}
                          emptyMessage="No letters found in this batch"
                          showBulkActions={false}
                        />
                      ) : (
                        <div className="text-center py-4 text-gray-500 text-sm">
                          Click "View Details" to load letters
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedBatch && (
        <BatchDispatchModal
          batchId={selectedBatch.id}
          batchName={selectedBatch.batch_name}
          letterCount={selectedBatch.total_count}
          onClose={() => setSelectedBatch(null)}
          onSuccess={handleDispatchSuccess}
        />
      )}
      
      {/* Forward Batch Modal */}
      {showBatchActionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Forward Batch</h3>
              <p className="text-sm text-gray-600 mb-4">
                Select the department to forward this batch to:
              </p>
              <select
                value={selectedForwardDepartment}
                onChange={(e) => setSelectedForwardDepartment(e.target.value as Department)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-knust-green-500 focus:border-knust-green-500 mb-4"
              >
                <option value="">Select a department</option>
                <option value="Secretary">Secretary</option>
                <option value="Budget">Budget</option>
                <option value="Payables">Payables</option>
                <option value="StudentSection">Student Section</option>
                <option value="CashOffice">Cash Office</option>
                <option value="FinalAccounts">Final Accounts</option>
                <option value="Audit">Audit</option>
              </select>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowBatchActionModal(null);
                    setSelectedForwardDepartment('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleForwardConfirm(showBatchActionModal)}
                  disabled={!selectedForwardDepartment}
                  className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Forward Batch
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
