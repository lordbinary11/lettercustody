// @ts-nocheck
import { createClient } from '@/lib/supabase/server';
import { Letter, Movement, ProcessingNote, LetterWithDetails } from '@/types';

export async function getLetterById(letterId: string): Promise<Letter | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('letters')
    .select('*')
    .eq('id', letterId)
    .single();

  if (error || !data) {
    return null;
  }

  return data as Letter;
}

export async function getLetterWithDetails(letterId: string): Promise<LetterWithDetails | null> {
  const supabase = await createClient();
  
  const { data: letter, error: letterError } = await supabase
    .from('letters')
    .select(`
      *,
      creator:profiles!letters_created_by_fkey(*)
    `)
    .eq('id', letterId)
    .single();

  if (letterError || !letter) {
    return null;
  }

  const { data: movements } = await supabase
    .from('movements')
    .select(`
      *,
      dispatcher:profiles!movements_dispatched_by_fkey(*),
      receiver:profiles!movements_received_by_fkey(*)
    `)
    .eq('letter_id', letterId)
    .order('created_at', { ascending: false });

  const { data: notes } = await supabase
    .from('processing_notes')
    .select(`
      *,
      author:profiles!processing_notes_created_by_fkey(*)
    `)
    .eq('letter_id', letterId)
    .order('created_at', { ascending: false });

  if (!letter) {
    throw new Error('Letter not found');
  }

  return {
    ...letter,
    movements: movements || [],
    notes: notes || [],
  } as LetterWithDetails;
}

export async function getLettersByCreator(userId: string): Promise<Letter[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('letters')
    .select('*')
    .eq('created_by', userId)
    .order('created_at', { ascending: false });

  if (error || !data) {
    return [];
  }

  return data as Letter[];
}

export async function getLettersByDepartment(department: string): Promise<Letter[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('letters')
    .select('*')
    .eq('current_department', department)
    .order('created_at', { ascending: false });

  if (error || !data) {
    return [];
  }

  return data as Letter[];
}

export async function getIncomingLetters(department: string): Promise<Letter[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('letters')
    .select('*')
    .eq('current_department', department)
    .in('status', ['dispatched', 'forwarded'])
    .order('created_at', { ascending: false });

  if (error || !data) {
    return [];
  }

  return data as Letter[];
}

export async function getProcessingLetters(department: string): Promise<Letter[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('letters')
    .select('*')
    .eq('current_department', department)
    .in('status', ['received', 'processing'])
    .order('created_at', { ascending: false });

  if (error || !data) {
    return [];
  }

  return data as Letter[];
}

export async function getProcessedLetters(department: Department): Promise<Letter[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('letters')
    .select('*')
    .eq('current_department', department)
    .eq('status', 'processed')
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching processed letters:', error);
    return [];
  }

  return data || [];
}

export async function getProcessedLetterHistory(department: Department): Promise<Letter[]> {
  const supabase = await createClient();
  
  // Get all letters that were received by this department
  const { data: movements, error: movementError } = await supabase
    .from('movements')
    .select('letter_id')
    .eq('to_department', department)
    .eq('status', 'received');

  if (movementError) {
    console.error('Error fetching movement history:', movementError);
    return [];
  }

  if (!movements || movements.length === 0) {
    return [];
  }

  const letterIds = [...new Set(movements.map(m => m.letter_id))];

  // Fetch all letters that were received by this department
  // Include letters that are still being processed, already processed, or forwarded
  const { data, error } = await supabase
    .from('letters')
    .select('*')
    .in('id', letterIds)
    .in('status', ['processing', 'processed', 'dispatched', 'forwarded'])
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching processed letter history:', error);
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
    .in('status', ['dispatched', 'forwarded'])
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) {
    return null;
  }

  return data as Movement;
}

export async function getMovementsByLetter(letterId: string): Promise<Movement[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('movements')
    .select('*')
    .eq('letter_id', letterId)
    .order('created_at', { ascending: false });

  if (error || !data) {
    return [];
  }

  return data as Movement[];
}

export async function getNotesByLetter(letterId: string): Promise<ProcessingNote[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('processing_notes')
    .select('*')
    .eq('letter_id', letterId)
    .order('created_at', { ascending: false });

  if (error || !data) {
    return [];
  }

  return data as ProcessingNote[];
}
