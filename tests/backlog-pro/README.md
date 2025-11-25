# Backlog Pro System Tests

This directory contains all tests for the Backlog Pro - Agile Suite system.

## Directory Structure

```
tests/backlog-pro/
├── setup.ts              # Test setup and configuration
├── utils/                # Test utilities and generators
│   ├── generators.ts     # Property-based testing generators
│   ├── test-helpers.ts   # Helper functions for testing
│   └── index.ts          # Exports all utilities
├── unit/                 # Unit tests
│   └── *.test.ts         # Specific examples and edge cases
└── property/             # Property-based tests
    └── *.test.ts         # Universal properties (100+ iterations)
```

## Testing Strategy

### Unit Tests
Unit tests verify specific examples, edge cases, and error conditions:
- Specific input/output examples
- Edge cases (empty lists, boundary values)
- Error handling scenarios
- Integration between components

### Property-Based Tests
Property tests verify universal properties across all inputs using fast-check:
- Each test runs a minimum of 100 iterations
- Tests are tagged with feature name and property number
- Format: `**Feature: backlog-pro-system, Property X: description**`
- Validates requirements from design document

## Running Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- tests/backlog-pro/unit/task-crud.test.ts
```

## Test Utilities

### Generators
All entity generators are available from `tests/backlog-pro/utils/generators.ts`:
- `taskArb()` - Generate Task entities
- `userStoryArb()` - Generate UserStory entities
- `sprintArb()` - Generate Sprint entities
- `teamMemberArb()` - Generate TeamMember entities
- `riskArb()` - Generate Risk entities
- `profitShareArb()` - Generate ProfitShare entities
- `kpiMetricsArb()` - Generate KPIMetrics

### Test Helpers
Helper functions from `tests/backlog-pro/utils/test-helpers.ts`:
- `renderWithProviders()` - Render components with AppContext and Router
- `setupMockLocalStorage()` - Mock localStorage for tests
- `waitFor()` - Wait for async conditions
- `deepEqual()` - Deep equality comparison

## Writing Tests

### Unit Test Example
```typescript
import { describe, it, expect } from 'vitest';
import { taskArb } from '../utils/generators';

describe('Task CRUD Operations', () => {
  it('should create a task with all properties', () => {
    // Test specific example
  });
});
```

### Property Test Example
```typescript
import { describe, it } from 'vitest';
import * as fc from 'fast-check';
import { taskArb } from '../utils/generators';

// **Feature: backlog-pro-system, Property 1: Task creation adds to list**
describe('Property 1: Task creation adds to list', () => {
  it('should add task to list for any valid task', () => {
    fc.assert(
      fc.property(taskArb(), (task) => {
        // Test property holds for all generated tasks
      }),
      { numRuns: 100 }
    );
  });
});
```

## Configuration

Tests use Vitest with the following configuration:
- Environment: jsdom (for React component testing)
- Globals: enabled (describe, it, expect available globally)
- Setup file: `tests/backlog-pro/setup.ts`
- Coverage: v8 provider with HTML reports

See `vitest.config.ts` for full configuration.
