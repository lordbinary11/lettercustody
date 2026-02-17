import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const user = await requireRole(['secretary', 'admin']);
    const { batchId, targetDepartment } = await request.json();

    if (!batchId) {
      return NextResponse.json(
        { error: 'Batch ID is required' },
        { status: 400 }
      );
    }

    if (!targetDepartment) {
      return NextResponse.json(
        { error: 'Target department is required' },
        { status: 400 }
      );
    }

    const validDepartments = ['Budget', 'Payables', 'Payroll', 'StudentSection', 'CashOffice', 'FinalAccounts', 'Audit'];
    if (!validDepartments.includes(targetDepartment)) {
      return NextResponse.json(
        { error: 'Invalid target department' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get all letters in the batch
    const { data: batchLetters, error: fetchError } = await supabase
      .from('letters')
      .select('id, status, batch_id')
      .eq('batch_id', batchId)
      .eq('status', 'new');

    if (fetchError) {
      console.error('Error fetching batch letters:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch batch letters' },
        { status: 500 }
      );
    }

    if (!batchLetters || batchLetters.length === 0) {
      return NextResponse.json(
        { error: 'No letters found in this batch or all letters already dispatched' },
        { status: 404 }
      );
    }

    const letterIds = batchLetters.map(letter => letter.id);
    const fromDepartment = 'Secretary';

    // Update all letters in the batch
    const { data: updatedLetters, error: updateError } = await supabase
      .from('letters')
      .update({
        status: 'dispatched',
        current_department: targetDepartment,
        updated_at: new Date().toISOString()
      })
      .in('id', letterIds)
      .select();

    if (updateError) {
      console.error('Batch dispatch error:', updateError);
      return NextResponse.json(
        { error: 'Failed to dispatch letters' },
        { status: 500 }
      );
    }

    // Create movements for each dispatched letter
    const movements = letterIds.map(letterId => ({
      letter_id: letterId,
      from_department: fromDepartment,
      to_department: targetDepartment,
      dispatched_by: user.id,
      dispatched_at: new Date().toISOString(),
      status: 'dispatched'
    }));

    const { error: movementError } = await supabase
      .from('movements')
      .insert(movements);

    if (movementError) {
      console.error('Batch movement creation error:', movementError);
      // Don't fail the whole operation if movement creation fails
    }

    return NextResponse.json({
      success: true,
      message: `Successfully dispatched ${updatedLetters?.length || letterIds.length} letters to ${targetDepartment}`,
      dispatchedCount: updatedLetters?.length || letterIds.length
    });

  } catch (error) {
    console.error('Batch dispatch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
