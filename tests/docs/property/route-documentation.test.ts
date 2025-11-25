import { describe, it } from 'vitest';
import * as fc from 'fast-check';
import * as fs from 'fs';
import { parseRoutes, getNonLayoutRoutes } from '../utils/routing-parser';

// **Feature: documentation-architecture, Property 1: Route documentation completeness**
// **Validates: Requirements 1.5**

describe('Property 1: Route documentation completeness', () => {
  it('for any route defined in the routing configuration, the architecture documentation should contain a reference to that route and its corresponding page component', () => {
    // Parse routes from App.tsx
    const allRoutes = parseRoutes('src/App.tsx');
    const routes = getNonLayoutRoutes(allRoutes);
    
    // Read system architecture documentation
    const archDoc = fs.readFileSync('docs/architecture/system-architecture.md', 'utf-8');
    
    // Property: For all routes, they should be documented with their path and component
    fc.assert(
      fc.property(
        fc.constantFrom(...routes),
        (route) => {
          // Check if the route path is documented
          const pathDocumented = archDoc.includes(route.path);
          
          if (!pathDocumented) {
            console.log(`Route path not documented: ${route.path}`);
            return false;
          }
          
          // Check if the component is documented
          const componentDocumented = archDoc.includes(route.component);
          
          if (!componentDocumented) {
            console.log(`Route component not documented: ${route.component} for path ${route.path}`);
            return false;
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
