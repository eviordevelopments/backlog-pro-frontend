import { describe, it } from 'vitest';
import * as fc from 'fast-check';
import * as fs from 'fs';
import { parseWorkflowFiles } from '../utils/workflow-parser';
import { parsePackageScripts } from '../utils/package-parser';

// **Feature: documentation-architecture, Property 5: Workflow and build documentation completeness**
// **Validates: Requirements 3.1, 3.3**

describe('Property 5: Workflow and build documentation completeness', () => {
  it('for any GitHub Actions workflow file, there should be corresponding documentation', () => {
    // Parse workflow files
    const workflows = parseWorkflowFiles('.github/workflows');
    
    // Read architecture documentation (which should document CI/CD)
    const archDoc = fs.readFileSync('docs/architecture/system-architecture.md', 'utf-8');
    
    // Also check if workflow files themselves have inline documentation
    // Property: For all workflows, they should either have inline docs or be documented in architecture
    fc.assert(
      fc.property(
        fc.constantFrom(...workflows),
        (workflow) => {
          // Check if workflow has inline documentation (comments)
          if (workflow.hasDocumentation) {
            return true;
          }
          
          // Otherwise, check if it's documented in the architecture doc
          const workflowNameDocumented = archDoc.includes(workflow.name) || 
                                         archDoc.includes(workflow.fileName);
          
          if (!workflowNameDocumented) {
            console.log(`Workflow not documented: ${workflow.name} (${workflow.fileName})`);
            return false;
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
  
  it('for any npm script defined in package.json, there should be documentation explaining its purpose', () => {
    // Parse npm scripts
    const scripts = parsePackageScripts('package.json');
    
    // Read architecture documentation
    const archDoc = fs.readFileSync('docs/architecture/system-architecture.md', 'utf-8');
    
    // Property: For all build-related scripts, they should be documented
    fc.assert(
      fc.property(
        fc.constantFrom(...scripts),
        (script) => {
          // Check if the script is documented
          // Scripts can be documented in various formats:
          // 1. **`npm run scriptName`** (bold with backticks - primary format)
          // 2. **`scriptName`** (bold with backticks, short form)
          // 3. `npm run scriptName` (inline code in quick reference)
          // 4. npm run scriptName (plain text in quick reference)
          const scriptPattern1 = `**\`npm run ${script.name}\`**`;
          const scriptPattern2 = `**\`${script.name}\`**`;
          const scriptPattern3 = `\`npm run ${script.name}\``;
          const scriptPattern4 = `npm run ${script.name}`;
          
          const scriptDocumented = archDoc.includes(scriptPattern1) || 
                                   archDoc.includes(scriptPattern2) ||
                                   archDoc.includes(scriptPattern3) ||
                                   archDoc.includes(scriptPattern4);
          
          if (!scriptDocumented) {
            console.log(`Script not documented: ${script.name}`);
            return false;
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
