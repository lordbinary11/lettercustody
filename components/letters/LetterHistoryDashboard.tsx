'use client';

import { useState, useMemo } from 'react';
import { Letter } from '@/types';
import { EnhancedLetterTable } from './EnhancedLetterTable';
import { LetterDetailPanel } from './LetterDetailPanel';
import { calculateAverageProcessingTime, formatProcessingTime } from '@/lib/analytics';

interface LetterHistoryDashboardProps {
  letters: Letter[];
  departmentName: string;
}

export function LetterHistoryDashboard({ letters, departmentName }: LetterHistoryDashboardProps) {
  const [selectedLetter, setSelectedLetter] = useState<Letter | null>(null);
  const [letterDetails, setLetterDetails] = useState<Letter | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');

  // Calculate average processing time
  const averageProcessingTime = useMemo(() => {
    return calculateAverageProcessingTime(letters);
  }, [letters]);

  const filteredLetters = useMemo(() => {
    let filtered = letters;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(letter => 
        letter.serial_number?.toLowerCase().includes(query) ||
        letter.subject?.toLowerCase().includes(query) ||
        letter.pv_id?.toLowerCase().includes(query)
      );
    }

    if (selectedMonth || selectedYear) {
      filtered = filtered.filter(letter => {
        const letterDate = new Date(letter.created_at);
        const monthMatch = !selectedMonth || (letterDate.getMonth() + 1).toString() === selectedMonth;
        const yearMatch = !selectedYear || letterDate.getFullYear().toString() === selectedYear;
        return monthMatch && yearMatch;
      });
    }

    return filtered;
  }, [letters, searchQuery, selectedMonth, selectedYear]);

  const availableYears = useMemo(() => {
    const years = letters.map(l => new Date(l.created_at).getFullYear());
    return Array.from(new Set(years)).sort((a, b) => b - a);
  }, [letters]);

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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Letter History</h1>
        <p className="text-sm text-gray-500 mt-1">
          All letters that have been processed by {departmentName}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Processed</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{letters.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Avg. Processing Time</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {averageProcessingTime > 0 ? formatProcessingTime(averageProcessingTime) : 'N/A'}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Letters Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Processed Letters</h2>
          <p className="text-sm text-gray-500 mt-1">
            All letters that have been processed by your department
          </p>
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
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
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
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              >
                <option value="">All Months</option>
                {months.map(month => (
                  <option key={month.value} value={month.value}>{month.label}</option>
                ))}
              </select>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
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
              showDepartment={true}
              emptyMessage="No processed letters found"
            />
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No matching letters found. Try adjusting your search or filters.</p>
            </div>
          )}
        </div>
      </div>

      {/* Letter Detail Panel */}
      {selectedLetter && (
        <LetterDetailPanel
          letter={selectedLetter}
          isOpen={!!selectedLetter}
          onClose={() => setSelectedLetter(null)}
        />
      )}
    </div>
  );
}
