# Database Setup Documentation

## Overview

This document describes the Supabase database schema setup for the user authentication system in Backlog Pro - Agile Suite.

## Team Members Table

### Purpose
The `team_members` table stores persistent user records for all registered users. When a user registers, a corresponding TeamMember record is automatically created in this table.

### Schema

```sql
CREATE TABLE public.team_members (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'Developer',
  avatar TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Fields

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| `id` | UUID | User identifier | Primary Key, Foreign Key to auth.users(id), CASCADE on delete |
| `name` | TEXT | User's display name | NOT NULL |
| `email` | TEXT | User's email address | NOT NULL, UNIQUE |
| `role` | TEXT | User's role in the team | Default: 'Developer' |
| `avatar` | TEXT | Optional avatar URL | Nullable |
| `created_at` | TIMESTAMPTZ | Record creation timestamp | Default: NOW() |
| `updated_at` | TIMESTAMPTZ | Last update timestamp | Default: NOW(), Auto-updated via trigger |

### Row Level Security (RLS)

The table has Row Level Security enabled with the following policies:

#### 1. Read Access (SELECT)
**Policy Name:** "Team members are viewable by authenticated users"
- **Who:** All authenticated users
- **What:** Can view all team member records
- **Why:** Team members need to see who else is on the team

```sql
CREATE POLICY "Team members are viewable by authenticated users"
  ON public.team_members FOR SELECT
  TO authenticated
  USING (true);
```

#### 2. Insert Access (INSERT)
**Policy Name:** "Users can insert their own team member record"
- **Who:** Authenticated users
- **What:** Can only insert records where the `id` matches their own user ID
- **Why:** Users should only create their own team member record during registration

```sql
CREATE POLICY "Users can insert their own team member record"
  ON public.team_members FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);
```

#### 3. Update Access (UPDATE)
**Policy Name:** "Users can update their own team member record"
- **Who:** Authenticated users
- **What:** Can only update their own team member record
- **Why:** Users should be able to update their profile information

```sql
CREATE POLICY "Users can update their own team member record"
  ON public.team_members FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);
```

### Triggers

#### Updated At Trigger
Automatically updates the `updated_at` field whenever a record is modified.

```sql
CREATE TRIGGER update_team_members_updated_at
  BEFORE UPDATE ON public.team_members
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
```

## Migration Files

### Location
`supabase/migrations/20251120120000_create_team_members.sql`

### Contents
The migration file contains:
1. Table creation with all fields and constraints
2. RLS enablement
3. All three RLS policies
4. Updated_at trigger

## Verification

### Automated Verification
Run the verification script to check if the database is properly set up:

```bash
npm run verify:db
```

This script checks:
- ✓ Table exists
- ✓ Table structure is correct
- ✓ RLS policies are configured
- ✓ Triggers are in place

### Manual Verification

#### 1. Check Table Exists
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'team_members';
```

#### 2. Check RLS is Enabled
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'team_members';
```

#### 3. Check Policies
```sql
SELECT policyname, cmd, qual, with_check 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'team_members';
```

#### 4. Check Trigger
```sql
SELECT trigger_name, event_manipulation, event_object_table 
FROM information_schema.triggers 
WHERE event_object_schema = 'public' 
AND event_object_table = 'team_members';
```

## Integration with Authentication

### Registration Flow
1. User submits registration form
2. Supabase Auth creates user in `auth.users` table
3. Application creates corresponding record in `team_members` table
4. User is automatically logged in

### Login Flow
1. User submits login credentials
2. Supabase Auth verifies credentials
3. Application verifies TeamMember record exists
4. User session is established

### Data Access
- All team member queries automatically filtered by RLS policies
- Users can only modify their own records
- All users can view the full team roster

## Security Considerations

### Password Security
- Passwords are hashed by Supabase using bcrypt
- Passwords are never stored in the `team_members` table
- Password hashing is handled entirely by Supabase Auth

### Data Privacy
- User IDs are UUIDs, not sequential integers
- Email addresses are unique and indexed
- RLS policies prevent unauthorized data access
- CASCADE delete ensures cleanup when auth user is deleted

### Access Control
- Anonymous users cannot access team_members table
- Authenticated users can view all team members (necessary for team collaboration)
- Users can only modify their own records
- No delete policy (prevents accidental team member removal)

## Troubleshooting

### Table Not Found
If you get "table not found" errors:
1. Verify you're connected to the correct Supabase project
2. Check the migration was applied: `npx supabase db remote list`
3. Run the verification script: `npm run verify:db`

### RLS Policy Errors
If you get "permission denied" errors:
1. Verify RLS policies are created: Check Supabase dashboard → Authentication → Policies
2. Ensure user is authenticated before accessing the table
3. Check that `auth.uid()` matches the record's `id` for insert/update operations

### Type Errors
If TypeScript complains about missing types:
1. The types have been manually added to `src/integrations/supabase/types.ts`
2. Restart your TypeScript server
3. If issues persist, regenerate types: `npx supabase gen types typescript --project-id ffmwvhiwpedzoboylcgc`

## Maintenance

### Backup
Team member data is automatically backed up by Supabase. To manually export:
```sql
COPY (SELECT * FROM public.team_members) TO '/tmp/team_members_backup.csv' CSV HEADER;
```

### Monitoring
Monitor table usage in Supabase dashboard:
- Database → Tables → team_members
- Check row count, storage size, and query performance

### Future Enhancements
Potential improvements to consider:
- Add `last_login_at` field to track user activity
- Add `is_active` field for soft deletion
- Add `permissions` JSONB field for role-based access control
- Add indexes on frequently queried fields
- Add audit logging for team member changes

## Related Documentation

- [Password Security](./password-security.md)
- [Security Procedures](./security-procedures.md)
- [User Authentication Requirements](../../.kiro/specs/user-authentication/requirements.md)
- [User Authentication Design](../../.kiro/specs/user-authentication/design.md)
