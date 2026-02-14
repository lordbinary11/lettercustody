import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { getAllDepartmentLetters } from '@/lib/db-optimized';

export async function GET(
  request: NextRequest,
  { params }: { params: { department: string } }
) {
  try {
    const user = await requireRole(['department_user', 'payables_user', 'cashoffice_user', 'admin']);
    const department = params.department;

    // Validate department
    const validDepartments = ['Budget', 'Payables', 'Payroll', 'StudentSection', 'CashOffice', 'FinalAccounts', 'Audit'];
    if (!validDepartments.includes(department)) {
      return NextResponse.json(
        { error: 'Invalid department' },
        { status: 400 }
      );
    }

    // Check if user has access to this department
    if (user.role !== 'admin' && user.department !== department) {
      return NextResponse.json(
        { error: 'Unauthorized: Cannot access this department' },
        { status: 403 }
      );
    }

    const letters = await getAllDepartmentLetters(department);
    
    return NextResponse.json(letters);
  } catch (error) {
    console.error('Error fetching department letters:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
