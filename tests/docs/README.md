# Documentation Validation Tests

This directory contains tests that validate the completeness and correctness of the project documentation.

## Structure

- `utils/` - Utility functions for parsing and validating documentation
- `property/` - Property-based tests for documentation completeness
- `unit/` - Unit tests for specific documentation requirements

## Running Tests

```bash
# Run all documentation tests
npm run test:docs

# Run tests in watch mode
npm run test:watch

# Run all tests
npm run test
```

## Test Categories

### Property-Based Tests
Tests that verify universal properties across all documentation:
- Route documentation completeness
- Code entity documentation completeness
- CRUD method documentation completeness
- Relationship documentation completeness
- Workflow and build documentation completeness
- Environment variable documentation completeness
- Markdown standards compliance

### Unit Tests
Tests that verify specific documentation requirements:
- Backup documentation exists
- Team management documentation exists
- Troubleshooting guide exists
- Maintenance documentation exists
- Getting started guide exists
- Kanban documentation exists
- Sprint documentation exists
- Folder structure matches specification
- Documentation in Git repository
