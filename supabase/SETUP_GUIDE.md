# Supabase Database Setup Guide

## Quick Start

The `team_members` table has already been created in the Supabase database. This guide helps you verify and understand the setup.

## Verification

Run this command to verify the database is properly configured:

```bash
npm run verify:db
```

Expected output:
```
🔍 Checking Supabase database setup...

✓ team_members table exists
✓ Table structure verified successfully
✓ Row Level Security policies verified

✅ Database setup verified successfully!
The team_members table is ready to use.
```

## What Was Created

### 1. Team Members Table
A table to store persistent user records with the following structure:

```typescript
interface TeamMember {
  id: string;              // UUID, matches auth.users.id
  name: string;            // User's display name
  email: string;           // User's email (unique)
  role: string;            // Default: 'Developer'
  avatar: string | null;   // Optional avatar URL
  created_at: string;      // ISO timestamp
  updated_at: string;      // ISO timestamp (auto-updated)
}
```

### 2. Row Level Security Policies
- **Read**: All authenticated users can view all team members
- **Insert**: Users can only create their own team member record
- **Update**: Users can only update their own team member record

### 3. Automatic Triggers
- `updated_at` field is automatically updated on every record change

## Using the Table in Code

### Import the Supabase Client
```typescript
import { supabase } from '@/integrations/supabase/client';
```

### Create a Team Member (During Registration)
```typescript
const { data, error } = await supabase
  .from('team_members')
  .insert({
    id: userId,           // Must match authenticated user's ID
    name: userName,
    email: userEmail,
    role: 'Developer'     // Optional, defaults to 'Developer'
  });
```

### Read Team Members
```typescript
const { data, error } = await supabase
  .from('team_members')
  .select('*');
```

### Update Your Profile
```typescript
const { data, error } = await supabase
  .from('team_members')
  .update({ 
    name: 'New Name',
    avatar: 'https://example.com/avatar.jpg'
  })
  .eq('id', userId);
```

### Check if Team Member Exists
```typescript
const { data, error } = await supabase
  .from('team_members')
  .select('id')
  .eq('id', userId)
  .single();

const exists = !error && data !== null;
```

## TypeScript Types

The TypeScript types have been added to `src/integrations/supabase/types.ts`. You can use them like this:

```typescript
import type { Tables } from '@/integrations/supabase/types';

type TeamMember = Tables<'team_members'>;
```

## Migration File

The migration SQL is located at:
```
supabase/migrations/20251120120000_create_team_members.sql
```

This file contains:
- Table creation statement
- RLS policies
- Trigger setup

## Troubleshooting

### "Table not found" Error
The table exists in the remote database. Make sure you're:
1. Connected to the internet
2. Using the correct Supabase credentials in `.env`
3. Authenticated (for RLS-protected queries)

### "Permission denied" Error
This usually means:
1. You're not authenticated (call `supabase.auth.signIn()` first)
2. You're trying to insert/update a record that doesn't belong to you
3. RLS policies are working correctly (this is expected behavior)

### Type Errors
If TypeScript doesn't recognize the `team_members` table:
1. Check that `src/integrations/supabase/types.ts` includes the team_members definition
2. Restart your TypeScript server (VS Code: Cmd/Ctrl + Shift + P → "Restart TS Server")

## Next Steps

Now that the database is set up, you can:
1. ✅ Implement user registration with TeamMember creation
2. ✅ Implement login with TeamMember verification
3. ✅ Update the Team page to load from Supabase
4. ✅ Test the complete authentication flow

## Additional Resources

- [Supabase Dashboard](https://supabase.com/dashboard/project/ffmwvhiwpedzoboylcgc)
- [Detailed Documentation](../docs/security/database-setup.md)
- [Authentication Design](../.kiro/specs/user-authentication/design.md)
