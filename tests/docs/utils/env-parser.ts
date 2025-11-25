import * as fs from 'fs';
import * as path from 'path';

export interface EnvVariable {
  name: string;
  filePath: string;
}

/**
 * Extract environment variables from source code
 */
export function extractEnvVariables(dirPath: string): EnvVariable[] {
  const envVars: EnvVariable[] = [];
  const seen = new Set<string>();

  function walkDir(dir: string) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        // Skip node_modules and other common directories
        if (!file.startsWith('.') && file !== 'node_modules' && file !== 'dist' && file !== 'build') {
          walkDir(filePath);
        }
      } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx')) {
        const content = fs.readFileSync(filePath, 'utf-8');

        // Match process.env.VAR_NAME
        const processEnvMatches = Array.from(content.matchAll(/process\.env\.(\w+)/g));
        for (const match of processEnvMatches) {
          const varName = match[1];
          if (!seen.has(varName)) {
            seen.add(varName);
            envVars.push({
              name: varName,
              filePath,
            });
          }
        }

        // Match import.meta.env.VAR_NAME (Vite)
        const importMetaMatches = Array.from(content.matchAll(/import\.meta\.env\.(\w+)/g));
        for (const match of importMetaMatches) {
          const varName = match[1];
          if (!seen.has(varName)) {
            seen.add(varName);
            envVars.push({
              name: varName,
              filePath,
            });
          }
        }
      }
    }
  }

  walkDir(dirPath);
  return envVars;
}

/**
 * Extract environment variables from .env files
 */
export function extractEnvFromEnvFile(filePath: string): string[] {
  if (!fs.existsSync(filePath)) {
    return [];
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const envVars: string[] = [];

  const lines = content.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const match = trimmed.match(/^([A-Z_][A-Z0-9_]*)=/);
      if (match) {
        envVars.push(match[1]);
      }
    }
  }

  return envVars;
}
