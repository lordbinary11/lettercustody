'use client';

import { useState, useEffect, useMemo } from 'react';
import { Letter, LetterWithDetails } from '@/types';
import { EnhancedLetterTable } from '@/components/letters/EnhancedLetterTable';
import { BulkLetterTable } from '@/components/letters/BulkLetterTable';
import { DepartmentSelect } from '@/components/ui/DepartmentSelect';
import { LetterDetailPanel } from '@/components/letters/LetterDetailPanel';
import { DispatchLetterActions } from './DispatchLetterActions';
import { CreateLetterForm } from './CreateLetterForm';
import { BatchLetterForm } from './BatchLetterForm';
import { BatchLettersList } from '@/components/letters/BatchLettersList';

interface ImprovedSecretaryDashboardProps {
  letters: Letter[];
}

export function ImprovedSecretaryDashboard({ letters }: ImprovedSecretaryDashboardProps) {
  const [selectedLetter, setSelectedLetter] = useState<Letter | null>(null);
  const [letterDetails, setLetterDetails] = useState<LetterWithDetails | null>(null);
  const [activeTab, setActiveTab] = useState<'awaiting' | 'all' | 'batches'>('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showBatchForm, setShowBatchForm] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isBulkLoading, setIsBulkLoading] = useState(false);
  const [batches, setBatches] = useState<any[]>([]);

  // Fetch letter details when a letter is selected
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
      .then(res => res.json())
      .then(data => {
        if (data.batches) {
          setBatches(data.batches);
        }
      })
      .catch(err => console.error('Failed to load batches:', err));
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  // Filter letters by month, year, and search query
  const filteredLetters = useMemo(() => {
    let filtered = letters;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter((letter) => {
        const query = searchQuery.toLowerCase();
        return (
          letter.subject?.toLowerCase().includes(query) ||
          letter.serial_number?.toLowerCase().includes(query) ||
          letter.pv_id?.toLowerCase().includes(query)
        );
      });
    }

    // Apply date filters
    if (selectedMonth || selectedYear) {
      filtered = filtered.filter((letter) => {
        const letterDate = new Date(letter.created_at);
        const letterMonth = letterDate.getMonth() + 1; // 0-indexed, so add 1
        const letterYear = letterDate.getFullYear();

        const monthMatch = !selectedMonth || letterMonth.toString() === selectedMonth;
        const yearMatch = !selectedYear || letterYear.toString() === selectedYear;

        return monthMatch && yearMatch;
      });
    }

    return filtered;
  }, [letters, selectedMonth, selectedYear, searchQuery]);

  const createdLetters = letters.filter(l => l.status === 'new' || (l.status as string) === 'created');
  const dispatchedLetters = letters.filter(l => l.status !== 'new' && (l.status as string) !== 'created');

  const handleBulkDispatch = async (letterIds: string[], targetDepartment: string) => {
    setIsBulkLoading(true);
    try {
      const response = await fetch('/api/letters/bulk-dispatch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ letterIds, targetDepartment }),
      });

      const result = await response.json();

      if (response.ok) {
        // Refresh page to show updated data
        window.location.reload();
      } else {
        console.error('Bulk dispatch failed:', result.error);
        alert('Failed to dispatch letters: ' + result.error);
      }
    } catch (error) {
      console.error('Bulk dispatch error:', error);
      alert('Failed to dispatch letters. Please try again.');
    } finally {
      setIsBulkLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-knust-gray-200 p-6 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-knust-gray-500 uppercase tracking-wide">Total Letters</p>
              <p className="text-3xl font-bold text-knust-black mt-1">{letters.length}</p>
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
              <p className="text-sm font-medium text-knust-gray-500 uppercase tracking-wide">Awaiting Dispatch</p>
              <p className="text-3xl font-bold text-knust-black mt-1">{createdLetters.length}</p>
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
              <p className="text-sm font-medium text-knust-gray-500 uppercase tracking-wide">In Progress</p>
              <p className="text-3xl font-bold text-knust-black mt-1">{dispatchedLetters.length}</p>
            </div>
            <div className="w-12 h-12 bg-knust-green-50 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-knust-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Create Letter Section */}
      <div className="bg-white rounded-xl border border-knust-gray-200 shadow-card">
        <div className="px-6 py-4 border-b border-knust-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-knust-black">Create Letters</h2>
            <p className="text-sm text-knust-gray-500 mt-1">Create individual letters or upload bulk letters via CSV</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowBatchForm(true)}
              className="px-4 py-2.5 bg-knust-green-600 hover:bg-knust-green-700 text-white font-medium rounded-lg transition-colors shadow-sm flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Batch Upload
            </button>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="px-4 py-2.5 bg-knust-green-500 hover:bg-knust-green-700 text-white font-medium rounded-lg transition-colors shadow-sm"
            >
              {showCreateForm ? 'Hide Form' : '+ New Letter'}
            </button>
          </div>
        </div>
        {showCreateForm && (
          <div className="p-6">
            <CreateLetterForm />
          </div>
        )}
      </div>

      {/* Letters Tabs */}
      <div className="bg-white rounded-xl border border-knust-gray-200 shadow-card">
        <div className="border-b border-knust-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 py-4 px-6 text-center border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'all'
                  ? 'border-knust-green-500 text-knust-green-600'
                  : 'border-transparent text-knust-gray-500 hover:text-knust-gray-700 hover:border-knust-gray-300'
              }`}
            >
              All Letters
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                activeTab === 'all'
                  ? 'bg-knust-green-100 text-knust-green-600'
                  : 'bg-knust-gray-100 text-knust-gray-600'
              }`}>
                {letters.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('awaiting')}
              className={`flex-1 py-4 px-6 text-center border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'awaiting'
                  ? 'border-knust-green-500 text-knust-green-600'
                  : 'border-transparent text-knust-gray-500 hover:text-knust-gray-700 hover:border-knust-gray-300'
              }`}
            >
              Awaiting Dispatch
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                activeTab === 'awaiting'
                  ? 'bg-knust-green-100 text-knust-green-600'
                  : 'bg-knust-gray-100 text-knust-gray-600'
              }`}>
                {createdLetters.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('batches')}
              className={`flex-1 py-4 px-6 text-center border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'batches'
                  ? 'border-knust-green-500 text-knust-green-600'
                  : 'border-transparent text-knust-gray-500 hover:text-knust-gray-700 hover:border-knust-gray-300'
              }`}
            >
              Batch Letters
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                activeTab === 'batches'
                  ? 'bg-knust-green-100 text-knust-green-600'
                  : 'bg-knust-gray-100 text-knust-gray-600'
              }`}>
                {batches.length}
              </span>
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'batches' ? (
            <BatchLettersList batches={batches} onRefresh={fetchBatches} />
          ) : activeTab === 'awaiting' ? (
            <BulkLetterTable
              letters={createdLetters}
              onRowClick={setSelectedLetter}
              showDepartment={false}
              emptyMessage="No letters awaiting dispatch"
              showBulkActions={true}
              bulkActionType="forward-custom"
              onBulkForwardToDepartment={handleBulkDispatch}
              isBulkLoading={isBulkLoading}
            />
          ) : (
            <div className="space-y-4">
              {/* Search and Date Filters */}
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by subject, serial number, or PV number..."
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    <option value="">All Months</option>
                    <option value="1">January</option>
                    <option value="2">February</option>
                    <option value="3">March</option>
                    <option value="4">April</option>
                    <option value="5">May</option>
                    <option value="6">June</option>
                    <option value="7">July</option>
                    <option value="8">August</option>
                    <option value="9">September</option>
                    <option value="10">October</option>
                    <option value="11">November</option>
                    <option value="12">December</option>
                  </select>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    <option value="">All Years</option>
                    <option value="2026">2026</option>
                    <option value="2025">2025</option>
                    <option value="2024">2024</option>
                    <option value="2023">2023</option>
                  </select>
                  {(searchQuery || selectedMonth || selectedYear) && (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedMonth('');
                        setSelectedYear('');
                      }}
                      className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 font-medium"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              </div>
              <EnhancedLetterTable
                letters={filteredLetters}
                onRowClick={setSelectedLetter}
                showDepartment={true}
                emptyMessage="No letters found matching the selected filters"
              />
            </div>
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
            selectedLetter.status === 'new' || (selectedLetter.status as string) === 'created' ? (
              <DispatchLetterActions letterId={selectedLetter.id} onSuccess={() => setSelectedLetter(null)} />
            ) : (
              <div className="text-sm text-gray-500">
                Letter has been dispatched to {selectedLetter.current_department}
              </div>
            )
          }
        />
      )}

      {/* Batch Letter Form Modal */}
      {showBatchForm && (
        <BatchLetterForm 
          onClose={() => setShowBatchForm(false)} 
          onSuccess={() => {
            fetchBatches();
            setShowBatchForm(false);
          }}
        />
      )}
    </div>
  );
}
