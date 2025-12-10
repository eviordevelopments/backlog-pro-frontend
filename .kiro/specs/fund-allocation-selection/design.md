# Design Document

## Overview

This design outlines the implementation of fund allocation selection functionality in the Fund Accounts Manager. The feature allows users to create individual fund accounts and assign them to specific allocation categories (Technology, Growth, Team, Marketing, Emergency, Investments) at any time, not just during initial budget distribution. The system will maintain visual consistency through color coding and provide clear UI affordances for fund management.

## Architecture

The feature integrates with the existing AppContext state management system and extends the FundAccountsManager component. The architecture follows these principles:

1. **State Management**: Fund allocation category is stored as a property on each FundAccount object
2. **UI Components**: A new modal/dialog component handles fund creation with allocation selection
3. **Data Persistence**: All changes persist to localStorage through AppContext
4. **Visual Consistency**: Color coding maps allocation categories to visual indicators

### Component Hierarchy

```
FundAccountsManager
├── BudgetDistributionSetup (existing)
├── AddFundDialog (new)
│   ├── FundNameInput
│   ├── AllocationCategorySelect
│   └── InitialBalanceInput
├── ActiveFundAccountsDisplay (modified)
│   └── FundAccountCard (modified)
│       ├── AllocationCategoryBadge (new)
│       └── EditAllocationButton (new)
└── AllocationHistoryDisplay (existing)
```

## Components and Interfaces

### Modified FundAccount Type

The existing `FundAccount` type in `src/types/index.ts` needs to include an allocation category:

```typescript
interface FundAccount {
  id: string;
  name: string;
  balance: number;
  allocated: number;
  percentage: number;
  purpose: string;
  allocationCategory: 'Technology' | 'Growth' | 'Team' | 'Marketing' | 'Emergency' | 'Investments';
}
```

### New Components

#### AddFundDialog Component
- **Purpose**: Modal dialog for creating new fund accounts with allocation selection
- **Props**: 
  - `isOpen: boolean`
  - `onClose: () => void`
  - `onSubmit: (fund: Omit<FundAccount, 'id'>) => void`
- **State**: 
  - `fundName: string`
  - `initialBalance: string`
  - `selectedCategory: string`
- **Validation**: 
  - Fund name is required and non-empty
  - Initial balance is required and positive
  - Allocation category is required

#### AllocationCategoryBadge Component
- **Purpose**: Visual indicator showing which allocation category a fund belongs to
- **Props**: 
  - `category: FundAccount['allocationCategory']`
- **Behavior**: Displays category name with color coding matching FUND_COLORS

#### EditAllocationButton Component
- **Purpose**: Allows changing a fund's allocation category
- **Props**: 
  - `fund: FundAccount`
  - `onUpdate: (fund: FundAccount) => void`
- **Behavior**: Opens a selection dialog to change category

## Data Models

### FundAccount Enhancement

The FundAccount model is extended with an `allocationCategory` field that maps to one of six predefined categories. This field is required and must be one of the valid allocation categories.

### Allocation Category Mapping

```typescript
const ALLOCATION_CATEGORIES = {
  Technology: { color: '#3b82f6', icon: '💻' },
  Growth: { color: '#10b981', icon: '📈' },
  Team: { color: '#f59e0b', icon: '👥' },
  Marketing: { color: '#ec4899', icon: '📢' },
  Emergency: { color: '#ef4444', icon: '🚨' },
  Investments: { color: '#8b5cf6', icon: '💰' },
};
```

## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property 1: Fund allocation category persistence
*For any* fund account created with a specific allocation category, querying the fund from storage should return the same allocation category unchanged.
**Validates: Requirements 1.4**

Reasoning: This property ensures that when a user creates a fund with a selected allocation category, that category is correctly persisted and retrievable. This is a round-trip property that validates the core persistence mechanism.

### Property 2: Allocation category validation rejects invalid categories
*For any* fund creation attempt with an allocation category that is not one of the six valid categories (Technology, Growth, Team, Marketing, Emergency, Investments), the system SHALL reject the creation and the fund list SHALL remain unchanged.
**Validates: Requirements 1.5**

Reasoning: This property validates that the system enforces the constraint that only valid allocation categories are accepted. We test this by attempting to create funds with invalid categories and verifying the fund list is not modified.

### Property 3: Fund name and balance preservation on creation
*For any* fund account created with a valid name and positive initial balance, the fund's name and balance should remain unchanged after creation and retrieval from storage.
**Validates: Requirements 1.4**

Reasoning: This property ensures that fund creation preserves the user-provided name and balance values through the persistence layer. It validates that no data corruption occurs during storage operations.

### Property 4: Allocation category update preserves other properties
*For any* existing fund account, when its allocation category is changed to a new valid category, the fund's other properties (name, balance, allocated amount, purpose) should remain unchanged.
**Validates: Requirements 3.2, 3.3**

Reasoning: This property validates that category updates are isolated operations that don't have unintended side effects on other fund properties. It ensures data integrity during update operations.

### Property 5: Fund list integrity after valid fund addition
*For any* fund list, adding a new fund with a valid allocation category should increase the list length by exactly one, and the new fund should be retrievable by its ID.
**Validates: Requirements 1.4**

Reasoning: This property validates that fund creation correctly modifies the fund list and that the created fund is immediately accessible. It ensures the add operation is atomic and complete.

### Property 6: Allocation category color consistency
*For any* fund account with a specific allocation category, the color code applied to that fund should match the predefined color for that category consistently across all displays.
**Validates: Requirements 2.2**

Reasoning: This property ensures visual consistency by verifying that the same allocation category always receives the same color code, regardless of where or when it's displayed.

## Error Handling

1. **Invalid Allocation Category**: If user selects an invalid category, display error message and prevent submission
2. **Empty Fund Name**: If fund name is empty or whitespace-only, display validation error
3. **Invalid Balance**: If balance is negative, zero, or non-numeric, display validation error
4. **Storage Errors**: If localStorage operations fail, display user-friendly error message and log to console
5. **Duplicate Fund Names**: Warn user if fund name already exists in the same category (non-blocking)

## Testing Strategy

### Unit Testing

Unit tests will verify:
- Fund creation with valid allocation categories
- Fund creation rejection with invalid categories
- Fund name and balance validation
- Fund update operations preserve other properties
- Color and icon mapping for allocation categories

### Property-Based Testing

Property-based tests will verify:
- **Property 1**: Round-trip persistence of allocation category
- **Property 2**: Allocation category validation across all invalid inputs
- **Property 3**: Fund name and balance preservation through create/retrieve cycle
- **Property 4**: Allocation category updates don't affect other properties
- **Property 5**: Fund list integrity after additions

**Testing Framework**: Vitest with fast-check for property-based testing

**Configuration**: Each property-based test will run minimum 100 iterations to ensure robustness across random inputs.

**Test Annotation Format**: Each property-based test will include:
```typescript
// **Feature: fund-allocation-selection, Property {number}: {property_text}**
// **Validates: Requirements X.Y**
```

### Test Coverage Areas

1. **Fund Creation**: Valid/invalid categories, name validation, balance validation
2. **Fund Persistence**: Category persistence through storage operations
3. **Fund Updates**: Category changes, property preservation
4. **UI Interactions**: Dialog open/close, form submission, error display
5. **Edge Cases**: Empty strings, boundary values, special characters in names
