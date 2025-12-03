# Design Document - Advanced Finances System

## Overview

The Advanced Finances System provides a comprehensive financial management interface with multi-period analysis, fund allocation, and key performance metrics. The system integrates with the existing AppContext to manage financial data and provides real-time calculations for complex financial metrics.

## Architecture

The system follows a layered architecture:

```
┌─────────────────────────────────────────┐
│     Financial UI Components             │
│  (FinancesOverview, FundAccounts, etc)  │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│     Financial Services Layer            │
│  (calculations, aggregations, trends)   │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│     AppContext & Data Layer             │
│  (state management, localStorage)       │
└─────────────────────────────────────────┘
```

## Components and Interfaces

### Core Components

1. **FinancesOverview** - Main dashboard with period selector and financial charts
2. **FinancialMetrics** - Display of CAC, LTV, cash runway, burn rate, churn rate
3. **IncomeExpenseAnalysis** - Project-level and cost-type breakdown
4. **FundAccountsManager** - Fund account management and distribution
5. **FinancialTrendAnalysis** - Historical trends and forecasting

### Data Interfaces

```typescript
interface FinancialPeriod {
  type: 'monthly' | 'quarterly' | 'annual';
  startDate: Date;
  endDate: Date;
  income: number;
  expense: number;
  profit: number;
}

interface FundAccount {
  id: string;
  name: 'Technology' | 'Growth' | 'Team' | 'Marketing' | 'Emergency' | 'Investments';
  balance: number;
  allocated: number;
  percentage: number;
  purpose: string;
}

interface FinancialMetrics {
  cac: number; // Customer Acquisition Cost
  ltv: number; // Lifetime Value
  cashRunway: number; // months
  burnRate: number; // monthly
  churnRate: number; // percentage
}

interface ProjectFinancial {
  projectId: string;
  projectName: string;
  income: number;
  fixedCosts: number;
  variableCosts: number;
  profit: number;
  margin: number;
}
```

## Data Models

### Financial Data Structure

```typescript
interface FinancialRecord {
  id: string;
  date: Date;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  projectId?: string;
  costType?: 'fixed' | 'variable';
  description: string;
}

interface BudgetAllocation {
  id: string;
  totalBudget: number;
  allocations: {
    technology: number;
    growth: number;
    team: number;
    marketing: number;
    emergency: number;
    investments: number;
  };
  createdAt: Date;
  status: 'pending' | 'approved' | 'distributed';
}
```

### Fund Account Defaults

```typescript
const DEFAULT_FUND_PERCENTAGES = {
  technology: 0.25,    // 25%
  growth: 0.20,        // 20%
  team: 0.30,          // 30%
  marketing: 0.15,     // 15%
  emergency: 0.05,     // 5%
  investments: 0.05    // 5%
};
```

## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property 1: Budget Distribution Completeness
*For any* total budget amount and fund allocation percentages, the sum of all distributed amounts across funds SHALL equal the total budget (within rounding tolerance of $0.01).

**Validates: Requirements 5.1, 5.2**

### Property 2: Fund Balance Consistency
*For any* fund account, the current balance SHALL equal the initial balance plus all deposits minus all withdrawals.

**Validates: Requirements 5.3**

### Property 3: Financial Period Aggregation
*For any* set of monthly financial records, aggregating them into quarterly periods SHALL produce the same total income, expense, and profit as summing the individual months.

**Validates: Requirements 1.2, 1.3**

### Property 4: Profit Calculation Accuracy
*For any* financial period, profit SHALL equal income minus total expenses (fixed + variable).

**Validates: Requirements 2.4, 3.5**

### Property 5: CAC Calculation Validity
*For any* period with marketing spend and customer acquisitions, CAC SHALL equal total marketing spend divided by number of new customers (or infinity if no customers acquired).

**Validates: Requirements 3.2**

### Property 6: Cash Runway Validity
*For any* cash balance and monthly burn rate, cash runway SHALL equal cash balance divided by burn rate (or infinity if burn rate is zero or negative).

**Validates: Requirements 3.4**

### Property 7: Cost Type Segregation
*For any* expense record, it SHALL be classified as either fixed or variable, and the sum of fixed and variable costs SHALL equal total expenses.

**Validates: Requirements 4.2, 6.1**

### Property 8: Project Profitability Accuracy
*For any* project, project profit SHALL equal project income minus project total expenses (fixed + variable).

**Validates: Requirements 4.3**

### Property 9: Fund Percentage Validity
*For any* fund allocation configuration, the sum of all fund percentages SHALL equal 1.0 (100%).

**Validates: Requirements 5.5**

### Property 10: Period Data Consistency
*For any* financial period, switching between different period views (monthly/quarterly/annual) and back to the original view SHALL produce identical financial data.

**Validates: Requirements 1.5**

## Error Handling

- Invalid period selections: Display error message and revert to previous valid period
- Negative fund balances: Prevent withdrawals that would result in negative balance
- Division by zero in metrics: Display "N/A" or infinity symbol for undefined metrics
- Missing project data: Exclude from analysis with warning notification
- Rounding errors: Use fixed-point arithmetic for currency calculations

## Testing Strategy

### Unit Tests
- Fund distribution calculations with various budget amounts
- Financial metric calculations (CAC, LTV, runway, burn rate)
- Period aggregation logic (monthly to quarterly to annual)
- Cost type classification and segregation
- Project profitability calculations

### Property-Based Tests
- Property 1: Budget distribution completeness across random budget amounts
- Property 2: Fund balance consistency with random transactions
- Property 3: Period aggregation consistency with random financial records
- Property 4: Profit calculation accuracy with random income/expense combinations
- Property 5: CAC calculation validity with random marketing spend and customer counts
- Property 6: Cash runway validity with random cash balances and burn rates
- Property 7: Cost type segregation with random expense records
- Property 8: Project profitability accuracy with random project data
- Property 9: Fund percentage validity with random allocation configurations
- Property 10: Period data consistency with random period switches

**Testing Framework**: Vitest with fast-check for property-based testing
**Minimum Iterations**: 100 per property test
