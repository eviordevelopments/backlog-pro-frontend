import { describe, it } from 'vitest';
import * as fc from 'fast-check';
import * as fs from 'fs';
import { parseTypeScriptFile, getRelationshipFields } from '../utils/typescript-parser';

// **Feature: documentation-architecture, Property 4: Relationship documentation completeness**
// **Validates: Requirements 2.4**

describe('Property 4: Relationship documentation completeness', () => {
  it('for any field that references another entity (foreign keys), the API reference should document that relationship', () => {
    // Parse TypeScript types file
    const { interfaces } = parseTypeScriptFile('src/types/index.ts');
    
    // Get all relationship fields (fields ending in "Id" or containing references)
    const relationships = getRelationshipFields(interfaces);
    
    // Read API reference documentation
    const apiDoc = fs.readFileSync('docs/api/api-reference.md', 'utf-8');
    
    // Property: For all relationship fields, they should be documented
    fc.assert(
      fc.property(
        fc.constantFrom(...relationships),
        (relationship) => {
          // Check if the field is documented
          const fieldPattern = `\`${relationship.fieldName}\``;
          const fieldDocumented = apiDoc.includes(fieldPattern);
          
          if (!fieldDocumented) {
            console.log(`Relationship field not documented: ${relationship.interfaceName}.${relationship.fieldName}`);
            return false;
          }
          
          // Check if the relationship is explained
          // Look for keywords like "foreign key", "references", "ID of", "via"
          // Find the section for this interface
          const interfaceIndex = apiDoc.indexOf(`### ${relationship.interfaceName}`);
          if (interfaceIndex === -1) {
            console.log(`Interface section not found: ${relationship.interfaceName}`);
            return false;
          }
          
          // Get the section for this interface (up to the next ### or end of file)
          const nextInterfaceIndex = apiDoc.indexOf('###', interfaceIndex + 1);
          const interfaceSection = nextInterfaceIndex === -1 
            ? apiDoc.substring(interfaceIndex)
            : apiDoc.substring(interfaceIndex, nextInterfaceIndex);
          
          // Check if the field is mentioned in the interface section
          if (!interfaceSection.includes(fieldPattern)) {
            console.log(`Field not in interface section: ${relationship.interfaceName}.${relationship.fieldName}`);
            return false;
          }
          
          // Check if relationship keywords are present near the field
          const fieldIndex = interfaceSection.indexOf(fieldPattern);
          const fieldContext = interfaceSection.substring(
            Math.max(0, fieldIndex - 100),
            Math.min(interfaceSection.length, fieldIndex + 300)
          );
          
          const relationshipKeywords = [
            'foreign key',
            'references',
            'reference',
            'ID of',
            'via',
            'foreign',
            'relationship'
          ];
          
          const hasRelationshipDoc = relationshipKeywords.some(keyword => 
            fieldContext.toLowerCase().includes(keyword.toLowerCase())
          );
          
          if (!hasRelationshipDoc) {
            console.log(`Relationship not explained for: ${relationship.interfaceName}.${relationship.fieldName}`);
            console.log(`Context: ${fieldContext.substring(0, 200)}`);
            return false;
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
