'use client';

import { useState, useEffect, useCallback } from 'react';
import { Letter } from '@/types';

interface DepartmentLettersState {
  incoming: Letter[];
  processing: Letter[];
  processed: Letter[];
  all: Letter[];
}

const CACHE_KEY = 'department_letters_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface CachedData {
  data: DepartmentLettersState;
  timestamp: number;
  department: string;
}

export function useDepartmentLetters(department: string, initialData?: DepartmentLettersState) {
  const [letters, setLetters] = useState<DepartmentLettersState>(() => {
    // Try to load from cache first
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const parsed: CachedData = JSON.parse(cached);
          // Check if cache is still valid and for the same department
          if (Date.now() - parsed.timestamp < CACHE_DURATION && parsed.department === department) {
            return parsed.data;
          }
        }
      } catch (error) {
        console.error('Failed to load from cache:', error);
      }
    }
    
    // Use initial data if available
    return initialData || { incoming: [], processing: [], processed: [], all: [] };
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update cache when letters change
  useEffect(() => {
    if (typeof window !== 'undefined' && letters) {
      try {
        const cacheData: CachedData = {
          data: letters,
          timestamp: Date.now(),
          department,
        };
        localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
      } catch (error) {
        console.error('Failed to save to cache:', error);
      }
    }
  }, [letters, department]);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/letters/department/${department}`);
      if (!response.ok) {
        throw new Error('Failed to fetch letters');
      }
      
      const data = await response.json();
      setLetters(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [department]);

  // Update specific letter category
  const updateLetters = useCallback((category: keyof DepartmentLettersState, newLetters: Letter[]) => {
    setLetters(prev => ({
      ...prev,
      [category]: newLetters,
      all: category === 'all' ? newLetters : prev.all
    }));
  }, []);

  // Add or update a single letter
  const upsertLetter = useCallback((letter: Letter) => {
    setLetters(prev => {
      const updateCategory = (category: Letter[]) => {
        const index = category.findIndex(l => l.id === letter.id);
        if (index >= 0) {
          return [...category.slice(0, index), letter, ...category.slice(index + 1)];
        }
        return category;
      };

      return {
        incoming: updateCategory(prev.incoming),
        processing: updateCategory(prev.processing),
        processed: updateCategory(prev.processed),
        all: updateCategory(prev.all),
      };
    });
  }, []);

  // Remove a letter
  const removeLetter = useCallback((letterId: string) => {
    setLetters(prev => {
      const removeFromCategory = (category: Letter[]) => 
        category.filter(l => l.id !== letterId);

      return {
        incoming: removeFromCategory(prev.incoming),
        processing: removeFromCategory(prev.processing),
        processed: removeFromCategory(prev.processed),
        all: removeFromCategory(prev.all),
      };
    });
  }, []);

  return {
    letters,
    loading,
    error,
    refetch,
    updateLetters,
    upsertLetter,
    removeLetter,
  };
}
