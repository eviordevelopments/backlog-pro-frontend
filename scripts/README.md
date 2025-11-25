# Documentation Validation Scripts

This directory contains scripts for validating the completeness and correctness of project documentation.

## Available Scripts

### validate-docs.ts

Runs all documentation tests to ensure completeness and correctness.

**What it validates:**
- Property-based tests for universal documentation properties
- Unit tests for specific documentation requirements
- Code entity documentation completeness
- CRUD method documentation
- Route documentation
- Workflow and build documentation
- Environment variable documentation
- Markdown formatting standards

**Usage:**
```bash
npm run validate:docs
```

**Exit codes:**
- `0` - All tests passed
- `1` - Tests failed or error occurred

### check-links.ts

Validates all internal links in markdown documentation files.

**What it checks:**
- Relative links to other markdown files
- Relative links to code files
- Anchor links within documents
- Broken or missing file references

**Usage:**
```bash
npm run check:links
```

**Exit codes:**
- `0` - All links are valid
- `1` - Broken links found or error occurred

### Combined Validation

Run both validation scripts together:

```bash
npm run docs:validate
```

This will run the documentation tests first, then check all links.

## Integration with CI/CD

These scripts can be integrated into your CI/CD pipeline to ensure documentation quality:

```yaml
- name: Validate Documentation
  run: npm run docs:validate
```

This will block merges if documentation is incomplete or contains broken links.

## Common Issues and Fixes

### Missing Documentation

If validation fails due to missing documentation:
- Add documentation for undocumented code entities in `docs/api/api-reference.md`
- Document all CRUD methods with their signatures
- Ensure all routes are documented in `docs/architecture/system-architecture.md`
- Document all npm scripts and workflow files

### Broken Links

If link checking fails:
- Update links to use correct relative paths
- Create missing documentation files
- Fix anchor references to match actual headings
- Add missing screenshot files or remove references

### Markdown Formatting

If markdown standards validation fails:
- Use kebab-case for all markdown filenames
- Ensure exactly one h1 heading per file
- Don't skip heading levels (h1 → h3)
- Include required sections (Overview, Examples)
- Use relative paths for internal links

## Development

Both scripts are written in TypeScript and use:
- Node.js built-in modules for file system operations
- Vitest for running tests
- fast-check for property-based testing
- remark for markdown parsing

To modify the scripts:
1. Edit the TypeScript files in this directory
2. Test your changes with `npm run validate:docs` or `npm run check:links`
3. Ensure the scripts exit with appropriate codes (0 for success, 1 for failure)
