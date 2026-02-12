import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/auth';

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
        status: 'processed',
        updated_at: new Date().toISOString()
      })
      .in('id', letterIds)
      .select();

    if (updateError) {
      console.error('Bulk process error:', updateError);
      return NextResponse.json(
        { error: 'Failed to process letters' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Successfully processed ${updatedLetters.length} letters`,
      updatedLetters
    });

  } catch (error) {
    console.error('Bulk process error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
