import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id: letterId } = await params;

    // Fetch processing notes with author details
    const { data: notes, error } = await supabase
      .from('processing_notes')
      .select(`
        *,
        author:profiles!processing_notes_created_by_fkey(
          id,
          email,
          full_name
        )
      `)
      .eq('letter_id', letterId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching notes:', error);
      return NextResponse.json(
        { error: 'Failed to fetch notes' },
        { status: 500 }
      );
    }

    return NextResponse.json({ notes: notes || [] });
  } catch (error) {
    console.error('Error in notes API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
