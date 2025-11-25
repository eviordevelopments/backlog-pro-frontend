# Documentation Validation Utilities

This directory contains utility functions for parsing and validating documentation against the codebase.

## Available Utilities

### TypeScript Parser (`typescript-parser.ts`)

Parses TypeScript files to extract interface definitions and type aliases.

**Functions:**
- `parseTypeScriptFile(filePath)` - Parse a single TypeScript file
- `extractInterfacesFromDirectory(dirPath)` - Extract all interfaces from a directory
- `getRelationshipFields(interfaces)` - Get all relationship fields (fields ending in "Id")

**Use Cases:**
- Verify all TypeScript interfaces are documented
- Check that all entity fields are described in API documentation
- Identify relationship fields for documentation validation

### Context Parser (`context-parser.ts`)

Parses AppContext to extract CRUD method definitions.

**Functions:**
- `parseAppContext(filePath)` - Extract all CRUD methods from AppContext
- `groupCRUDMethodsByEntity(methods)` - Group methods by entity type

**Use Cases:**
- Verify all CRUD methods are documented in API reference
- Check method signatures match documentation

### Routing Parser (`routing-parser.ts`)

Parses App.tsx to extract route definitions.

**Functions:**
- `parseRoutes(filePath)` - Extract all route definitions
- `getNonLayoutRoutes(routes)` - Filter out layout routes

**Use Cases:**
- Verify all routes are documented in architecture documentation
- Check route-to-component mappings

### Package Parser (`package-parser.ts`)

Parses package.json to extract npm scripts.

**Functions:**
- `parsePackageScripts(filePath)` - Extract all npm scripts
- `getBuildScripts(scripts)` - Get build-related scripts
- `getTestScripts(scripts)` - Get test-related scripts

**Use Cases:**
- Verify build and deployment scripts are documented
- Check that all scripts have usage documentation

### Workflow Parser (`workflow-parser.ts`)

Parses GitHub Actions workflow files.

**Functions:**
- `parseWorkflowFiles(workflowDir)` - Extract workflow information
- `extractEnvVariablesFromWorkflows(workflowDir)` - Find environment variables in workflows

**Use Cases:**
- Verify CI/CD workflows are documented
- Check that workflow environment variables are documented

### Markdown Validator (`markdown-validator.ts`)

Validates markdown file structure and formatting.

**Functions:**
- `validateMarkdownFile(filePath)` - Validate a single markdown file
- `validateMarkdownDirectory(dirPath)` - Validate all markdown files in a directory
- `isKebabCase(filename)` - Check if filename follows kebab-case convention
- `documentationContains(filePath, searchTerm)` - Search for content in documentation

**Validation Checks:**
- Filename is in kebab-case
- Exactly one H1 heading
- Proper heading hierarchy (no skipped levels)
- Contains required sections (Overview or Examples)
- Internal links use relative paths

**Use Cases:**
- Ensure consistent markdown formatting
- Verify documentation structure standards
- Check for broken internal links

### Environment Variable Parser (`env-parser.ts`)

Extracts environment variable references from source code.

**Functions:**
- `extractEnvVariables(dirPath)` - Find all env var references in code
- `extractEnvFromEnvFile(filePath)` - Parse .env file

**Use Cases:**
- Verify all environment variables are documented in admin guide
- Check that .env.example is complete

## Usage Example

```typescript
import {
  parseTypeScriptFile,
  parseAppContext,
  parseRoutes,
  validateMarkdownFile,
} from './utils';

// Parse TypeScript interfaces
const { interfaces } = parseTypeScriptFile('src/types/index.ts');
console.log(`Found ${interfaces.length} interfaces`);

// Parse CRUD methods
const methods = parseAppContext('src/context/AppContext.tsx');
console.log(`Found ${methods.length} CRUD methods`);

// Parse routes
const routes = parseRoutes('src/App.tsx');
console.log(`Found ${routes.length} routes`);

// Validate markdown
const validation = await validateMarkdownFile('docs/api/api-reference.md');
if (validation.errors.length > 0) {
  console.error('Validation errors:', validation.errors);
}
```

## Testing

Run smoke tests to verify all utilities work correctly:

```bash
npm run test:docs
```

## Requirements Mapping

Each utility supports specific requirements from the documentation architecture spec:

| Utility | Requirements | Purpose |
|---------|-------------|---------|
| `typescript-parser.ts` | 2.1, 2.3 | Verify all TypeScript interfaces and fields are documented |
| `context-parser.ts` | 2.2 | Verify all CRUD methods are documented |
| `routing-parser.ts` | 1.5 | Verify all routes are documented |
| `package-parser.ts` | 3.3 | Verify all npm scripts are documented |
| `workflow-parser.ts` | 3.1 | Verify all CI/CD workflows are documented |
| `markdown-validator.ts` | 7.2, 7.3, 7.4, 7.5 | Ensure markdown formatting standards |
| `env-parser.ts` | 5.1 | Verify all environment variables are documented |

## Integration with Property-Based Tests

These utilities are designed to be used with fast-check for property-based testing:

```typescript
import fc from 'fast-check';
import { parseTypeScriptFile } from './utils';

// Property: All interfaces should be documented
fc.assert(
  fc.property(fc.constant(null), () => {
    const { interfaces } = parseTypeScriptFile('src/types/index.ts');
    const docContent = fs.readFileSync('docs/api/api-reference.md', 'utf-8');
    
    for (const iface of interfaces) {
      expect(docContent).toContain(iface.name);
    }
  })
);
```
