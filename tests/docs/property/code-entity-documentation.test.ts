import { describe, it } from 'vitest';
import * as fc from 'fast-check';
import * as fs from 'fs';
import { parseTypeScriptFile } from '../utils/typescript-parser';

// **Feature: documentation-architecture, Property 2: Code entity documentation completeness**
// **Validates: Requirements 2.1, 2.3, 6.2**

describe('Property 2: Code entity documentation completeness', () => {
  it('for any TypeScript interface or field defined in the codebase, the API reference should document it', () => {
    // Parse TypeScript types file
    const { interfaces } = parseTypeScriptFile('src/types/index.ts');
    
    // Read API reference documentation
    const apiDoc = fs.readFileSync('docs/api/api-reference.md', 'utf-8');
    
    // Property: For all interfaces, they should be documented
    fc.assert(
      fc.property(
        fc.constantFrom(...interfaces),
        (iface) => {
          // Check if the interface name is documented
          const interfaceDocumented = apiDoc.includes(iface.name);
          
          if (!interfaceDocumented) {
            console.log(`Interface not documented: ${iface.name}`);
            return false;
          }
          
          // Check if all fields are documented
          for (const field of iface.fields) {
            // Look for the field name in the documentation
            // It might appear as `fieldName` or - `fieldName`
            const fieldPattern1 = `\`${field.name}\``;
            const fieldPattern2 = `- \`${field.name}\``;
            const fieldDocumented = apiDoc.includes(fieldPattern1) || apiDoc.includes(fieldPattern2);
            
            if (!fieldDocumented) {
              console.log(`Field not documented: ${iface.name}.${field.name}`);
              return false;
            }
            
            // Check if required/optional is specified
            const requiredText = field.optional ? 'optional' : 'required';
            // Find the section for this interface and check if the field has the correct required/optional marker
            const interfaceSection = apiDoc.substring(apiDoc.indexOf(`### ${iface.name}`));
            const fieldLine = interfaceSection.substring(
              interfaceSection.indexOf(`\`${field.name}\``),
              interfaceSection.indexOf(`\`${field.name}\``) + 200
            );
            
            if (!fieldLine.toLowerCase().includes(requiredText)) {
              console.log(`Field ${iface.name}.${field.name} missing ${requiredText} specification`);
              return false;
            }
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
