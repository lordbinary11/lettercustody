import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const archiveSchema = z.object({
  letterIds: z.array(z.string()),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const json = await request.json();
    const { letterIds } = archiveSchema.parse(json);

    if (letterIds.length === 0) {
      return NextResponse.json({ error: 'No letters selected' }, { status: 400 });
    }

    // Get current departments of letters to archive
    const { data: lettersToArchive, error: fetchError } = await (supabase as any)
      .from('letters')
      .select('id, current_department')
      .in('id', letterIds);

    if (fetchError) {
      return NextResponse.json({ error: 'Failed to fetch letters' }, { status: 500 });
    }

    // Update letters to archived status
    const { error: updateError } = await (supabase as any)
      .from('letters')
      .update({
        status: 'archived',
        updated_at: new Date().toISOString(),
      })
      .in('id', letterIds);

    if (updateError) {
      return NextResponse.json({ error: 'Failed to archive letters' }, { status: 500 });
    }

    // Create archive movements with dynamic from_department
    const movements = lettersToArchive?.map((letter: any) => ({
      letter_id: letter.id,
      from_department: letter.current_department || 'Unknown',
      to_department: 'archive',
      dispatched_by: user.id,
      status: 'dispatched',
    })) || [];

    // Insert movements
    const { error: movementError } = await (supabase as any)
      .from('movements')
      .insert(movements);

    if (movementError) {
      console.error('Failed to create archive movements:', movementError);
    }

    return NextResponse.json({
      success: true,
      message: `${letterIds.length} letter(s) archived successfully`,
      lettersArchived: letterIds.length,
    });

  } catch (error) {
    console.error('Archive letters error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
