# Requirements Document

## Introduction

This feature enables users to select which fund allocation category a new fund account should be added to when creating it in the Fund Accounts Manager. Currently, funds are created during the initial budget distribution phase. This enhancement allows users to add individual funds to specific allocations (Technology, Growth, Team, Marketing, Emergency, Investments) at any time, with the ability to choose which allocation category the fund belongs to.

## Glossary

- **Fund Account**: A financial account that holds a portion of the total budget allocated to a specific category
- **Allocation Category**: One of six predefined fund categories: Technology, Growth, Team, Marketing, Emergency, or Investments
- **Fund Balance**: The total amount of money available in a fund account
- **Allocated Amount**: The portion of a fund's balance that has been spent or committed
- **Remaining Balance**: The difference between fund balance and allocated amount

## Requirements

### Requirement 1

**User Story:** As a financial manager, I want to add new fund accounts to specific allocation categories, so that I can manage funds flexibly without requiring a full budget redistribution.

#### Acceptance Criteria

1. WHEN a user clicks an "Add Fund" button in the Fund Accounts Manager THEN the system SHALL display a dialog or form to create a new fund account
2. WHEN creating a new fund account THEN the system SHALL require the user to select an allocation category from the six available options (Technology, Growth, Team, Marketing, Emergency, Investments)
3. WHEN creating a new fund account THEN the system SHALL require the user to enter a fund name and initial balance amount
4. WHEN a user submits a valid new fund account THEN the system SHALL add the fund to the selected allocation category and persist it to storage
5. IF a user attempts to create a fund without selecting an allocation category THEN the system SHALL prevent the addition and display a validation error message

### Requirement 2

**User Story:** As a financial manager, I want to see which allocation category each fund belongs to, so that I can quickly understand the fund structure and organization.

#### Acceptance Criteria

1. WHEN viewing the Active Fund Accounts display THEN the system SHALL show the allocation category for each fund account
2. WHEN displaying fund accounts THEN the system SHALL visually distinguish funds by their allocation category using consistent color coding
3. WHEN a user hovers over or selects a fund account THEN the system SHALL display the allocation category name clearly

### Requirement 3

**User Story:** As a financial manager, I want to modify which allocation category a fund belongs to, so that I can reorganize funds as business needs change.

#### Acceptance Criteria

1. WHEN a user selects an existing fund account THEN the system SHALL provide an option to change its allocation category
2. WHEN a user changes a fund's allocation category THEN the system SHALL update the fund's category and persist the change to storage
3. WHEN a fund's allocation category is changed THEN the system SHALL maintain all other fund properties (balance, allocated amount, purpose) unchanged
