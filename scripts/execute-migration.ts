import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

const envPath = join(process.cwd(), '.env');
const envContent = readFileSync(envPath, 'utf-8');
const envVars: Record<string, string> = {};

envContent.split('\n').forEach(line => {
  const trimmedLine = line.trim();
  if (!trimmedLine || trimmedLine.startsWith('#')) return;
  
  const match = trimmedLine.match(/^([^=]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    let value = match[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || 
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    envVars[key] = value;
  }
});

const SUPABASE_URL = envVars.VITE_SUPABASE_URL;
const SUPABASE_KEY = envVars.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Error: Missing Supabase credentials in .env');
  process.exit(1);
}

const migrationPath = join(process.cwd(), 'supabase/migrations/20251120000000_init_database.sql');
const migrationSQL = readFileSync(migrationPath, 'utf-8');

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function executeMigration() {
  console.log('Executing database migration...\n');
  
  try {
    const { error } = await supabase.rpc('exec_sql', { sql: migrationSQL });
    
    if (error) {
      if (error.message.includes('does not exist')) {
        console.log('RPC method not available. Using alternative approach...\n');
        console.log('Please execute the migration manually:\n');
        console.log('1. Go to: https://supabase.com/dashboard/project/' + envVars.VITE_SUPABASE_PROJECT_ID + '/sql');
        console.log('2. Click "New Query"');
        console.log('3. Copy and paste the contents of: supabase/migrations/20251120000000_init_database.sql');
        console.log('4. Click "Run"\n');
        process.exit(0);
      }
      
      console.error('Error executing migration:', error.message);
      process.exit(1);
    }
    
    console.log('Migration executed successfully!\n');
    console.log('All tables created:');
    console.log('  - users');
    console.log('  - projects');
    console.log('  - team_members');
    console.log('  - sprints');
    console.log('  - user_stories');
    console.log('  - acceptance_criteria');
    console.log('  - tasks');
    console.log('  - risks');
    console.log('  - profit_sharing');
    console.log('  - finances');
    console.log('  - goals');
    console.log('  - devops_metrics\n');
    
  } catch (error: any) {
    console.error('Error:', error.message);
    console.log('\nPlease execute the migration manually:');
    console.log('1. Go to: https://supabase.com/dashboard/project/' + envVars.VITE_SUPABASE_PROJECT_ID + '/sql');
    console.log('2. Click "New Query"');
    console.log('3. Copy and paste the contents of: supabase/migrations/20251120000000_init_database.sql');
    console.log('4. Click "Run"\n');
    process.exit(1);
  }
}

executeMigration();
