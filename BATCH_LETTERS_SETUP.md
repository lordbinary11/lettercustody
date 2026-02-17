# Batch Letters System - Setup Guide

## Overview

The batch letters system allows secretaries to create hundreds of letters at once by uploading a CSV file. This is perfect for:
- Staff promotions
- Acceptance letters
- Appointment letters
- Request letters
- Any bulk correspondence with individual details

## Setup Instructions

### 1. Run Database Migration

First, you need to create the new database tables. Run this SQL migration in your Supabase dashboard:

```bash
# Location: supabase/migrations/add_batch_letters.sql
```

Or run via Supabase CLI:
```bash
supabase db push
```

This creates:
- `letter_batches` table - Stores batch metadata
- Adds `batch_id` and `batch_index` columns to `letters` table
- Sets up Row Level Security (RLS) policies

### 2. Verify Database Changes

After running the migration, verify in Supabase:
1. Go to Table Editor
2. Check that `letter_batches` table exists
3. Check that `letters` table has new columns: `batch_id`, `batch_index`

### 3. Update TypeScript Types (Optional)

If you want to remove TypeScript errors, regenerate Supabase types:

```bash
supabase gen types typescript --local > lib/supabase/database.types.ts
```

## How to Use

### For Secretaries

1. **Navigate to Secretary Dashboard**
   - Click the **"Batch Upload"** button (green button with upload icon)

2. **Fill in Batch Details**
   - **Batch Name**: e.g., "Staff Promotions - February 2026"
   - **Letter Type**: Select from dropdown (Promotion, Acceptance, etc.)
   - **Subject Template**: Use placeholders like `{staff_name}`, `{department}`
     - Example: `"Promotion Letter - {staff_name}"`
   - **Serial Number Prefix** (Optional): e.g., "PROM/2026"
     - Letters will be numbered: PROM/2026/001, PROM/2026/002, etc.
   - **Dates**: Set date generated and date minuted if applicable

3. **Prepare CSV File**
   - Download the sample CSV template by clicking "Download Sample CSV Template"
   - Fill in your data following the format

4. **Upload and Create**
   - Upload your CSV file
   - Preview shows first 3 rows
   - Click "Create Batch Letters"
   - All letters are created in seconds!

### CSV Format

#### Required Column:
- `staff_name` - Name of the staff member

#### Optional Columns:
- `staff_id` - Employee ID
- `amount` - Monetary amount (if applicable)
- `department` - Staff department
- `subject` - Custom subject (overrides template)
- `serial_number` - Custom serial number (if not using prefix)

#### Example CSV:

```csv
staff_name,staff_id,amount,department,subject
John Doe,EMP001,5000,Finance,Promotion Letter
Jane Smith,EMP002,7500,HR,Promotion Letter
Bob Johnson,EMP003,6000,IT,Promotion Letter
```

#### CSV Rules:
1. First row MUST be column headers
2. Use comma (,) as separator
3. Enclose values containing commas in quotes: `"Smith, John"`
4. No empty rows between data

### Subject Template Placeholders

Use curly braces to insert CSV column values:

- `{staff_name}` - Inserts staff name
- `{staff_id}` - Inserts staff ID
- `{department}` - Inserts department
- `{amount}` - Inserts amount

**Example:**
- Template: `"Promotion Letter - {staff_name} ({staff_id})"`
- Result: `"Promotion Letter - John Doe (EMP001)"`

## Features

### Automatic Serial Numbering
If you provide a serial prefix (e.g., "PROM/2026"), the system automatically numbers letters:
- PROM/2026/001
- PROM/2026/002
- PROM/2026/003
- etc.

### Batch Tracking
- All letters in a batch are linked together
- Can view batch information
- Each letter maintains individual tracking through the system

### Bulk Operations
Letters created in a batch can be:
- Bulk dispatched to departments
- Individually tracked
- Searched and filtered like regular letters

## Workflow Example

### Scenario: 150 Staff Promotion Letters

**Old Way (Manual):**
- Create 150 letters individually
- Enter each staff name, amount, details
- Time: ~3-5 hours

**New Way (Batch Upload):**
1. Export staff list from HR system (or create in Excel)
2. Save as CSV with columns: staff_name, staff_id, amount, department
3. Upload to batch letter system
4. Set template: "Promotion Letter - {staff_name}"
5. Set prefix: "PROM/2026"
6. Click create
7. Time: **~2 minutes**

Result: 150 letters created, numbered, and ready to dispatch!

## Troubleshooting

### CSV Upload Errors

**"Missing required columns"**
- Ensure first row has `staff_name` column
- Check spelling and case sensitivity

**"Column count mismatch"**
- All rows must have same number of columns
- Check for extra commas or missing values

**"Invalid amount format"**
- Amounts should be numbers only
- Remove currency symbols: Use `5000` not `$5,000`

### TypeScript Errors

If you see TypeScript errors in the API route:
- These are expected before running the migration
- They will disappear after the database migration is applied
- The code will work correctly once migration is run

## API Endpoints

### Create Batch Letters
```
POST /api/letters/batch
Content-Type: multipart/form-data

Fields:
- batch_name: string
- letter_type: string
- subject_template: string
- serial_prefix: string (optional)
- date_generated: date (optional)
- date_minuted: date (optional)
- csv_file: File
```

### Get Batch Information
```
GET /api/letters/batch?batch_id={id}
```

### Get All Batches
```
GET /api/letters/batch
```

## Database Schema

### letter_batches Table
```sql
- id: UUID (primary key)
- batch_name: VARCHAR(255)
- letter_type: VARCHAR(100)
- total_count: INTEGER
- created_by: UUID (references profiles)
- date_generated: DATE
- date_minuted: DATE
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
- metadata: JSONB
```

### letters Table (New Columns)
```sql
- batch_id: UUID (references letter_batches)
- batch_index: INTEGER (position in batch)
```

## Security

- Only secretaries can create batch letters
- Users can only view batches they created
- Admins and auditors can view all batches
- Row Level Security (RLS) enforced at database level

## Future Enhancements

Potential features to add:
- Batch editing (update all letters in a batch)
- Batch deletion
- Excel file support (.xlsx)
- Template library (save common templates)
- Batch status tracking
- Export batch to PDF

## Support

For issues or questions:
1. Check this documentation
2. Verify database migration was run
3. Check CSV format matches requirements
4. Review error messages in the UI
