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

const migrationPath = join(process.cwd(), 'supabase/migrations/20251121000000_add_devops_stage.sql');
const migrationSQL = readFileSync(migrationPath, 'utf-8');

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function executeMigration() {
  console.log('DevOps Stage Migration\n');
  console.log('='.repeat(50));
  console.log('\nTo add the devops_stage column to your projects table:');
  console.log('\n1. Go to your Supabase SQL Editor:');
  console.log(`   https://supabase.com/dashboard/project/${envVars.VITE_SUPABASE_PROJECT_ID}/sql`);
  console.log('\n2. Click "New Query"');
  console.log('\n3. Copy and paste the following SQL:\n');
  console.log('-'.repeat(50));
  console.log(migrationSQL);
  console.log('-'.repeat(50));
  console.log('\n4. Click "Run"');
  console.log('\n5. Verify the column was added successfully');
  console.log('\nAlternatively, you can copy the SQL from:');
  console.log('   supabase/migrations/20251121000000_add_devops_stage.sql\n');
  console.log('Valid devops_stage values:');
  console.log('   plan, code, build, test, release, deploy, operate, monitor\n');
}

executeMigration();
