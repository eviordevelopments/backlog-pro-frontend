import * as fs from 'fs';
import * as path from 'path';

export interface WorkflowInfo {
  name: string;
  fileName: string;
  filePath: string;
  hasDocumentation: boolean;
}

/**
 * Parse GitHub Actions workflow files
 */
export function parseWorkflowFiles(workflowDir: string): WorkflowInfo[] {
  const workflows: WorkflowInfo[] = [];

  if (!fs.existsSync(workflowDir)) {
    return workflows;
  }

  const files = fs.readdirSync(workflowDir);

  for (const file of files) {
    if (file.endsWith('.yml') || file.endsWith('.yaml')) {
      const filePath = path.join(workflowDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');

      // Extract workflow name from YAML
      const nameMatch = content.match(/^name:\s*(.+)$/m);
      const name = nameMatch ? nameMatch[1].trim() : file;

      // Check if workflow has inline documentation (comments)
      const hasDocumentation = content.includes('#');

      workflows.push({
        name,
        fileName: file,
        filePath,
        hasDocumentation,
      });
    }
  }

  return workflows;
}

/**
 * Extract environment variables from workflow files
 */
export function extractEnvVariablesFromWorkflows(workflowDir: string): string[] {
  const envVars = new Set<string>();

  if (!fs.existsSync(workflowDir)) {
    return [];
  }

  const files = fs.readdirSync(workflowDir);

  for (const file of files) {
    if (file.endsWith('.yml') || file.endsWith('.yaml')) {
      const filePath = path.join(workflowDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');

      // Match ${{ secrets.VAR_NAME }} or ${{ env.VAR_NAME }}
      const secretMatches = Array.from(content.matchAll(/\$\{\{\s*secrets\.(\w+)\s*\}\}/g));
      const envMatches = Array.from(content.matchAll(/\$\{\{\s*env\.(\w+)\s*\}\}/g));

      for (const match of secretMatches) {
        envVars.add(match[1]);
      }

      for (const match of envMatches) {
        envVars.add(match[1]);
      }
    }
  }

  return Array.from(envVars);
}
