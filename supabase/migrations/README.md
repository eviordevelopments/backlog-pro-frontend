# Database Migrations

This directory contains SQL migration files for the Backlog Pro database schema.

## Migration Files

### 20251120000000_init_database.sql
Initial database schema with all core tables:
- users
- projects
- team_members
- sprints
- user_stories
- acceptance_criteria
- tasks
- risks
- profit_sharing
- finances
- goals
- devops_metrics

### 20251121000000_add_devops_stage.sql
Adds `devops_stage` column to the `projects` table to track the current stage in the DevOps lifecycle.

**Valid values:**
- `plan` - Planning phase
- `code` - Development phase
- `build` - Build phase
- `test` - Testing phase
- `release` - Release preparation
- `deploy` - Deployment phase
- `operate` - Operations phase
- `monitor` - Monitoring phase
- `NULL` - No stage assigned

## Running Migrations

### Option 1: Using the Migration Script
```bash
npm run tsx scripts/execute-devops-migration.ts
```

This will display instructions for manual execution in the Supabase dashboard.

### Option 2: Manual Execution
1. Go to your Supabase SQL Editor: https://supabase.com/dashboard/project/YOUR_PROJECT_ID/sql
2. Click "New Query"
3. Copy and paste the contents of the migration file
4. Click "Run"
5. Verify the changes were applied successfully

## Notes

- Migrations are designed to be idempotent where possible
- Always backup your database before running migrations in production
- The `devops_stage` column includes a CHECK constraint to ensure only valid values are stored
- An index is created on `devops_stage` for efficient filtering
