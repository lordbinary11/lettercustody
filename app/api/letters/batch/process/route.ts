import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireRole } from '@/lib/auth';

const processBatchSchema = z.object({
  batchId: z.string(),
  action: z.enum(['processing', 'processed']),
});

export async function POST(request: NextRequest) {
  try {
    const user = await requireRole(['department_user', 'payroll_user', 'admin']);
    const supabase = await createClient();

    const json = await request.json();
    const { batchId, action } = processBatchSchema.parse(json);

    // Get all letters in the batch
    const { data: letters, error: lettersError } = await supabase
      .from('letters')
      .select('*')
      .eq('batch_id', batchId);

    if (lettersError) {
      return NextResponse.json({ error: 'Failed to fetch batch letters' }, { status: 500 });
    }

    if (!letters || letters.length === 0) {
      return NextResponse.json({ error: 'No letters found in batch' }, { status: 404 });
    }

    // Update all letters in the batch
    const newStatus = action === 'processing' ? 'processing' : 'processed';
    
    const { error: updateError } = await supabase
      .from('letters')
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('batch_id', batchId);

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update batch letters' }, { status: 500 });
    }

    // Create movements for processing action
    if (action === 'processing') {
      const movements = letters.map(letter => ({
        letter_id: letter.id,
        from_department: letter.current_department || user.department,
        to_department: user.department,
        dispatched_by: user.id,
        status: 'dispatched', // Use 'dispatched' status as per movement_status enum
      }));

      const { error: movementError } = await supabase
        .from('movements')
        .insert(movements);

      if (movementError) {
        console.error('Failed to create movements:', movementError);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Batch marked as ${action}`,
      lettersUpdated: letters.length,
    });

  } catch (error) {
    console.error('Process batch error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
