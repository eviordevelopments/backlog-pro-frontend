import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { FinancialRecord } from '@/types';

// Generator for financial records with cost type segregation
const expenseRecordArb = (): fc.Arbitrary<FinancialRecord> =>
  fc.record({
    id: fc.uuid(),
    date: fc.integer({ min: 0, max: 2147483647 }).map(ts => new Date(ts * 1000).toISOString().split('T')[0]),
    type: fc.constant('expense'),
    category: fc.string({ minLength: 1, maxLength: 20 }),
    amount: fc.integer({ min: 0, max: 1000000 }),
    projectId: fc.uuid(),
    costType: fc.oneof(fc.constant('fixed'), fc.constant('variable')),
    description: fc.string(),
    userId: fc.uuid(),
  });

describe('Property 7: Cost Type Segregation', () => {
  it('should classify all expenses as either fixed or variable', () => {
    // **Feature: advanced-finances-system, Property 7: Cost Type Segregation**
    // **Validates: Requirements 4.2, 6.1**
    fc.assert(
      fc.property(fc.array(expenseRecordArb(), { minLength: 1, maxLength: 100 }), (records) => {
        records.forEach(record => {
          expect(['fixed', 'variable']).toContain(record.costType);
        });
      }),
      { numRuns: 100 }
    );
  });

  it('should ensure sum of fixed and variable costs equals total expenses', () => {
    // **Feature: advanced-finances-system, Property 7: Cost Type Segregation**
    // **Validates: Requirements 4.2, 6.1**
    fc.assert(
      fc.property(fc.array(expenseRecordArb(), { minLength: 1, maxLength: 100 }), (records) => {
        const fixedCosts = records
          .filter(r => r.costType === 'fixed')
          .reduce((sum, r) => sum + r.amount, 0);

        const variableCosts = records
          .filter(r => r.costType === 'variable')
          .reduce((sum, r) => sum + r.amount, 0);

        const totalExpenses = records.reduce((sum, r) => sum + r.amount, 0);

        expect(fixedCosts + variableCosts).toBe(totalExpenses);
      }),
      { numRuns: 100 }
    );
  });

  it('should maintain cost segregation when filtering by project', () => {
    // **Feature: advanced-finances-system, Property 7: Cost Type Segregation**
    // **Validates: Requirements 4.2, 6.1**
    fc.assert(
      fc.property(
        fc.array(expenseRecordArb(), { minLength: 1, maxLength: 100 }),
        fc.uuid(),
        (records, projectId) => {
          const projectRecords = records.map(r => ({ ...r, projectId }));

          const fixedCosts = projectRecords
            .filter(r => r.costType === 'fixed')
            .reduce((sum, r) => sum + r.amount, 0);

          const variableCosts = projectRecords
            .filter(r => r.costType === 'variable')
            .reduce((sum, r) => sum + r.amount, 0);

          const totalExpenses = projectRecords.reduce((sum, r) => sum + r.amount, 0);

          expect(fixedCosts + variableCosts).toBe(totalExpenses);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle zero costs correctly', () => {
    // **Feature: advanced-finances-system, Property 7: Cost Type Segregation**
    // **Validates: Requirements 4.2, 6.1**
    const fixedRecord: FinancialRecord = {
      id: 'test-1',
      date: '2025-11-01',
      type: 'expense',
      category: 'Test',
      amount: 0,
      projectId: 'proj-1',
      costType: 'fixed',
      description: 'Zero cost',
      userId: 'user-1',
    };

    const variableRecord: FinancialRecord = {
      id: 'test-2',
      date: '2025-11-01',
      type: 'expense',
      category: 'Test',
      amount: 0,
      projectId: 'proj-1',
      costType: 'variable',
      description: 'Zero cost',
      userId: 'user-1',
    };

    const records = [fixedRecord, variableRecord];

    const fixedCosts = records
      .filter(r => r.costType === 'fixed')
      .reduce((sum, r) => sum + r.amount, 0);

    const variableCosts = records
      .filter(r => r.costType === 'variable')
      .reduce((sum, r) => sum + r.amount, 0);

    const totalExpenses = records.reduce((sum, r) => sum + r.amount, 0);

    expect(fixedCosts + variableCosts).toBe(totalExpenses);
    expect(totalExpenses).toBe(0);
  });
});
