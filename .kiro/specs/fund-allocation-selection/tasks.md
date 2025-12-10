# Implementation Plan

- [x] 1. Update FundAccount type with allocation category




  - Modify `src/types/index.ts` to add `allocationCategory` field to FundAccount interface
  - Add type definition for allocation category union type
  - _Requirements: 1.2, 2.1_

- [x] 2. Create AddFundDialog component





  - Create `src/components/finances/AddFundDialog.tsx` with form for fund creation
  - Implement fund name input with validation (non-empty, max length)
  - Implement initial balance input with validation (positive number)
  - Implement allocation category select dropdown with all six options
  - Add form submission handler that validates all fields
  - _Requirements: 1.1, 1.2, 1.3_

- [x]* 2.1 Write property test for fund creation validation


  - **Property 2: Allocation category validation rejects invalid categories**
  - **Validates: Requirements 1.5**

- [x] 3. Create AllocationCategoryBadge component





  - Create `src/components/finances/AllocationCategoryBadge.tsx` to display category with color coding
  - Map allocation categories to colors and icons using FUND_COLORS constant
  - Display category name and icon
  - _Requirements: 2.1, 2.2_

- [x] 4. Create EditAllocationDialog component




  - Create `src/components/finances/EditAllocationDialog.tsx` for changing fund allocation category
  - Implement category selection dropdown
  - Add validation to ensure new category is different from current
  - _Requirements: 3.1_

- [x] 5. Update FundAccountsManager component




  - Add "Add Fund" button to the component header
  - Integrate AddFundDialog component with open/close state management
  - Connect dialog submission to AppContext addFundAccount method
  - _Requirements: 1.1_

- [x] 6. Update FundAccountCard display




  - Modify fund card rendering to include AllocationCategoryBadge
  - Add edit button to open EditAllocationDialog
  - Display allocation category prominently
  - _Requirements: 2.1, 2.2, 3.1_

- [x] 7. Update AppContext to handle fund allocation category





  - Modify addFundAccount method to accept allocation category
  - Modify updateFundAccount method to handle category updates
  - Ensure localStorage persistence includes allocation category
  - _Requirements: 1.4, 3.2_

- [x]* 7.1 Write property test for fund allocation category persistence

  - **Property 1: Fund allocation category persistence**
  - **Validates: Requirements 1.4**

- [x]* 7.2 Write property test for fund name and balance preservation

  - **Property 3: Fund name and balance preservation on creation**
  - **Validates: Requirements 1.4**

- [x] 8. Update sample data initialization




  - Modify `src/utils/sampleData.ts` to include allocation category for all sample funds
  - Ensure all existing funds have valid allocation categories assigned
  - _Requirements: 1.4_

- [x]* 8.1 Write property test for fund list integrity after addition

  - **Property 5: Fund list integrity after valid fund addition**
  - **Validates: Requirements 1.4**

- [x] 9. Checkpoint - Ensure all tests pass




  - Ensure all tests pass, ask the user if questions arise.

- [x]* 10. Write property test for allocation category update consistency

  - **Property 4: Allocation category update preserves other properties**
  - **Validates: Requirements 3.2, 3.3**

- [x]* 11. Write property test for allocation category color consistency

  - **Property 6: Allocation category color consistency**
  - **Validates: Requirements 2.2**

- [ ]* 12. Write unit tests for AddFundDialog component
  - Test form validation for empty fund name
  - Test form validation for invalid balance (negative, zero, non-numeric)
  - Test form validation for missing allocation category
  - Test successful form submission with valid inputs
  - Test dialog open/close functionality
  - _Requirements: 1.1, 1.2, 1.3, 1.5_

- [ ]* 13. Write unit tests for AllocationCategoryBadge component
  - Test correct color rendering for each allocation category
  - Test correct icon display for each category
  - Test category name display
  - _Requirements: 2.1, 2.2_

- [ ]* 14. Write unit tests for EditAllocationDialog component
  - Test category selection dropdown functionality
  - Test validation preventing same category selection
  - Test successful category update submission
  - _Requirements: 3.1_

- [x] 15. Final Checkpoint - Ensure all tests pass




  - Ensure all tests pass, ask the user if questions arise.
