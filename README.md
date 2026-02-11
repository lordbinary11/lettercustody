# Letter Custody Tracking System

A fullstack Letter Custody Tracking System built with Next.js, Supabase, and TypeScript. This system tracks the custody of physical letters between departments with explicit custody transfer, state management, and comprehensive authorization.

## 🚀 Tech Stack

- **Next.js 15** (App Router)
- **Supabase** (Postgres + Auth + Row Level Security)
- **TypeScript**
- **Tailwind CSS**
- **Server Actions**
- **Zod** for validation

## 🏢 System Overview

The system manages letter custody across multiple departments with a strict state machine and custody tracking:

### Supported Departments
- Secretary (Phase 1 ✅)
- Budget (Phase 1 ✅)
- Payables (Phase 1 ✅)
- Payroll (Phase 2)
- Student Section (Phase 2)
- Cash Office (Phase 2)
- Final Accounts (Phase 2)
- Audit (Phase 2)

### Letter Lifecycle

```
Created → Dispatched → Received → Processing → Processed → Archived
            ↓
         Rejected → Created
```

## 📊 Core Principles

1. **Database is the source of truth** - All state lives in Supabase
2. **No business logic in UI** - All logic in server actions
3. **Custody is explicit** - Always tracked in `current_department`
4. **All actions are validated server-side** - Zod + state machine
5. **State transitions are enforced** - Invalid transitions throw errors
6. **History is immutable** - Append-only movements and notes

## 🗃️ Database Schema

### Tables

#### `profiles`
Extends Supabase Auth users with role and department information.

#### `letters`
Main letter records with current status and custody.

#### `movements`
Append-only custody transfer log. Never updated except to mark received/rejected.

#### `processing_notes`
Append-only notes added during processing.

## 🔐 Authorization

### Row Level Security (RLS)

All tables have RLS policies enforcing:
- Secretaries can create and dispatch letters
- Department users can only see letters in their custody
- Users can only perform actions on letters they have custody of
- Admin/Audit have read-only access to everything

### User Roles

- `secretary` - Creates and dispatches letters
- `department_user` - Processes letters in their department
- `payables_user` - Can attach PV numbers
- `admin` - Read-only access to all data
- `audit` - Read-only access to all data

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd letter-custody
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Create a `.env.local` file:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Set up Supabase**

Run the migrations in your Supabase project:
- Execute `supabase/migrations/001_initial_schema.sql`
- Execute `supabase/migrations/002_rls_policies.sql`

5. **Create test users**

In Supabase Auth, create users and add them to the `profiles` table:

```sql
-- Example: Create a secretary user
INSERT INTO profiles (id, username, role, department) 
VALUES ('user-uuid-from-auth', 'secretary1', 'secretary', 'Secretary');

-- Example: Create a budget user
INSERT INTO profiles (id, username, role, department) 
VALUES ('user-uuid-from-auth', 'budget1', 'department_user', 'Budget');

-- Example: Create a payables user
INSERT INTO profiles (id, username, role, department) 
VALUES ('user-uuid-from-auth', 'payables1', 'payables_user', 'Payables');
```

6. **Run the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📱 Phase 1 Dashboards

### Secretary Dashboard (`/dashboard/secretary`)
- Create new letters
- Dispatch letters to departments
- View all created letters
- See rejected letters

### Budget Dashboard (`/dashboard/budget`)
- View incoming letters
- Accept or reject letters
- Add processing notes
- Mark letters as processed
- Forward to other departments

### Payables Dashboard (`/dashboard/payables`)
- View incoming letters
- Accept or reject letters
- Attach PV numbers
- Add processing notes
- Mark letters as processed
- Forward to Final Accounts/Cash Office/Audit

## 🔄 Letter Operations

### Create Letter (Secretary only)
```typescript
- Serial number must be unique
- Format: Uppercase letters, numbers, hyphens only
- Subject required (min 5 characters)
```

### Dispatch Letter (Secretary only)
```typescript
- Letter must be in 'created' or 'rejected' status
- Creates movement record
- Transfers custody to target department
```

### Receive Letter (Department users)
```typescript
- Letter must be dispatched to your department
- Marks movement as received
- Changes status to 'processing'
- Transfers custody
```

### Reject Letter (Department users)
```typescript
- Letter must be dispatched to your department
- Requires rejection reason (min 10 characters)
- Returns custody to Secretary
- Changes status to 'created'
```

### Add Processing Note (Department users)
```typescript
- Must have custody of letter
- Letter must be in 'processing' or 'received' status
- Note is append-only
```

### Complete Processing (Department users)
```typescript
- Must have custody of letter
- Letter must be in 'processing' status
- Changes status to 'processed'
```

### Attach PV (Payables only)
```typescript
- Must have custody of letter
- Format: PV-YYYY-NNNN (e.g., PV-2026-0001)
- PV ID must be unique
```

### Forward Letter (Department users)
```typescript
- Must have custody of letter
- Letter must be in 'processed' status
- Creates new movement
- Transfers custody to target department
```

## 🏗️ Project Structure

```
/app
  /actions
    letterActions.ts          # Server actions for all operations
  /dashboard
    /secretary               # Secretary dashboard
    /budget                  # Budget dashboard
    /payables                # Payables dashboard
  layout.tsx
  page.tsx
  globals.css

/components
  DashboardLayout.tsx        # Shared dashboard layout
  LetterCard.tsx            # Letter display component

/lib
  auth.ts                   # Authentication helpers
  db.ts                     # Database query helpers
  permissions.ts            # Permission checking logic
  stateMachine.ts           # State transition logic
  /supabase
    client.ts               # Browser Supabase client
    server.ts               # Server Supabase client
    database.types.ts       # Generated database types

/types
  index.ts                  # TypeScript type definitions
  validation.ts             # Zod validation schemas

/supabase
  /migrations
    001_initial_schema.sql  # Database schema
    002_rls_policies.sql    # Row Level Security policies
  seed.sql                  # Sample data (optional)
```

## 🔒 Security Features

- **Row Level Security (RLS)** on all tables
- **Server-side validation** with Zod schemas
- **State machine enforcement** prevents illegal transitions
- **Custody validation** ensures only authorized users can act
- **Immutable history** - movements and notes are append-only
- **No business logic in frontend** - all in server actions

## 🎯 Phase 2 Roadmap

- [ ] Payroll dashboard
- [ ] Student Section dashboard
- [ ] Cash Office dashboard
- [ ] Final Accounts dashboard (with archive capability)
- [ ] Audit dashboard (read-only view)
- [ ] Letter search and filtering
- [ ] Email notifications
- [ ] PDF export
- [ ] Audit trail viewer
- [ ] Dashboard analytics

## 🧪 Testing

To test the system:

1. Create users in Supabase Auth for each role
2. Add corresponding profiles in the database
3. Log in as Secretary and create a letter
4. Dispatch the letter to Budget
5. Log in as Budget user and accept the letter
6. Add processing notes and mark as processed
7. Forward to Payables
8. Log in as Payables user and attach a PV
9. Complete processing and forward to Final Accounts

## 📝 Validation Rules

### Serial Number
- Format: `^[A-Z0-9-]+$`
- Must be unique
- Example: `LTR-2026-001`

### PV ID
- Format: `^PV-[0-9]{4}-[0-9]+$`
- Must be unique
- Example: `PV-2026-0001`

### Rejection Reason
- Minimum 10 characters

### Processing Note
- Minimum 5 characters

### Subject
- Minimum 5 characters

## 🐛 Troubleshooting

### Lint Errors
The TypeScript lint errors you see are expected until dependencies are installed:
```bash
npm install
```

### Database Connection Issues
Ensure your `.env.local` file has the correct Supabase credentials.

### RLS Policy Errors
If you get permission errors, verify:
1. User exists in `auth.users`
2. Profile exists in `profiles` table
3. User has correct role and department

### State Transition Errors
Check the state machine in `lib/stateMachine.ts` for valid transitions.

## 📄 License

This project is proprietary and confidential.

## 🤝 Contributing

This is a private project. Contact the maintainer for contribution guidelines.
