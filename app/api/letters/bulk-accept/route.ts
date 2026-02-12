import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/auth';
import { Database } from '@/lib/supabase/database.types';

export async function POST(request: NextRequest) {
  try {
    const user = await requireRole(['department_user', 'payables_user', 'cashoffice_user', 'admin']);
    const { letterIds } = await request.json();

    if (!letterIds || !Array.isArray(letterIds) || letterIds.length === 0) {
      return NextResponse.json(
        { error: 'Letter IDs are required' },
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
        status: 'received',
        current_department: userDepartment,
        updated_at: new Date().toISOString()
      })
      .in('id', letterIds)
      .select();

    if (updateError) {
      console.error('Bulk accept error:', updateError);
      return NextResponse.json(
        { error: 'Failed to accept letters' },
        { status: 500 }
      );
    }

    // Update movements in bulk
    const { error: movementError } = await (supabase
      .from('movements') as any)
      .update({
        status: 'received',
        received_at: new Date().toISOString(),
        received_by: user.id
      })
      .in('letter_id', letterIds)
      .eq('status', 'dispatched');

    if (movementError) {
      console.error('Bulk movement update error:', movementError);
      // Don't fail the whole operation if movement update fails
    }

    return NextResponse.json({
      success: true,
      message: `Successfully accepted ${updatedLetters.length} letters`,
      updatedLetters
    });

  } catch (error) {
    console.error('Bulk accept error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
