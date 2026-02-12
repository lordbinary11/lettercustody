import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await requireRole(['secretary', 'admin']);
    const { letterIds, targetDepartment } = await request.json();

    if (!letterIds || !Array.isArray(letterIds) || letterIds.length === 0) {
      return NextResponse.json(
        { error: 'Letter IDs are required' },
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

    // Get current department (should be Secretary for dispatching)
    const fromDepartment = 'Secretary';

    // Update all letters in bulk
    const { data: updatedLetters, error: updateError } = await (supabase
      .from('letters') as any)
      .update({
        status: 'dispatched',
        current_department: targetDepartment,
        updated_at: new Date().toISOString()
      })
      .in('id', letterIds)
      .select();

    if (updateError) {
      console.error('Bulk dispatch error:', updateError);
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

    const { error: movementError } = await (supabase
      .from('movements') as any)
      .insert(movements);

    if (movementError) {
      console.error('Bulk movement creation error:', movementError);
      // Don't fail the whole operation if movement update fails
    }

    return NextResponse.json({
      success: true,
      message: `Successfully dispatched ${updatedLetters.length} letters to ${targetDepartment}`,
      updatedLetters
    });

  } catch (error) {
    console.error('Bulk dispatch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
