'use client';

import { useState, useEffect, useMemo } from 'react';
import { Letter, LetterWithDetails } from '@/types';
import { EnhancedLetterTable } from '@/components/letters/EnhancedLetterTable';
import { BulkLetterTable } from '@/components/letters/BulkLetterTable';
import { BatchLettersList } from '@/components/letters/BatchLettersList';
import { DepartmentSelect } from '@/components/ui/DepartmentSelect';
import { LetterDetailPanel } from '@/components/letters/LetterDetailPanel';
import { EmptyState } from '@/components/ui/EmptyState';
import { DepartmentBadge } from '@/components/ui/DepartmentBadge';

// Define Batch interface locally since it's not exported from types
interface Batch {
  id: string;
  batch_name: string;
  letter_type: string;
  total_count: number;
  created_at: string;
  metadata: any;
}

interface PayrollDashboardProps {
  incomingLetters: Letter[];
  processingLetters: Letter[];
  processedLetters: Letter[];
}

export function PayrollDashboard({
  incomingLetters,
  processingLetters,
  processedLetters,
}: PayrollDashboardProps) {
  const [selectedLetter, setSelectedLetter] = useState<Letter | null>(null);
  const [letterDetails, setLetterDetails] = useState<LetterWithDetails | null>(null);
  const [activeTab, setActiveTab] = useState<'incoming' | 'processing' | 'processed'>('incoming');
  const [activeSubTab, setActiveSubTab] = useState<'all' | 'batch'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [isBulkLoading, setIsBulkLoading] = useState(false);
  const [batches, setBatches] = useState<Batch[]>([]);

  useEffect(() => {
    if (selectedLetter) {
      fetch(`/api/letters/${selectedLetter.id}/details`)
        .then(res => res.json())
        .then(data => {
          if (data.letter) {
            setLetterDetails(data.letter);
          }
        })
        .catch(err => console.error('Failed to load letter details:', err));
    } else {
      setLetterDetails(null);
    }
  }, [selectedLetter]);

  // Fetch batches
  const fetchBatches = () => {
    fetch('/api/letters/batch')
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        if (data.batches) {
          setBatches(data.batches);
        }
      })
      .catch(err => {
        console.error('Failed to load batches:', err);
      });
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  const totalLetters = incomingLetters.length + processingLetters.length + processedLetters.length;

  // Calculate batch counts for each tab
  const incomingBatchCount = useMemo(() => {
    return batches.filter(batch => 
      incomingLetters.some(l => l.batch_id === batch.id)
    ).length;
  }, [batches, incomingLetters]);

  const processingBatchCount = useMemo(() => {
    return batches.filter(batch => 
      processingLetters.some(l => l.batch_id === batch.id)
    ).length;
  }, [batches, processingLetters]);

  const processedBatchCount = useMemo(() => {
    return batches.filter(batch => 
      processedLetters.some(l => l.batch_id === batch.id)
    ).length;
  }, [batches, processedLetters]);

  const tabs = [
    { id: 'incoming' as const, label: 'Incoming', count: activeSubTab === 'batch' ? incomingBatchCount : incomingLetters.length, color: 'blue' },
    { id: 'processing' as const, label: 'Processing', count: activeSubTab === 'batch' ? processingBatchCount : processingLetters.length, color: 'yellow' },
    { id: 'processed' as const, label: 'Processed', count: activeSubTab === 'batch' ? processedBatchCount : processedLetters.length, color: 'purple' },
  ];

  const subTabs = [
    { id: 'all' as const, label: 'All Letters' },
    { id: 'batch' as const, label: 'Batch Letters' },
  ];

  const getCurrentLetters = () => {
    switch (activeTab) {
      case 'incoming':
        return incomingLetters;
      case 'processing':
        return processingLetters;
      case 'processed':
        return processedLetters;
    }
  };

  const filteredLetters = useMemo(() => {
    let letters = getCurrentLetters();

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      letters = letters.filter(letter => 
        letter.serial_number?.toLowerCase().includes(query) ||
        letter.subject?.toLowerCase().includes(query) ||
        letter.pv_id?.toLowerCase().includes(query)
      );
    }

    if (selectedMonth || selectedYear) {
      letters = letters.filter(letter => {
        const letterDate = new Date(letter.created_at);
        const monthMatch = !selectedMonth || letterDate.getMonth() === parseInt(selectedMonth);
        const yearMatch = !selectedYear || letterDate.getFullYear() === parseInt(selectedYear);
        return monthMatch && yearMatch;
      });
    }

    return letters;
  }, [searchQuery, selectedMonth, selectedYear, activeTab, incomingLetters, processingLetters, processedLetters]);

  // Filter batches based on status - show batches based on the status of their letters
  const filteredBatches = useMemo(() => {
    return batches.filter(batch => {
      let batchLetters = [];
      
      if (activeTab === 'incoming') {
        // Show batches that have incoming letters
        batchLetters = incomingLetters.filter(l => l.batch_id === batch.id);
      } else if (activeTab === 'processing') {
        // Show batches that have processing letters
        batchLetters = processingLetters.filter(l => l.batch_id === batch.id);
      } else if (activeTab === 'processed') {
        // Show batches that have processed letters
        batchLetters = processedLetters.filter(l => l.batch_id === batch.id);
      }
      
      return batchLetters.length > 0;
    });
  }, [batches, incomingLetters, processingLetters, processedLetters, activeTab]);

  const availableYears = useMemo(() => {
    const allLetters = [...incomingLetters, ...processingLetters, ...processedLetters];
    const years = allLetters.map(l => new Date(l.created_at).getFullYear());
    return Array.from(new Set(years)).sort((a, b) => b - a);
  }, [incomingLetters, processingLetters, processedLetters]);

  const months = [
    { value: '0', label: 'January' },
    { value: '1', label: 'February' },
    { value: '2', label: 'March' },
    { value: '3', label: 'April' },
    { value: '4', label: 'May' },
    { value: '5', label: 'June' },
    { value: '6', label: 'July' },
    { value: '7', label: 'August' },
    { value: '8', label: 'September' },
    { value: '9', label: 'October' },
    { value: '10', label: 'November' },
    { value: '11', label: 'December' },
  ];

  const getEmptyMessage = () => {
    switch (activeTab) {
      case 'incoming':
        return 'No incoming letters';
      case 'processing':
        return 'No letters in processing';
      case 'processed':
        return 'No processed letters';
    }
  };

  const getActionRequired = () => {
    return incomingLetters.length > 0 ? incomingLetters.length : null;
  };

  // Batch actions
  const handleMarkAsProcessing = async (batchId: string) => {
    try {
      const response = await fetch('/api/letters/batch/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batchId, action: 'processing' }),
      });
      
      if (response.ok) {
        // Refresh both page data and batch data
        window.location.reload();
      } else {
        alert('Failed to mark batch as processing');
      }
    } catch (error) {
      alert('Failed to mark batch as processing');
    }
  };

  const handleMarkAsProcessed = async (batchId: string) => {
    try {
      const response = await fetch('/api/letters/batch/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batchId, action: 'processed' }),
      });
      
      if (response.ok) {
        window.location.reload();
      } else {
        alert('Failed to mark batch as processed');
      }
    } catch (error) {
      alert('Failed to mark batch as processed');
    }
  };

  const handleForwardBatch = async (batchId: string, toDepartment: string) => {
    try {
      const response = await fetch('/api/letters/batch/forward', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batchId, toDepartment }),
      });
      
      if (response.ok) {
        window.location.reload();
      } else {
        alert('Failed to forward batch');
      }
    } catch (error) {
      alert('Failed to forward batch');
    }
  };

  const handleArchive = async (letterIds: string[]) => {
    try {
      const response = await fetch('/api/letters/archive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ letterIds }),
      });
      
      if (response.ok) {
        window.location.reload();
      } else {
        alert('Failed to archive letters');
      }
    } catch (error) {
      alert('Failed to archive letters');
    }
  };

  const handleBulkAccept = async (letterIds: string[]) => {
    setIsBulkLoading(true);
    try {
      const response = await fetch('/api/letters/bulk-accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ letterIds }),
      });

      if (response.ok) {
        window.location.reload();
      } else {
        alert('Failed to accept letters');
      }
    } catch (error) {
      alert('Failed to accept letters');
    } finally {
      setIsBulkLoading(false);
    }
  };

  const handleBulkReject = async (letterIds: string[]) => {
    const rejectionReason = prompt('Please provide a reason for rejection:');
    if (!rejectionReason) return;

    setIsBulkLoading(true);
    try {
      const response = await fetch('/api/letters/bulk-reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ letterIds, rejectionReason }),
      });

      if (response.ok) {
        window.location.reload();
      } else {
        alert('Failed to reject letters');
      }
    } catch (error) {
      alert('Failed to reject letters');
    } finally {
      setIsBulkLoading(false);
    }
  };

  const handleBulkProcess = async (letterIds: string[]) => {
    setIsBulkLoading(true);
    try {
      const response = await fetch('/api/letters/bulk-process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ letterIds }),
      });

      if (response.ok) {
        window.location.reload();
      } else {
        alert('Failed to process letters');
      }
    } catch (error) {
      alert('Failed to process letters');
    } finally {
      setIsBulkLoading(false);
    }
  };

  const handleBulkForwardToDepartment = async (letterIds: string[], targetDepartment: string) => {
    setIsBulkLoading(true);
    try {
      const response = await fetch('/api/letters/bulk-forward', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ letterIds, targetDepartment }),
      });

      if (response.ok) {
        window.location.reload();
      } else {
        alert('Failed to forward letters');
      }
    } catch (error) {
      alert('Failed to forward letters');
    } finally {
      setIsBulkLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-knust-gray-200 p-6 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-knust-gray-500 uppercase tracking-wide">Total Letters</p>
              <p className="text-3xl font-bold text-knust-black mt-1">{totalLetters}</p>
            </div>
            <div className="w-12 h-12 bg-knust-green-50 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-knust-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-knust-gray-200 p-6 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-knust-gray-500 uppercase tracking-wide">Incoming</p>
              <p className="text-3xl font-bold text-knust-black mt-1">{incomingLetters.length}</p>
              {getActionRequired() && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-knust-green-100 text-knust-green-700 mt-2">
                  Action Required
                </span>
              )}
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-knust-gray-200 p-6 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-knust-gray-500 uppercase tracking-wide">Processing</p>
              <p className="text-3xl font-bold text-knust-black mt-1">{processingLetters.length}</p>
            </div>
            <div className="w-12 h-12 bg-knust-yellow-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-knust-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-knust-gray-200 p-6 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-knust-gray-500 uppercase tracking-wide">Processed</p>
              <p className="text-3xl font-bold text-knust-black mt-1">{processedLetters.length}</p>
            </div>
            <div className="w-12 h-12 bg-knust-green-50 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-knust-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-knust-gray-200 shadow-card">
        <div className="border-b border-knust-gray-200">
          <nav className="flex -mb-px">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setActiveSubTab('all');
                }}
                className={`flex-1 py-4 px-6 text-center border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-knust-green-500 text-knust-green-600'
                    : 'border-transparent text-knust-gray-500 hover:text-knust-gray-700 hover:border-knust-gray-300'
                }`}
              >
                {tab.label}
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                  activeTab === tab.id
                    ? 'bg-knust-green-100 text-knust-green-600'
                    : 'bg-knust-gray-100 text-knust-gray-600'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Sub-tabs */}
        <div className="border-b border-knust-gray-200">
          <nav className="flex -mb-px">
            {subTabs.map((subTab) => (
              <button
                key={subTab.id}
                onClick={() => setActiveSubTab(subTab.id)}
                className={`flex-1 py-3 px-6 text-center border-b-2 font-medium text-sm transition-colors ${
                  activeSubTab === subTab.id
                    ? 'border-knust-green-500 text-knust-green-600'
                    : 'border-transparent text-knust-gray-500 hover:text-knust-gray-700 hover:border-knust-gray-300'
                }`}
              >
                {subTab.label}
                {subTab.id === 'batch' && filteredBatches.length > 0 && (
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                    activeSubTab === subTab.id
                      ? 'bg-knust-green-100 text-knust-green-600'
                      : 'bg-knust-gray-100 text-knust-gray-600'
                  }`}>
                    {filteredBatches.length}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="px-6 py-4 border-b border-knust-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by serial number, subject, or PV number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-knust-gray-300 rounded-lg focus:ring-2 focus:ring-knust-green-500 focus:border-knust-green-500 text-knust-black"
                />
                <svg className="absolute left-3 top-3 h-5 w-5 text-knust-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-4 py-2.5 border border-knust-gray-300 rounded-lg focus:ring-2 focus:ring-knust-green-500 focus:border-knust-green-500 text-knust-black"
              >
                <option value="">All Months</option>
                {months.map(month => (
                  <option key={month.value} value={month.value}>{month.label}</option>
                ))}
              </select>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="px-4 py-2.5 border border-knust-gray-300 rounded-lg focus:ring-2 focus:ring-knust-green-500 focus:border-knust-green-500 text-knust-black"
              >
                <option value="">All Years</option>
                {availableYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="p-6">
          {activeSubTab === 'all' ? (
            filteredLetters.length > 0 ? (
              <BulkLetterTable
                letters={filteredLetters}
                onRowClick={setSelectedLetter}
                showDepartment={activeTab === 'incoming' ? false : true}
                emptyMessage={getEmptyMessage()}
                showBulkActions={true}
                bulkActionType={activeTab === 'incoming' ? 'accept-reject' : activeTab === 'processing' ? 'process' : 'forward-custom'}
                onBulkAccept={activeTab === 'incoming' ? handleBulkAccept : undefined}
                onBulkReject={activeTab === 'incoming' ? handleBulkReject : undefined}
                onBulkProcess={activeTab === 'processing' ? handleBulkProcess : undefined}
                onBulkForwardToDepartment={activeTab === 'processed' ? handleBulkForwardToDepartment : undefined}
                bulkActions={activeTab === 'processed' ? [
                  {
                    label: 'Archive Selected',
                    action: (letterIds) => handleArchive(letterIds),
                    variant: 'danger'
                  }
                ] : undefined}
                isBulkLoading={isBulkLoading}
              />
            ) : getCurrentLetters().length > 0 ? (
              <EmptyState
                title="No matching letters"
                description="Try adjusting your search or filters"
                icon="inbox"
              />
            ) : (
              <EmptyState
                title={getEmptyMessage()}
                description={
                  activeTab === 'incoming'
                    ? 'Waiting for letters to be dispatched to Payroll department'
                    : activeTab === 'processing'
                    ? 'No letters currently being processed'
                    : 'No letters have been processed yet'
                }
                icon="inbox"
              />
            )
          ) : (
            <BatchLettersList
              batches={batches}
              onRefresh={fetchBatches}
              showBatchActions={true}
              emptyMessage="No batches have been dispatched to Payroll yet"
              batchActions={
                activeTab === 'incoming' ? [
                  {
                    label: 'Mark as Processing',
                    action: (batchId) => handleMarkAsProcessing(batchId),
                    icon: 'processing'
                  }
                ] : activeTab === 'processing' ? [
                  {
                    label: 'Mark as Processed',
                    action: (batchId) => handleMarkAsProcessed(batchId),
                    icon: 'processed'
                  },
                  {
                    label: 'Forward Batch',
                    action: (batchId, toDepartment) => handleForwardBatch(batchId, toDepartment),
                    icon: 'forward'
                  }
                ] : activeTab === 'processed' ? [
                  {
                    label: 'Archive Batch',
                    action: (batchId) => {
                      const batchLetters = processedLetters.filter(l => l.batch_id === batchId);
                      handleArchive(batchLetters.map(l => l.id));
                    },
                    icon: 'archive'
                  }
                ] : undefined
              }
            />
          )}
        </div>
      </div>

      {/* Letter Detail Panel */}
      {selectedLetter && (
        <LetterDetailPanel
          letter={selectedLetter}
          movements={letterDetails?.movements || []}
          notes={letterDetails?.notes || []}
          isOpen={!!selectedLetter}
          onClose={() => setSelectedLetter(null)}
          actions={
            <div className="text-sm text-gray-500">
              Letter actions available in individual letter view
            </div>
          }
        />
      )}
    </div>
  );
}
