# Schema Update - Letter Identity Fields

## Overview

The letter schema has been updated to include additional fields that better represent the complete identity and lifecycle of a letter.

## New Fields Added

### Letters Table

| Field | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| `serial_number` | TEXT | **YES** (changed) | NULL | Optional unique serial number |
| `date_generated` | TIMESTAMPTZ | YES | NULL | Date when the letter was originally generated |
| `date_received` | TIMESTAMPTZ | YES | NULL | Date when the letter was received by a department (auto-set on receive) |
| `date_minuted` | TIMESTAMPTZ | YES | NULL | Date when the letter was minuted |
| `dispatch_date` | TIMESTAMPTZ | NO | NOW() | Date when the letter was dispatched |
| `amount` | DECIMAL(15,2) | YES | NULL | Monetary amount associated with the letter |
| `is_archived` | BOOLEAN | NO | FALSE | Whether the letter has been archived |

## Breaking Changes

### Serial Number Now Optional

**Previous:** `serial_number` was required (NOT NULL)  
**Current:** `serial_number` is optional (nullable)

**Impact:**
- Letters can now be created without a serial number
- Uniqueness constraint still applies when serial number is provided
- UI updated to show "No Serial Number" when null

## Migration Instructions

### For New Installations

Simply run the updated `001_initial_schema.sql` migration file. It includes all the new fields.

### For Existing Databases

Run the migration file `003_update_letter_schema.sql`:

```sql
-- This will add the new columns to your existing letters table
-- Run in Supabase SQL Editor
```

The migration will:
1. Make `serial_number` nullable
2. Add all new date fields
3. Add `amount` field
4. Add `is_archived` field
5. Set `dispatch_date` to `created_at` for existing records

## Updated Validation

### CreateLetterSchema (Zod)

```typescript
{
  serial_number: string (optional, nullable, format: ^[A-Z0-9-]+$)
  subject: string (required, min 5 chars)
  date_generated: datetime string (optional, nullable)
  date_minuted: datetime string (optional, nullable)
  amount: number (optional, nullable, must be positive)
}
```

## UI Changes

### CreateLetterForm

New fields added:
- **Serial Number** - Now marked as optional
- **Date Generated** - datetime-local input (optional)
- **Date Minuted** - datetime-local input (optional)
- **Amount** - number input with 2 decimal places (optional)

### LetterCard Component

Now displays:
- Serial number (or "No Serial Number" if null)
- Archived badge if `is_archived` is true
- Amount (formatted as currency if present)
- Date Generated (if present)
- Date Minuted (if present)
- Date Received (if present)
- Dispatch Date (always shown)

## Automatic Field Updates

### date_received

This field is **automatically set** when a department receives a letter via the `receiveLetter` action. You don't need to manually set this field.

```typescript
// In receiveLetter action
await supabase
  .from('letters')
  .update({
    status: 'processing',
    date_received: new Date().toISOString(), // Auto-set
  })
```

### dispatch_date

This field defaults to the current timestamp when a letter is created. It represents when the letter was dispatched from the secretary.

## Example Usage

### Creating a Letter with All Fields

```typescript
const formData = new FormData();
formData.append('serial_number', 'LTR-2026-001');
formData.append('subject', 'Budget Request for Q1 2026');
formData.append('date_generated', '2026-02-01T10:00:00');
formData.append('date_minuted', '2026-02-02T14:30:00');
formData.append('amount', '5000.00');

await createLetter(formData);
```

### Creating a Letter with Minimal Fields

```typescript
const formData = new FormData();
formData.append('subject', 'Urgent Payment Request');
// No serial number, dates, or amount needed

await createLetter(formData);
```

## Database Query Examples

### Find letters with amounts over $1000

```sql
SELECT * FROM letters 
WHERE amount > 1000 
ORDER BY amount DESC;
```

### Find letters without serial numbers

```sql
SELECT * FROM letters 
WHERE serial_number IS NULL;
```

### Find archived letters

```sql
SELECT * FROM letters 
WHERE is_archived = TRUE;
```

### Letters received in the last 7 days

```sql
SELECT * FROM letters 
WHERE date_received >= NOW() - INTERVAL '7 days'
ORDER BY date_received DESC;
```

## TypeScript Type Updates

The `Letter` interface now includes:

```typescript
export interface Letter {
  id: string;
  serial_number: string | null;        // Changed to nullable
  subject: string;
  date_generated: string | null;       // New
  date_received: string | null;        // New
  date_minuted: string | null;         // New
  dispatch_date: string;               // New
  amount: number | null;               // New
  status: LetterStatus;
  current_department: Department | null;
  is_archived: boolean;                // New
  pv_id: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}
```

## Backward Compatibility

### Existing Letters

All existing letters will:
- Keep their serial numbers (if they had one)
- Have `dispatch_date` set to their `created_at` timestamp
- Have `is_archived` set to `false`
- Have all new date fields set to `NULL`
- Have `amount` set to `NULL`

### Existing Code

The changes are backward compatible:
- Existing queries will continue to work
- Serial number validation only applies when provided
- New fields are optional in forms
- UI gracefully handles null values

## Future Enhancements

With these new fields, you can now:
1. Track complete letter timeline (generated → minuted → dispatched → received)
2. Filter and report on letters by amount
3. Implement archiving functionality
4. Generate financial reports based on letter amounts
5. Track letters without formal serial numbers

## Testing Checklist

- [ ] Create letter with all fields populated
- [ ] Create letter with only required fields (subject)
- [ ] Verify date_received auto-sets on receive action
- [ ] Verify serial number uniqueness still enforced when provided
- [ ] Verify UI displays "No Serial Number" for null values
- [ ] Verify amount displays as formatted currency
- [ ] Verify archived badge shows when is_archived is true
- [ ] Run existing tests to ensure backward compatibility
