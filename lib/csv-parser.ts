export interface BatchLetterRow {
  staff_name?: string;
  staff_id?: string;
  amount?: string;
  department?: string;
  subject?: string;
  serial_number?: string;
  [key: string]: string | undefined;
}

export interface ParsedBatchData {
  rows: BatchLetterRow[];
  totalCount: number;
  errors: string[];
}

export function parseCSV(csvContent: string): ParsedBatchData {
  const errors: string[] = [];
  const rows: BatchLetterRow[] = [];

  try {
    // Split by newlines and filter empty lines
    const lines = csvContent.split(/\r?\n/).filter(line => line.trim());

    if (lines.length === 0) {
      return { rows: [], totalCount: 0, errors: ['CSV file is empty'] };
    }

    // Parse header row
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/\s+/g, '_'));

    // Validate required headers
    const requiredHeaders = ['staff_name'];
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    
    if (missingHeaders.length > 0) {
      errors.push(`Missing required columns: ${missingHeaders.join(', ')}`);
    }

    // Parse data rows
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = parseCSVLine(line);
      
      if (values.length !== headers.length) {
        errors.push(`Row ${i + 1}: Column count mismatch (expected ${headers.length}, got ${values.length})`);
        continue;
      }

      const row: BatchLetterRow = {};
      headers.forEach((header, index) => {
        row[header] = values[index]?.trim() || '';
      });

      // Validate required fields
      if (!row.staff_name) {
        errors.push(`Row ${i + 1}: Missing staff_name`);
        continue;
      }

      rows.push(row);
    }

    return {
      rows,
      totalCount: rows.length,
      errors
    };
  } catch (error) {
    return {
      rows: [],
      totalCount: 0,
      errors: [`Failed to parse CSV: ${error instanceof Error ? error.message : 'Unknown error'}`]
    };
  }
}

// Parse a single CSV line, handling quoted values
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  // Add last field
  result.push(current);

  return result;
}

export function validateBatchLetterRow(row: BatchLetterRow, index: number): string[] {
  const errors: string[] = [];

  // Validate staff_name
  if (!row.staff_name || row.staff_name.trim().length === 0) {
    errors.push(`Row ${index + 1}: staff_name is required`);
  }

  // Validate amount if provided
  if (row.amount && row.amount.trim()) {
    const amount = row.amount.replace(/[^\d.-]/g, '');
    if (isNaN(parseFloat(amount))) {
      errors.push(`Row ${index + 1}: Invalid amount format`);
    }
  }

  return errors;
}

export function generateSubjectFromTemplate(
  template: string,
  row: BatchLetterRow
): string {
  let subject = template;

  // Replace placeholders with actual values
  Object.keys(row).forEach(key => {
    const placeholder = `{${key}}`;
    if (subject.includes(placeholder)) {
      subject = subject.replace(new RegExp(placeholder, 'g'), row[key] || '');
    }
  });

  return subject;
}

export function generateSerialNumber(
  prefix: string,
  index: number,
  totalCount: number
): string {
  const paddedIndex = String(index + 1).padStart(String(totalCount).length, '0');
  return `${prefix}/${paddedIndex}`;
}

// Sample CSV template generator
export function generateSampleCSV(): string {
  return `staff_name,staff_id,amount,department,subject
John Doe,EMP001,5000,Finance,Promotion Letter
Jane Smith,EMP002,7500,HR,Promotion Letter
Bob Johnson,EMP003,6000,IT,Promotion Letter`;
}
