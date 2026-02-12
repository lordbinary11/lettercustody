import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/auth';
import { Database } from '@/lib/supabase/database.types';

export async function POST(request: NextRequest) {
  try {
    const user = await requireRole(['department_user', 'payables_user', 'cashoffice_user', 'admin']);
    const { letterIds, rejectionReason } = await request.json();

    if (!letterIds || !Array.isArray(letterIds) || letterIds.length === 0) {
      return NextResponse.json(
        { error: 'Letter IDs are required' },
        { status: 400 }
      );
    }

    if (!rejectionReason || rejectionReason.trim() === '') {
      return NextResponse.json(
        { error: 'Rejection reason is required' },
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

    const userDepartment = userData.department;

    // Update all letters in bulk
    const { data: updatedLetters, error: updateError } = await (supabase
      .from('letters') as any)
      .update({
        status: 'rejected',
        current_department: null,
        updated_at: new Date().toISOString()
      })
      .in('id', letterIds)
      .select();

    if (updateError) {
      console.error('Bulk reject error:', updateError);
      return NextResponse.json(
        { error: 'Failed to reject letters' },
        { status: 500 }
      );
    }

    // Update movements in bulk with rejection reason
    const { error: movementError } = await (supabase
      .from('movements') as any)
      .update({
        status: 'rejected',
        rejection_reason: rejectionReason.trim(),
        received_by: user.id,
        received_at: new Date().toISOString()
      })
      .in('letter_id', letterIds)
      .eq('status', 'dispatched');

    if (movementError) {
      console.error('Bulk movement update error:', movementError);
      // Don't fail the whole operation if movement update fails
    }

    return NextResponse.json({
      success: true,
      message: `Successfully rejected ${updatedLetters.length} letters`,
      updatedLetters
    });

  } catch (error) {
    console.error('Bulk reject error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
