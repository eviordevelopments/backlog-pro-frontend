# Testing Infrastructure Setup

This document describes the complete testing infrastructure for the Backlog Pro - Agile Suite system.

## Overview

The testing infrastructure is built on:
- **Vitest** - Fast unit test framework with native ESM support
- **fast-check** - Property-based testing library for TypeScript
- **@testing-library/react** - React component testing utilities
- **jsdom** - Browser environment simulation

## Directory Structure

```
tests/backlog-pro/
├── setup.ts                    # Test configuration and global setup
├── smoke.test.ts               # Infrastructure validation tests
├── README.md                   # Testing guide and documentation
├── TESTING_INFRASTRUCTURE.md   # This file
├── utils/                      # Test utilities
│   ├── generators.ts           # Property-based testing generators
│   ├── test-helpers.ts         # Helper functions for testing
│   ├── index.ts                # Exports all utilities
│   └── GENERATORS.md           # Generator documentation
├── unit/                       # Unit tests directory
│   └── .gitkeep
└── property/                   # Property-based tests directory
    └── .gitkeep
```

## Configuration Files

### vitest.config.ts
Main Vitest configuration for Backlog Pro tests:
- Environment: jsdom (React component testing)
- Globals: enabled (describe, it, expect)
- Setup file: tests/backlog-pro/setup.ts
- Coverage: v8 provider with HTML reports
- Includes: tests/backlog-pro/**/*.test.{ts,tsx}

### setup.ts
Global test setup that runs before each test:
- Imports @testing-library/jest-dom matchers
- Cleans up React components after each test
- Clears localStorage after each test
- Mocks window.matchMedia for responsive tests

## Installed Dependencies

### Production Dependencies (already installed)
- `vitest@^4.0.10` - Test framework
- `fast-check@^4.3.0` - Property-based testing

### Development Dependencies (newly installed)
- `@testing-library/react` - React testing utilities
- `@testing-library/jest-dom` - DOM matchers
- `jsdom` - Browser environment

## Test Utilities

### Generators (tests/backlog-pro/utils/generators.ts)

Property-based testing generators for all entity types:

**Entity Generators:**
- `taskArb(overrides?)` - Generate Task entities
- `userStoryArb(overrides?)` - Generate UserStory entities
- `sprintArb(overrides?)` - Generate Sprint entities
- `teamMemberArb(overrides?)` - Generate TeamMember entities
- `riskArb(overrides?)` - Generate Risk entities
- `profitShareArb(overrides?)` - Generate ProfitShare entities
- `kpiMetricsArb(overrides?)` - Generate KPIMetrics

**Enum Generators:**
- `taskStatusArb()` - Generate TaskStatus values
- `taskPriorityArb()` - Generate TaskPriority values
- `teamRoleArb()` - Generate TeamRole values

**Array Generators:**
- `taskArrayArb(min, max)` - Generate arrays of Tasks
- `userStoryArrayArb(min, max)` - Generate arrays of UserStories
- `sprintArrayArb(min, max)` - Generate arrays of Sprints
- `teamMemberArrayArb(min, max)` - Generate arrays of TeamMembers
- `riskArrayArb(min, max)` - Generate arrays of Risks
- `profitShareArrayArb(min, max)` - Generate arrays of ProfitShares

**Utility Generators:**
- `isoDateArb()` - Generate ISO date strings (2000-2030 range)

### Test Helpers (tests/backlog-pro/utils/test-helpers.ts)

Helper functions for testing:

- `renderWithProviders(ui, options?)` - Render React components with AppContext and Router
- `setupMockLocalStorage()` - Create mock localStorage for tests
- `waitFor(condition, timeout, interval)` - Wait for async conditions
- `deepEqual(a, b)` - Deep equality comparison
- `delay(ms)` - Create delay promise

## Running Tests

### Commands

```bash
# Run all tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- tests/backlog-pro/smoke.test.ts

# Run with coverage
npm test -- --coverage

# Run only property tests
npm test -- tests/backlog-pro/property

# Run only unit tests
npm test -- tests/backlog-pro/unit
```

### Test Patterns

**Unit Test Example:**
```typescript
import { describe, it, expect } from 'vitest';

describe('Task CRUD Operations', () => {
  it('should create a task', () => {
    // Test specific example
  });
});
```

**Property Test Example:**
```typescript
import { describe, it } from 'vitest';
import * as fc from 'fast-check';
import { taskArb } from '../utils/generators';

// **Feature: backlog-pro-system, Property 1: Task creation adds to list**
describe('Property 1: Task creation adds to list', () => {
  it('should add task to list for any valid task', () => {
    fc.assert(
      fc.property(taskArb(), (task) => {
        // Test property
      }),
      { numRuns: 100 }
    );
  });
});
```

## Validation

The infrastructure has been validated with smoke tests that verify:

✅ All entity generators produce valid data
✅ Generated data respects type constraints
✅ Enum generators produce valid enum values
✅ Risk score calculation is correct (probability * impact)
✅ localStorage is available and functional
✅ window.matchMedia is properly mocked

## Next Steps

The testing infrastructure is now ready for:

1. **Task 2**: Implement and test Task CRUD operations
2. **Task 3**: Implement and test Task validation
3. **Task 4**: Implement and test User Story CRUD operations
4. And so on...

Each subsequent task will use these generators and helpers to write both unit tests and property-based tests.

## Best Practices

1. **Property Tests**: Run minimum 100 iterations
2. **Test Tags**: Tag each property test with feature name and property number
3. **Generators**: Use overrides sparingly, only for essential constraints
4. **Cleanup**: Tests automatically clean up after themselves
5. **Isolation**: Each test runs in isolation with fresh state

## Troubleshooting

### Common Issues

**Issue**: Tests fail with "Invalid Date"
**Solution**: Use `isoDateArb()` which constrains dates to valid range

**Issue**: localStorage not available
**Solution**: Setup file automatically provides localStorage mock

**Issue**: React component tests fail
**Solution**: Use `renderWithProviders()` to wrap components with necessary providers

**Issue**: Property tests are slow
**Solution**: Reduce `numRuns` during development, use 100+ for CI/CD

## Documentation

- [README.md](./README.md) - Testing guide and overview
- [GENERATORS.md](./utils/GENERATORS.md) - Detailed generator documentation
- [Design Document](../../.kiro/specs/backlog-pro-system/design.md) - Correctness properties
- [Requirements](../../.kiro/specs/backlog-pro-system/requirements.md) - Acceptance criteria

## Coverage Goals

The testing strategy aims for:
- **Unit Tests**: Cover specific examples and edge cases
- **Property Tests**: Cover universal properties (45 properties defined)
- **Integration Tests**: Cover component interactions
- **Coverage Target**: 80%+ code coverage

## Maintenance

When adding new entity types:
1. Add type definition to `src/types/index.ts`
2. Create generator in `tests/backlog-pro/utils/generators.ts`
3. Add smoke test to validate generator
4. Update GENERATORS.md documentation
5. Export from `tests/backlog-pro/utils/index.ts`
