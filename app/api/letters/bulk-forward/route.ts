import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await requireRole(['department_user', 'payables_user', 'cashoffice_user', 'admin']);
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

    const validDepartments = ['Secretary', 'Budget', 'Payables', 'Payroll', 'StudentSection', 'CashOffice', 'FinalAccounts', 'Audit'];
    if (!validDepartments.includes(targetDepartment)) {
      return NextResponse.json(
        { error: 'Invalid target department' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get user's department
    const { data: userData, error: userError } = await (supabase
      .from('profiles') as any)
      .select('department')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { error: 'Failed to get user department' },
        { status: 500 }
      );
    }

    const fromDepartment = userData.department;

    // Prevent forwarding to the same department
    if (targetDepartment === fromDepartment) {
      return NextResponse.json(
        { error: 'Cannot forward letters to the same department' },
        { status: 400 }
      );
    }

    // Update all letters in bulk
    const { data: updatedLetters, error: updateError } = await (supabase
      .from('letters') as any)
      .update({
        status: 'forwarded',
        current_department: targetDepartment,
        updated_at: new Date().toISOString()
      })
      .in('id', letterIds)
      .select();

    if (updateError) {
      console.error('Bulk forward error:', updateError);
      return NextResponse.json(
        { error: 'Failed to forward letters' },
        { status: 500 }
      );
    }

    // Create movements for each forwarded letter
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
      // Don't fail the whole operation if movement creation fails
    }

    return NextResponse.json({
      success: true,
      message: `Successfully forwarded ${updatedLetters.length} letters to ${targetDepartment}`,
      updatedLetters
    });

  } catch (error) {
    console.error('Bulk forward error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
