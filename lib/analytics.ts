import { Letter, Movement } from '@/types';

// Calculate average processing time for letters
export function calculateAverageProcessingTime(letters: Letter[]): number {
  const processedLetters = letters.filter(letter => 
    letter.status === 'processed' && 
    letter.date_received && 
    letter.updated_at
  );

  if (processedLetters.length === 0) {
    return 0;
  }

  const totalProcessingTime = processedLetters.reduce((total, letter) => {
    const receivedDate = new Date(letter.date_received!);
    const processedDate = new Date(letter.updated_at);
    const processingTimeInMs = processedDate.getTime() - receivedDate.getTime();
    return total + processingTimeInMs;
  }, 0);

  const averageTimeInMs = totalProcessingTime / processedLetters.length;
  
  // Convert to days
  return averageTimeInMs / (1000 * 60 * 60 * 24);
}

// Format processing time for display
export function formatProcessingTime(days: number): string {
  if (days < 1) {
    const hours = Math.round(days * 24);
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  } else if (days < 7) {
    const roundedDays = Math.round(days * 10) / 10;
    return `${roundedDays} day${roundedDays !== 1 ? 's' : ''}`;
  } else {
    const weeks = Math.round(days * 10) / 10;
    return `${weeks} week${weeks !== 1 ? 's' : ''}`;
  }
}

// Calculate processing time for a single letter
export function getLetterProcessingTime(letter: Letter): number | null {
  if (!letter.date_received || !letter.updated_at) {
    return null;
  }

  const receivedDate = new Date(letter.date_received);
  const processedDate = new Date(letter.updated_at);
  const processingTimeInMs = processedDate.getTime() - receivedDate.getTime();
  
  return processingTimeInMs / (1000 * 60 * 60 * 24); // Convert to days
}

// Get processing time statistics
export function getProcessingTimeStats(letters: Letter[]): {
  average: number;
  min: number;
  max: number;
  median: number;
  totalProcessed: number;
} {
  const processedLetters = letters
    .map(letter => getLetterProcessingTime(letter))
    .filter((time): time is number => time !== null);

  if (processedLetters.length === 0) {
    return {
      average: 0,
      min: 0,
      max: 0,
      median: 0,
      totalProcessed: 0
    };
  }

  // Sort for median calculation
  processedLetters.sort((a, b) => a - b);

  const average = processedLetters.reduce((sum, time) => sum + time, 0) / processedLetters.length;
  const min = processedLetters[0];
  const max = processedLetters[processedLetters.length - 1];
  const median = processedLetters.length % 2 === 0
    ? (processedLetters[processedLetters.length / 2 - 1] + processedLetters[processedLetters.length / 2]) / 2
    : processedLetters[Math.floor(processedLetters.length / 2)];

  return {
    average,
    min,
    max,
    median,
    totalProcessed: processedLetters.length
  };
}
