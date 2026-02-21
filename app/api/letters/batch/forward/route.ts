import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const forwardBatchSchema = z.object({
  batchId: z.string(),
  toDepartment: z.enum(['Secretary', 'Budget', 'Payables', 'Payroll', 'StudentSection', 'CashOffice', 'FinalAccounts', 'Audit']),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const json = await request.json();
    const { batchId, toDepartment } = forwardBatchSchema.parse(json);

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
    const { error: updateError } = await supabase
      .from('letters')
      .update({
        current_department: toDepartment,
        updated_at: new Date().toISOString(),
      })
      .eq('batch_id', batchId);

    if (updateError) {
      return NextResponse.json({ error: 'Failed to forward batch letters' }, { status: 500 });
    }

    // Create movements for each letter
    const movements = letters.map(letter => ({
      letter_id: letter.id,
      from_department: letter.current_department || 'payroll',
      to_department: toDepartment,
      moved_by: user.id,
      status: 'forwarded',
      notes: `Batch forwarded to ${toDepartment}`,
    }));

    const { error: movementError } = await supabase
      .from('movements')
      .insert(movements);

    if (movementError) {
      console.error('Failed to create movements:', movementError);
    }

    return NextResponse.json({
      success: true,
      message: `Batch forwarded to ${toDepartment}`,
      lettersUpdated: letters.length,
    });

  } catch (error) {
    console.error('Forward batch error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
