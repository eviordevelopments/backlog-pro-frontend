# Calendar Filters and Views - Test Suite

This directory contains the test suite for the Calendar Filters and Views feature.

## Directory Structure

```
tests/calendar-filters-views/
├── unit/                 # Unit tests for individual components
├── property/             # Property-based tests for correctness properties
├── utils/                # Test utilities, generators, and helpers
├── README.md             # This file
└── setup.ts              # Test setup and configuration
```

## Test Organization

### Unit Tests (`unit/`)
Unit tests verify specific examples and edge cases:
- Component rendering and interactions
- Filter state updates
- localStorage operations
- Event filtering logic
- Date navigation

### Property-Based Tests (`property/`)
Property-based tests verify universal properties that should hold across all inputs:
- For all filter combinations, only matching events are displayed
- For all view modes, the correct date range is shown
- For all filter states, persistence and restoration work correctly
- For all event sets, category colors are distinct
- For all team member selections, only assigned events are shown

### Test Utilities (`utils/`)
Reusable generators and helper functions:
- `generators.ts` - Fast-check arbitrary generators for test data
- `test-helpers.ts` - Utility functions for date, filter, and display operations
- `GENERATORS.md` - Documentation for generators and helpers

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run only calendar filters tests
npm test -- tests/calendar-filters-views

# Run only unit tests
npm test -- tests/calendar-filters-views/unit

# Run only property tests
npm test -- tests/calendar-filters-views/property
```

## Testing Framework

- **Framework**: Vitest
- **Property-Based Testing**: fast-check
- **Minimum Iterations**: 100 per property test

## Test Coverage

Each correctness property from the design document has a corresponding property-based test:

1. Category Filter Exclusion
2. Category Filter Inclusion
3. Default Category Filters
4. Category Filter Persistence
5. Team Member Filter Inclusion
6. Team Member Filter Clearing
7. Default Team Member Selection
8. Team Member Filter Persistence
9. Week View Display
10. Month View Display
11. Filter Persistence Across View Switch
12. Default View Mode
13. View Preference Persistence
14. Event Category Color Distinctness
15. Event Information Display
16. Multiple Events Same Day Handling
17. Event Tooltip Information
18. Filter Control Visibility
19. Active Filter Visual Feedback
20. Reset Filters Functionality
21. Mobile Filter Accessibility
22. Event Count Display
