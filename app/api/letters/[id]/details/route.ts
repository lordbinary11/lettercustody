import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id: letterId } = await params;

    // Fetch letter with creator details
    const { data: letter, error: letterError } = await supabase
      .from('letters')
      .select(`
        *,
        creator:profiles!letters_created_by_fkey(
          id,
          email,
          full_name
        )
      `)
      .eq('id', letterId)
      .single();

    if (letterError || !letter) {
      return NextResponse.json(
        { error: 'Letter not found' },
        { status: 404 }
      );
    }

    // Fetch movements
    const { data: movements } = await supabase
      .from('movements')
      .select(`
        *,
        dispatcher:profiles!movements_dispatched_by_fkey(
          id,
          email,
          full_name
        ),
        receiver:profiles!movements_received_by_fkey(
          id,
          email,
          full_name
        )
      `)
      .eq('letter_id', letterId)
      .order('created_at', { ascending: false });

    // Fetch processing notes - try simple query first
    const { data: notes, error: notesError } = await supabase
      .from('processing_notes')
      .select('*')
      .eq('letter_id', letterId)
      .order('created_at', { ascending: true });

    if (notesError) {
      console.error('Notes fetch error:', notesError);
    } else {
      console.log('Notes found:', notes?.length || 0);
      
      // Fetch author details for each note
      if (notes && notes.length > 0) {
        const notesWithAuthors = await Promise.all(
          notes.map(async (note: any) => {
            const { data: author } = await supabase
              .from('profiles')
              .select('id, email, full_name')
              .eq('id', note.created_by)
              .single();
            return { ...note, author };
          })
        );
        console.log('Notes with authors:', notesWithAuthors.length);
        
        return NextResponse.json({
          letter: {
            ...(letter as any),
            movements: movements || [],
            notes: notesWithAuthors || [],
          },
        });
      }
    }

    console.log('Movements found:', movements?.length || 0);

    return NextResponse.json({
      letter: {
        ...(letter as any),
        movements: movements || [],
        notes: notes || [],
      },
    });
  } catch (error) {
    console.error('Error in letter details API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
