# Setup Guide - Letter Custody Tracking System

This guide will walk you through setting up the Letter Custody Tracking System from scratch.

## Step 1: Supabase Project Setup

### 1.1 Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign in or create an account
3. Click "New Project"
4. Fill in project details:
   - Name: `Letter Custody System`
   - Database Password: (save this securely)
   - Region: Choose closest to your location
5. Wait for project to be created

### 1.2 Get Your API Credentials

1. In your Supabase project dashboard, go to Settings → API
2. Copy the following:
   - Project URL (e.g., `https://xxxxx.supabase.co`)
   - `anon` `public` key

### 1.3 Run Database Migrations

1. In Supabase dashboard, go to SQL Editor
2. Create a new query
3. Copy and paste the contents of `supabase/migrations/001_initial_schema.sql`
4. Click "Run"
5. Create another new query
6. Copy and paste the contents of `supabase/migrations/002_rls_policies.sql`
7. Click "Run"

### 1.4 Verify Database Setup

Go to Table Editor and verify these tables exist:
- `profiles`
- `letters`
- `movements`
- `processing_notes`

## Step 2: Application Setup

### 2.1 Install Dependencies

```bash
npm install
```

### 2.2 Configure Environment Variables

1. Copy `.env.local.example` to `.env.local`:
```bash
cp .env.local.example .env.local
```

2. Edit `.env.local` and add your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

## Step 3: Create Test Users

### 3.1 Create Users in Supabase Auth

1. In Supabase dashboard, go to Authentication → Users
2. Click "Add user" → "Create new user"
3. Create the following users:

**Secretary User:**
- Email: `secretary@example.com`
- Password: `SecurePassword123!`
- Auto Confirm User: ✅

**Budget User:**
- Email: `budget@example.com`
- Password: `SecurePassword123!`
- Auto Confirm User: ✅

**Payables User:**
- Email: `payables@example.com`
- Password: `SecurePassword123!`
- Auto Confirm User: ✅

### 3.2 Create Profiles

1. Go to SQL Editor in Supabase
2. Run this query to get user IDs:

```sql
SELECT id, email FROM auth.users;
```

3. Copy the UUIDs for each user
4. Run this query to create profiles (replace UUIDs with actual values):

```sql
-- Secretary Profile
INSERT INTO profiles (id, username, role, department) 
VALUES ('uuid-for-secretary-user', 'secretary1', 'secretary', 'Secretary');

-- Budget Profile
INSERT INTO profiles (id, username, role, department) 
VALUES ('uuid-for-budget-user', 'budget1', 'department_user', 'Budget');

-- Payables Profile
INSERT INTO profiles (id, username, role, department) 
VALUES ('uuid-for-payables-user', 'payables1', 'payables_user', 'Payables');
```

## Step 4: Run the Application

### 4.1 Start Development Server

```bash
npm run dev
```

### 4.2 Access the Application

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Step 5: Test the System

### 5.1 Test Secretary Workflow

1. Go to `/dashboard/secretary`
2. You'll be redirected to login (Supabase Auth UI)
3. Login with `secretary@example.com`
4. Create a new letter:
   - Serial Number: `LTR-2026-001`
   - Subject: `Test Budget Request for Q1 2026`
5. Dispatch the letter to "Budget"

### 5.2 Test Budget Workflow

1. Logout (you may need to clear cookies or use incognito)
2. Go to `/dashboard/budget`
3. Login with `budget@example.com`
4. You should see the incoming letter
5. Click "Accept" to receive the letter
6. Add a processing note: `Reviewed budget allocation`
7. Click "Mark as Processed"
8. Forward to "Payables"

### 5.3 Test Payables Workflow

1. Logout
2. Go to `/dashboard/payables`
3. Login with `payables@example.com`
4. You should see the incoming letter
5. Click "Accept" to receive the letter
6. Click "Attach PV"
7. Enter PV ID: `PV-2026-0001`
8. Add a processing note: `Payment voucher created`
9. Click "Mark as Processed"

## Step 6: Verify Data

### 6.1 Check Letters Table

In Supabase SQL Editor:

```sql
SELECT * FROM letters ORDER BY created_at DESC;
```

You should see your test letter with:
- Status: `processed`
- Current Department: `Payables`
- PV ID: `PV-2026-0001`

### 6.2 Check Movements Table

```sql
SELECT * FROM movements ORDER BY created_at DESC;
```

You should see movement records showing the custody chain:
1. Secretary → Budget (dispatched)
2. Budget received
3. Budget → Payables (dispatched)
4. Payables received

### 6.3 Check Processing Notes

```sql
SELECT * FROM processing_notes ORDER BY created_at DESC;
```

You should see notes from Budget and Payables departments.

## Troubleshooting

### Issue: "Unauthorized" errors

**Solution:** Verify that:
1. User exists in `auth.users`
2. Profile exists in `profiles` table with correct role and department
3. User is logged in

### Issue: "Invalid state transition" errors

**Solution:** Check the current letter status. Some actions are only valid for specific statuses:
- Dispatch: `created` or `rejected`
- Receive: `dispatched`
- Complete: `processing`
- Forward: `processed`

### Issue: "Custody violation" errors

**Solution:** Ensure the user's department matches the letter's `current_department`.

### Issue: RLS policy errors

**Solution:** 
1. Verify RLS policies are installed correctly
2. Check that the user has the correct role in their profile
3. Ensure the letter's `current_department` matches the user's department

### Issue: Cannot see letters

**Solution:**
1. Check RLS policies are enabled
2. Verify user profile exists and has correct department
3. Ensure letters are actually dispatched to that department

## Production Deployment

### Environment Variables

For production, set these environment variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Database

1. Use Supabase production instance
2. Enable database backups
3. Set up monitoring

### Security

1. Enable email verification for users
2. Set up proper password policies
3. Review and test all RLS policies
4. Enable Supabase audit logs

### Deployment Platforms

The app can be deployed to:
- **Vercel** (recommended for Next.js)
- **Netlify**
- **Railway**
- **Render**

## Next Steps

1. Create additional test users for other departments
2. Test the complete letter lifecycle
3. Customize the UI to match your organization's branding
4. Set up email notifications (Phase 2)
5. Add more departments as needed (Phase 2)

## Support

For issues or questions, refer to:
- README.md for system overview
- Supabase documentation: https://supabase.com/docs
- Next.js documentation: https://nextjs.org/docs
