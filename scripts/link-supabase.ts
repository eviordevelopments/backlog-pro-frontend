import { execSync } from 'child_process';
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

const projectId = envVars.VITE_SUPABASE_PROJECT_ID;

if (!projectId) {
  console.error('Error: VITE_SUPABASE_PROJECT_ID not found in .env');
  process.exit(1);
}

console.log(`Linking Supabase project: ${projectId}\n`);

try {
  execSync(`npx supabase link --project-ref ${projectId}`, { stdio: 'inherit' });
  console.log('\nProject linked successfully!');
  console.log('Now you can run: npx supabase db push');
} catch (error) {
  console.error('Error linking project:', error);
  process.exit(1);
}
