import { describe, it } from 'vitest';
import * as fc from 'fast-check';
import * as fs from 'fs';
import { parseAppContext } from '../utils/context-parser';

// **Feature: documentation-architecture, Property 3: CRUD method documentation completeness**
// **Validates: Requirements 2.2**

describe('Property 3: CRUD method documentation completeness', () => {
  it('for any CRUD method exposed by AppContext, the API reference should document it with signature', () => {
    // Parse CRUD methods from AppContext
    const crudMethods = parseAppContext('src/context/AppContext.tsx');
    
    // Read API reference documentation
    const apiDoc = fs.readFileSync('docs/api/api-reference.md', 'utf-8');
    
    // Property: For all CRUD methods, they should be documented with their signature
    fc.assert(
      fc.property(
        fc.constantFrom(...crudMethods),
        (method) => {
          // Check if the method name is documented
          // Methods are typically documented as: #### methodName or ### methodName
          const methodHeaderPattern1 = `#### ${method.name}`;
          const methodHeaderPattern2 = `### ${method.name}`;
          const methodInlinePattern = `\`${method.name}\``;
          
          const methodDocumented = apiDoc.includes(methodHeaderPattern1) || 
                                   apiDoc.includes(methodHeaderPattern2) ||
                                   apiDoc.includes(methodInlinePattern);
          
          if (!methodDocumented) {
            console.log(`Method not documented: ${method.name}`);
            return false;
          }
          
          // Check if the signature or type is documented
          // The signature might be in a code block or inline
          // Look for the method name followed by its type signature pattern
          const signaturePattern1 = `${method.name}:`;
          const signaturePattern2 = `${method.name}(`;
          
          const signatureDocumented = apiDoc.includes(signaturePattern1) || 
                                      apiDoc.includes(signaturePattern2);
          
          if (!signatureDocumented) {
            console.log(`Method signature not documented: ${method.name}`);
            return false;
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
