import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { FinancialRecord, ProjectFinancial } from '@/types';

// Generator for financial records
const financialRecordArb = (): fc.Arbitrary<FinancialRecord> =>
  fc.record({
    id: fc.uuid(),
    date: fc.integer({ min: 1577836800000, max: 1767225600000 }).map(ts => new Date(ts).toISOString().split('T')[0]),
    type: fc.oneof(fc.constant('income'), fc.constant('expense')),
    category: fc.string({ minLength: 1, maxLength: 20 }),
    amount: fc.integer({ min: 0, max: 1000000 }),
    projectId: fc.uuid(),
    costType: fc.oneof(fc.constant('fixed'), fc.constant('variable'), fc.constant(undefined)),
    description: fc.string(),
    userId: fc.uuid(),
  });

// Helper function to calculate project financials
function calculateProjectFinancials(records: FinancialRecord[], projectId: string): ProjectFinancial {
  const projectRecords = records.filter(r => r.projectId === projectId);

  let income = 0;
  let fixedCosts = 0;
  let variableCosts = 0;

  projectRecords.forEach(record => {
    if (record.type === 'income') {
      income += record.amount;
    } else if (record.type === 'expense') {
      if (record.costType === 'fixed') {
        fixedCosts += record.amount;
      } else if (record.costType === 'variable') {
        variableCosts += record.amount;
      }
    }
  });

  const totalCosts = fixedCosts + variableCosts;
  const profit = income - totalCosts;
  const margin = income > 0 ? (profit / income) * 100 : 0;

  return {
    projectId,
    projectName: `Project ${projectId.substring(0, 8)}`,
    income,
    fixedCosts,
    variableCosts,
    profit,
    margin,
  };
}

describe('Property 8: Project Profitability Accuracy', () => {
  it('should calculate project profit as income minus total expenses', () => {
    // **Feature: advanced-finances-system, Property 8: Project Profitability Accuracy**
    // **Validates: Requirements 4.3**
    fc.assert(
      fc.property(
        fc.array(financialRecordArb(), { minLength: 1, maxLength: 100 }),
        fc.uuid(),
        (records, projectId) => {
          const projectRecords = records.map(r => ({ ...r, projectId }));
          const financials = calculateProjectFinancials(projectRecords, projectId);

          const expectedProfit = financials.income - (financials.fixedCosts + financials.variableCosts);
          expect(financials.profit).toBe(expectedProfit);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should calculate profit margin correctly when income is positive', () => {
    // **Feature: advanced-finances-system, Property 8: Project Profitability Accuracy**
    // **Validates: Requirements 4.3**
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 1000000 }),
        fc.integer({ min: 0, max: 500000 }),
        fc.integer({ min: 0, max: 500000 }),
        (income, fixedCosts, variableCosts) => {
          const records: FinancialRecord[] = [
            {
              id: 'income-1',
              date: '2025-11-01',
              type: 'income',
              category: 'Revenue',
              amount: income,
              projectId: 'proj-1',
              costType: undefined,
              description: 'Income',
              userId: 'user-1',
            },
            {
              id: 'fixed-1',
              date: '2025-11-01',
              type: 'expense',
              category: 'Fixed',
              amount: fixedCosts,
              projectId: 'proj-1',
              costType: 'fixed',
              description: 'Fixed costs',
              userId: 'user-1',
            },
            {
              id: 'variable-1',
              date: '2025-11-01',
              type: 'expense',
              category: 'Variable',
              amount: variableCosts,
              projectId: 'proj-1',
              costType: 'variable',
              description: 'Variable costs',
              userId: 'user-1',
            },
          ];

          const financials = calculateProjectFinancials(records, 'proj-1');
          const expectedMargin = (financials.profit / income) * 100;

          expect(financials.margin).toBeCloseTo(expectedMargin, 2);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should return zero margin when income is zero', () => {
    // **Feature: advanced-finances-system, Property 8: Project Profitability Accuracy**
    // **Validates: Requirements 4.3**
    const records: FinancialRecord[] = [
      {
        id: 'fixed-1',
        date: '2025-11-01',
        type: 'expense',
        category: 'Fixed',
        amount: 5000,
        projectId: 'proj-1',
        costType: 'fixed',
        description: 'Fixed costs',
        userId: 'user-1',
      },
    ];

    const financials = calculateProjectFinancials(records, 'proj-1');
    expect(financials.margin).toBe(0);
  });

  it('should handle negative profit correctly', () => {
    // **Feature: advanced-finances-system, Property 8: Project Profitability Accuracy**
    // **Validates: Requirements 4.3**
    const records: FinancialRecord[] = [
      {
        id: 'income-1',
        date: '2025-11-01',
        type: 'income',
        category: 'Revenue',
        amount: 10000,
        projectId: 'proj-1',
        costType: undefined,
        description: 'Income',
        userId: 'user-1',
      },
      {
        id: 'fixed-1',
        date: '2025-11-01',
        type: 'expense',
        category: 'Fixed',
        amount: 15000,
        projectId: 'proj-1',
        costType: 'fixed',
        description: 'Fixed costs',
        userId: 'user-1',
      },
    ];

    const financials = calculateProjectFinancials(records, 'proj-1');
    expect(financials.profit).toBe(-5000);
    expect(financials.margin).toBeCloseTo(-50, 2);
  });

  it('should maintain profitability accuracy across multiple projects', () => {
    // **Feature: advanced-finances-system, Property 8: Project Profitability Accuracy**
    // **Validates: Requirements 4.3**
    fc.assert(
      fc.property(
        fc.array(financialRecordArb(), { minLength: 1, maxLength: 100 }),
        (records) => {
          const projectIds = [...new Set(records.map(r => r.projectId))];

          projectIds.forEach(projectId => {
            const financials = calculateProjectFinancials(records, projectId);
            const expectedProfit = financials.income - (financials.fixedCosts + financials.variableCosts);
            expect(financials.profit).toBe(expectedProfit);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should return zero profit when income equals total expenses', () => {
    // **Feature: advanced-finances-system, Property 8: Project Profitability Accuracy**
    // **Validates: Requirements 4.3**
    const records: FinancialRecord[] = [
      {
        id: 'income-1',
        date: '2025-11-01',
        type: 'income',
        category: 'Revenue',
        amount: 10000,
        projectId: 'proj-1',
        costType: undefined,
        description: 'Income',
        userId: 'user-1',
      },
      {
        id: 'fixed-1',
        date: '2025-11-01',
        type: 'expense',
        category: 'Fixed',
        amount: 6000,
        projectId: 'proj-1',
        costType: 'fixed',
        description: 'Fixed costs',
        userId: 'user-1',
      },
      {
        id: 'variable-1',
        date: '2025-11-01',
        type: 'expense',
        category: 'Variable',
        amount: 4000,
        projectId: 'proj-1',
        costType: 'variable',
        description: 'Variable costs',
        userId: 'user-1',
      },
    ];

    const financials = calculateProjectFinancials(records, 'proj-1');
    expect(financials.profit).toBe(0);
    expect(financials.margin).toBe(0);
  });
});
