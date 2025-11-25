import * as fs from 'fs';

export interface PackageScript {
  name: string;
  command: string;
}

/**
 * Parse package.json and extract npm scripts
 */
export function parsePackageScripts(filePath: string): PackageScript[] {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const packageJson = JSON.parse(fileContent);

  const scripts: PackageScript[] = [];

  if (packageJson.scripts) {
    for (const [name, command] of Object.entries(packageJson.scripts)) {
      scripts.push({
        name,
        command: command as string,
      });
    }
  }

  return scripts;
}

/**
 * Get build-related scripts
 */
export function getBuildScripts(scripts: PackageScript[]): PackageScript[] {
  return scripts.filter(script => 
    script.name.includes('build') || 
    script.name.includes('dev') || 
    script.name.includes('preview')
  );
}

/**
 * Get test-related scripts
 */
export function getTestScripts(scripts: PackageScript[]): PackageScript[] {
  return scripts.filter(script => script.name.includes('test'));
}
