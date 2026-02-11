'use client';

import { useState, useEffect, useMemo } from 'react';
import { Letter, LetterWithDetails } from '@/types';
import { EnhancedLetterTable } from '@/components/letters/EnhancedLetterTable';
import { LetterDetailPanel } from '@/components/letters/LetterDetailPanel';
import { EmptyState } from '@/components/ui/EmptyState';
import { DepartmentBadge } from '@/components/ui/DepartmentBadge';
import { IncomingLetterActions } from './IncomingLetterActions';
import { ProcessingLetterActions } from './ProcessingLetterActions';
import { ProcessedLetterActions } from './ProcessedLetterActions';

interface ImprovedPayablesDashboardProps {
  incomingLetters: Letter[];
  processingLetters: Letter[];
  processedLetters: Letter[];
}

export function ImprovedPayablesDashboard({
  incomingLetters,
  processingLetters,
  processedLetters,
}: ImprovedPayablesDashboardProps) {
  const [selectedLetter, setSelectedLetter] = useState<Letter | null>(null);
  const [letterDetails, setLetterDetails] = useState<LetterWithDetails | null>(null);
  const [activeTab, setActiveTab] = useState<'incoming' | 'processing' | 'processed'>('incoming');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');

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

  const totalLetters = incomingLetters.length + processingLetters.length + processedLetters.length;
  const lettersWithPV = [...processingLetters, ...processedLetters].filter(l => l.pv_id).length;
  const lettersWithoutPV = processingLetters.filter(l => !l.pv_id).length;

  const tabs = [
    { id: 'incoming' as const, label: 'Incoming', count: incomingLetters.length, color: 'blue' },
    { id: 'processing' as const, label: 'Processing', count: processingLetters.length, color: 'yellow' },
    { id: 'processed' as const, label: 'Processed', count: processedLetters.length, color: 'purple' },
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

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Letters</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{totalLetters}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Incoming</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{incomingLetters.length}</p>
              {incomingLetters.length > 0 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 mt-2">
                  Action Required
                </span>
              )}
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">With PV</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{lettersWithPV}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Awaiting PV</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{lettersWithoutPV}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-4 px-6 text-center border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                  activeTab === tab.id
                    ? 'bg-emerald-100 text-emerald-600'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>

        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by serial number, subject, or PV number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900"
                />
                <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900"
              >
                <option value="">All Months</option>
                {months.map(month => (
                  <option key={month.value} value={month.value}>{month.label}</option>
                ))}
              </select>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900"
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
          {filteredLetters.length > 0 ? (
            <EnhancedLetterTable
              letters={filteredLetters}
              onRowClick={setSelectedLetter}
              emptyMessage={getEmptyMessage()}
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
                  ? 'Waiting for letters to be dispatched to Payables department'
                  : activeTab === 'processing'
                  ? 'No letters currently being processed'
                  : 'No letters have been processed yet'
              }
              icon="inbox"
            />
          )}
        </div>
      </div>

      {/* Letter Detail Panel */}
      {selectedLetter && (
        <LetterDetailPanel
          letter={selectedLetter}
          isOpen={!!selectedLetter}
          onClose={() => setSelectedLetter(null)}
          actions={
            selectedLetter.status === 'dispatched' || selectedLetter.status === 'forwarded' ? (
              <div className="space-y-3">
                {(selectedLetter as any).pendingMovement?.from_department && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-xs font-medium text-blue-900 mb-1">
                      {selectedLetter.status === 'dispatched' ? 'Dispatched From:' : 'Forwarded From:'}
                    </p>
                    <DepartmentBadge department={(selectedLetter as any).pendingMovement.from_department} />
                  </div>
                )}
                <IncomingLetterActions 
                  letterId={selectedLetter.id} 
                  movementId={(selectedLetter as any).pendingMovement?.id || selectedLetter.id}
                  onSuccess={() => setSelectedLetter(null)}
                />
              </div>
            ) : selectedLetter.status === 'processing' || selectedLetter.status === 'received' ? (
              <div className="space-y-3">
                {selectedLetter.pv_id && (
                  <div className="text-sm bg-purple-50 border border-purple-200 rounded-lg p-3">
                    <span className="font-medium text-purple-900">PV Attached:</span>
                    <span className="ml-2 font-mono text-purple-700">{selectedLetter.pv_id}</span>
                  </div>
                )}
                <ProcessingLetterActions letterId={selectedLetter.id} onSuccess={() => setSelectedLetter(null)} />
              </div>
            ) : selectedLetter.status === 'processed' ? (
              <div className="space-y-3">
                {selectedLetter.pv_id && (
                  <div className="text-sm bg-purple-50 border border-purple-200 rounded-lg p-3">
                    <span className="font-medium text-purple-900">PV Attached:</span>
                    <span className="ml-2 font-mono text-purple-700">{selectedLetter.pv_id}</span>
                  </div>
                )}
                <ProcessedLetterActions letterId={selectedLetter.id} onSuccess={() => setSelectedLetter(null)} />
              </div>
            ) : (
              <div className="text-sm text-gray-500">
                No actions available for this letter status
              </div>
            )
          }
        />
      )}
    </div>
  );
}
