import { describe, it } from 'vitest';
import * as fc from 'fast-check';
import * as fs from 'fs';
import { extractEnvVariables } from '../utils/env-parser';

// **Feature: documentation-architecture, Property 6: Environment variable documentation completeness**
// **Validates: Requirements 5.1**

describe('Property 6: Environment variable documentation completeness', () => {
  it('for any environment variable referenced in the codebase, the admin guide should document it', () => {
    // Extract environment variables from source code
    const envVars = extractEnvVariables('src');
    
    // If no env vars found, test passes trivially
    if (envVars.length === 0) {
      console.log('No environment variables found in codebase');
      return;
    }
    
    // Read admin guide documentation
    const adminGuide = fs.readFileSync('docs/user-guides/admin-guide.md', 'utf-8');
    
    // Property: For all environment variables, they should be documented in the admin guide
    fc.assert(
      fc.property(
        fc.constantFrom(...envVars),
        (envVar) => {
          // Check if the environment variable is documented
          // It might appear as VITE_VAR_NAME or VAR_NAME
          const varPattern1 = envVar.name;
          const varPattern2 = `\`${envVar.name}\``;
          const varPattern3 = `${envVar.name}=`;
          
          const varDocumented = adminGuide.includes(varPattern1) || 
                                adminGuide.includes(varPattern2) ||
                                adminGuide.includes(varPattern3);
          
          if (!varDocumented) {
            console.log(`Environment variable not documented: ${envVar.name} (used in ${envVar.filePath})`);
            return false;
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
