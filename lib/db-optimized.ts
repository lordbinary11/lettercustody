import { createClient } from '@/lib/supabase/server';
import { Letter, LetterWithDetails, Movement, ProcessingNote } from '@/types';

// Optimized function to fetch all department letters in a single query
export async function getAllDepartmentLetters(department: string): Promise<{
  incoming: Letter[];
  processing: Letter[];
  processed: Letter[];
  all: Letter[];
}> {
  const supabase = await createClient();

  // Fetch all letters for the department in one query
  const { data: letters, error } = await supabase
    .from('letters')
    .select(`
      *,
      movements (
        id,
        from_department,
        to_department,
        status,
        dispatched_at,
        received_at
      )
    `)
    .or(`current_department.eq.${department},status.eq.dispatched,status.eq.forwarded`)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching department letters:', error);
    return { incoming: [], processing: [], processed: [], all: [] };
  }

  // Categorize letters based on their status and movements
  const incoming: Letter[] = [];
  const processing: Letter[] = [];
  const processed: Letter[] = [];
  const all: Letter[] = [];

  letters?.forEach((letter: any) => {
    // Add pending movement info for incoming letters
    const movements = letter.movements || [];
    const pendingMovement = movements.find((m: Movement) => 
      m.status === 'dispatched' && m.to_department === department
    );
    if (pendingMovement) {
      (letter as any).pendingMovement = pendingMovement;
    }
    delete letter.movements; // Clean up the nested movements

    // Categorize based on status and current department
    // Following the same logic as the original functions
    if (letter.status === 'dispatched' || letter.status === 'forwarded') {
      if (letter.current_department === department) {
        // Letters with dispatched/forwarded status that are in this department
        // are considered incoming (waiting to be received)
        incoming.push(letter);
      }
    } else if (letter.status === 'processing') {
      if (letter.current_department === department) {
        processing.push(letter);
      }
    } else if (letter.status === 'processed') {
      if (letter.current_department === department) {
        processed.push(letter);
      }
    } else if (letter.status === 'new') {
      if (department === 'Secretary') {
        incoming.push(letter);
      }
    }
    
    all.push(letter);
  });

  return { incoming, processing, processed, all };
}

// Keep the old functions for backward compatibility but mark as deprecated
export async function getLetterById(letterId: string): Promise<Letter | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('letters')
    .select('*')
    .eq('id', letterId)
    .single();

  if (error) {
    console.error('Error fetching letter:', error);
    return null;
  }

  return data;
}

export async function getLetterWithDetails(letterId: string): Promise<LetterWithDetails | null> {
  const supabase = await createClient();

  const { data: letter, error: letterError } = await supabase
    .from('letters')
    .select('*')
    .eq('id', letterId)
    .single();

  if (letterError || !letter) {
    console.error('Error fetching letter:', letterError);
    return null;
  }

  const { data: movements, error: movementError } = await supabase
    .from('movements')
    .select('*')
    .eq('letter_id', letterId)
    .order('created_at', { ascending: true });

  const { data: notes, error: notesError } = await supabase
    .from('processing_notes')
    .select('*')
    .eq('letter_id', letterId)
    .order('created_at', { ascending: true });

  return {
    ...(letter as Letter),
    movements: movements || [],
    notes: notes || [],
  };
}

// Other existing functions...
export async function getLettersByCreator(userId: string): Promise<Letter[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('letters')
    .select('*')
    .eq('created_by', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching letters by creator:', error);
    return [];
  }

  return data || [];
}

export async function getPendingMovement(letterId: string): Promise<Movement | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('movements')
    .select('*')
    .eq('letter_id', letterId)
    .eq('status', 'dispatched')
    .single();

  if (error) {
    return null;
  }

  return data;
}

export async function getMovementsByLetter(letterId: string): Promise<Movement[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('movements')
    .select('*')
    .eq('letter_id', letterId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching movements:', error);
    return [];
  }

  return data || [];
}

export async function getNotesByLetter(letterId: string): Promise<ProcessingNote[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('processing_notes')
    .select('*')
    .eq('letter_id', letterId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching notes:', error);
    return [];
  }

  return data || [];
}

// Legacy functions for backward compatibility
export async function getIncomingLetters(department: string): Promise<Letter[]> {
  const result = await getAllDepartmentLetters(department);
  return result.incoming;
}

export async function getProcessingLetters(department: string): Promise<Letter[]> {
  const result = await getAllDepartmentLetters(department);
  return result.processing;
}

export async function getProcessedLetters(department: string): Promise<Letter[]> {
  const result = await getAllDepartmentLetters(department);
  return result.processed;
}
