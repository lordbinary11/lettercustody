import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { parseCSV, generateSubjectFromTemplate, generateSerialNumber } from '@/lib/csv-parser';

export async function POST(request: NextRequest) {
  try {
    const user = await requireRole(['secretary']);
    const formData = await request.formData();

    const batchName = formData.get('batch_name') as string;
    const letterType = formData.get('letter_type') as string;
    const subjectTemplate = formData.get('subject_template') as string;
    const serialPrefix = formData.get('serial_prefix') as string;
    const dateGenerated = formData.get('date_generated') as string;
    const dateMinuted = formData.get('date_minuted') as string;
    const csvFile = formData.get('csv_file') as File;

    // Validate required fields
    if (!batchName || !letterType || !subjectTemplate || !csvFile) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Read and parse CSV file
    const csvContent = await csvFile.text();
    const parsedData = parseCSV(csvContent);

    if (parsedData.errors.length > 0) {
      return NextResponse.json(
        { 
          error: 'CSV parsing errors',
          details: parsedData.errors 
        },
        { status: 400 }
      );
    }

    if (parsedData.totalCount === 0) {
      return NextResponse.json(
        { error: 'No valid rows found in CSV' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Create batch record
    const { data: batch, error: batchError } = await supabase
      .from('letter_batches')
      .insert({
        batch_name: batchName,
        letter_type: letterType,
        total_count: parsedData.totalCount,
        created_by: user.id,
        date_generated: dateGenerated || null,
        date_minuted: dateMinuted || null,
        metadata: {
          subject_template: subjectTemplate,
          serial_prefix: serialPrefix,
          csv_filename: csvFile.name
        }
      })
      .select()
      .single();

    if (batchError || !batch) {
      console.error('Error creating batch:', batchError);
      return NextResponse.json(
        { error: 'Failed to create batch record' },
        { status: 500 }
      );
    }

    // Create individual letters
    const letters = parsedData.rows.map((row, index) => {
      const subject = generateSubjectFromTemplate(subjectTemplate, row);
      const serialNumber = serialPrefix 
        ? generateSerialNumber(serialPrefix, index, parsedData.totalCount)
        : row.serial_number || null;

      return {
        batch_id: batch.id,
        batch_index: index + 1,
        serial_number: serialNumber,
        subject: subject,
        date_generated: dateGenerated || null,
        date_minuted: dateMinuted || null,
        amount: row.amount ? parseFloat(row.amount.replace(/[^\d.-]/g, '')) : null,
        status: 'new',
        created_by: user.id,
        current_department: 'Secretary',
        metadata: {
          staff_name: row.staff_name,
          staff_id: row.staff_id,
          department: row.department,
          ...row
        }
      };
    });

    const { data: createdLetters, error: lettersError } = await supabase
      .from('letters')
      .insert(letters)
      .select();

    if (lettersError) {
      console.error('Error creating letters:', lettersError);
      
      // Rollback: Delete the batch
      await supabase.from('letter_batches').delete().eq('id', batch.id);
      
      return NextResponse.json(
        { error: 'Failed to create letters' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      batch: {
        id: batch.id,
        name: batch.batch_name,
        total_count: batch.total_count
      },
      letters_created: createdLetters?.length || 0
    });

  } catch (error) {
    console.error('Error in batch letter creation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve batch information
export async function GET(request: NextRequest) {
  try {
    const user = await requireRole(['secretary', 'admin', 'audit']);
    const { searchParams } = new URL(request.url);
    const batchId = searchParams.get('batch_id');

    const supabase = await createClient();

    if (batchId) {
      // Get specific batch with its letters
      const { data: batch, error: batchError } = await supabase
        .from('letter_batches')
        .select('*')
        .eq('id', batchId)
        .single();

      if (batchError || !batch) {
        return NextResponse.json(
          { error: 'Batch not found' },
          { status: 404 }
        );
      }

      const { data: letters, error: lettersError } = await supabase
        .from('letters')
        .select('*')
        .eq('batch_id', batchId)
        .order('batch_index', { ascending: true });

      return NextResponse.json({
        batch,
        letters: letters || []
      });
    } else {
      // Get all batches for the user
      const { data: batches, error } = await supabase
        .from('letter_batches')
        .select('*')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching batches:', error);
        return NextResponse.json(
          { error: 'Failed to fetch batches' },
          { status: 500 }
        );
      }

      return NextResponse.json({ batches: batches || [] });
    }
  } catch (error) {
    console.error('Error in batch retrieval:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
