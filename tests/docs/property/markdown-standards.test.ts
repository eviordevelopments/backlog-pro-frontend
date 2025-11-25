import { describe, it } from 'vitest';
import * as fc from 'fast-check';
import * as fs from 'fs';
import * as path from 'path';
import { validateMarkdownFile } from '../utils/markdown-validator';

// **Feature: documentation-architecture, Property 7: Markdown standards compliance**
// **Validates: Requirements 7.2, 7.3, 7.4, 7.5**

describe('Property 7: Markdown standards compliance', () => {
  it('for any markdown file in the documentation directory, it should comply with all formatting standards', async () => {
    // Get all markdown files in docs directory
    const markdownFiles: string[] = [];
    
    function walkDir(dir: string) {
      const files = fs.readdirSync(dir);
      
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          walkDir(filePath);
        } else if (file.endsWith('.md')) {
          markdownFiles.push(filePath);
        }
      }
    }
    
    walkDir('docs');
    
    // Property: For all markdown files, they should comply with standards
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(...markdownFiles),
        async (filePath) => {
          const result = await validateMarkdownFile(filePath);
          
          // Check all standards
          const allStandardsMet = result.isKebabCase && 
                                  result.hasOneH1 && 
                                  result.hasProperHeadingHierarchy && 
                                  result.hasRequiredSections && 
                                  result.usesRelativePaths;
          
          if (!allStandardsMet) {
            console.log(`\nMarkdown standards violations in ${filePath}:`);
            console.log(`  Kebab-case filename: ${result.isKebabCase}`);
            console.log(`  Has one H1: ${result.hasOneH1}`);
            console.log(`  Proper heading hierarchy: ${result.hasProperHeadingHierarchy}`);
            console.log(`  Has required sections: ${result.hasRequiredSections}`);
            console.log(`  Uses relative paths: ${result.usesRelativePaths}`);
            
            if (result.errors.length > 0) {
              console.log(`  Errors:`);
              result.errors.forEach(error => console.log(`    - ${error}`));
            }
            
            return false;
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
