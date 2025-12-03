import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { FinancialRecord, FinancialPeriod } from '@/types';
import { aggregateFinancialData, validatePeriodConsistency } from '@/utils/financialPeriods';

// Generator for FinancialRecord
const financialRecordArb = (): fc.Arbitrary<FinancialRecord> =>
  fc.record({
    id: fc.uuid(),
    date: fc.date({
      min: new Date('2024-01-01T00:00:00Z'),
      max: new Date('2024-12-31T23:59:59Z'),
    }).map(d => {
      if (isNaN(d.getTime())) {
        return new Date('2024-06-15T00:00:00Z').toISOString();
      }
      return d.toISOString();
    }),
    type: fc.constantFrom<'income' | 'expense'>('income', 'expense'),
    category: fc.string({ minLength: 1, maxLength: 20 }),
    amount: fc.integer({ min: 0, max: 100000 }),
    projectId: fc.uuid(),
    costType: fc.option(fc.constantFrom<'fixed' | 'variable'>('fixed', 'variable'), { nil: undefined }),
    description: fc.string({ minLength: 1, maxLength: 100 }),
    userId: fc.uuid(),
  });

describe('Financial Period Aggregation - Property 3', () => {
  it('should aggregate monthly data into quarterly periods correctly', () => {
    fc.assert(
      fc.property(fc.array(financialRecordArb(), { minLength: 1, maxLength: 100 }), (records) => {
        const monthlyPeriods = aggregateFinancialData(records, 'monthly', 12);
        const quarterlyPeriods = aggregateFinancialData(records, 'quarterly', 12);

        // Verify quarterly aggregation equals sum of monthly data
        for (let q = 0; q < quarterlyPeriods.length && q * 3 < monthlyPeriods.length; q++) {
          const quarterlyIncome = quarterlyPeriods[q].income;
          const quarterlyExpense = quarterlyPeriods[q].expense;

          const monthlyIncome = monthlyPeriods
            .slice(q * 3, q * 3 + 3)
            .reduce((sum, p) => sum + p.income, 0);

          const monthlyExpense = monthlyPeriods
            .slice(q * 3, q * 3 + 3)
            .reduce((sum, p) => sum + p.expense, 0);

          // Allow for floating point rounding errors
          expect(Math.abs(quarterlyIncome - monthlyIncome)).toBeLessThan(0.01);
          expect(Math.abs(quarterlyExpense - monthlyExpense)).toBeLessThan(0.01);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('should maintain profit calculation accuracy across period aggregations', () => {
    fc.assert(
      fc.property(fc.array(financialRecordArb(), { minLength: 1, maxLength: 100 }), (records) => {
        const monthlyPeriods = aggregateFinancialData(records, 'monthly', 12);
        const quarterlyPeriods = aggregateFinancialData(records, 'quarterly', 12);

        // Verify profit = income - expense for all periods
        for (const period of monthlyPeriods) {
          const expectedProfit = period.income - period.expense;
          expect(Math.abs(period.profit - expectedProfit)).toBeLessThan(0.01);
        }

        for (const period of quarterlyPeriods) {
          const expectedProfit = period.income - period.expense;
          expect(Math.abs(period.profit - expectedProfit)).toBeLessThan(0.01);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('should produce consistent results when aggregating the same data multiple times', () => {
    fc.assert(
      fc.property(fc.array(financialRecordArb(), { minLength: 1, maxLength: 100 }), (records) => {
        const aggregation1 = aggregateFinancialData(records, 'monthly', 12);
        const aggregation2 = aggregateFinancialData(records, 'monthly', 12);

        expect(aggregation1).toEqual(aggregation2);
      }),
      { numRuns: 100 }
    );
  });

  it('should handle empty financial records gracefully', () => {
    const emptyRecords: FinancialRecord[] = [];
    const monthlyPeriods = aggregateFinancialData(emptyRecords, 'monthly', 12);

    // Should return periods with zero values
    expect(monthlyPeriods.length).toBeGreaterThan(0);
    for (const period of monthlyPeriods) {
      expect(period.income).toBe(0);
      expect(period.expense).toBe(0);
      expect(period.profit).toBe(0);
    }
  });

  it('should correctly separate income and expense records', () => {
    fc.assert(
      fc.property(
        fc.array(financialRecordArb(), { minLength: 1, maxLength: 100 }),
        (records) => {
          const monthlyPeriods = aggregateFinancialData(records, 'monthly', 12);

          // For each period, verify that income and expense are correctly separated
          for (const period of monthlyPeriods) {
            const periodStart = new Date(period.startDate);
            const periodEnd = new Date(period.endDate);

            const periodRecords = records.filter(r => {
              const recordDate = new Date(r.date);
              return recordDate.getTime() >= periodStart.getTime() && 
                     recordDate.getTime() <= periodEnd.getTime();
            });

            const expectedIncome = periodRecords
              .filter(r => r.type === 'income')
              .reduce((sum, r) => sum + r.amount, 0);

            const expectedExpense = periodRecords
              .filter(r => r.type === 'expense')
              .reduce((sum, r) => sum + r.amount, 0);

            expect(Math.abs(period.income - expectedIncome)).toBeLessThan(0.01);
            expect(Math.abs(period.expense - expectedExpense)).toBeLessThan(0.01);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Financial Period Data Consistency - Property 10', () => {
  it('should maintain data consistency when switching between period views', () => {
    fc.assert(
      fc.property(fc.array(financialRecordArb(), { minLength: 1, maxLength: 100 }), (records) => {
        // Get data in different period views
        const monthlyFirst = aggregateFinancialData(records, 'monthly', 12);
        const quarterlyView = aggregateFinancialData(records, 'quarterly', 12);
        const monthlyAgain = aggregateFinancialData(records, 'monthly', 12);

        // Switching back to monthly should produce identical data
        expect(monthlyFirst).toEqual(monthlyAgain);

        // Total income/expense should be consistent across views
        const monthlyTotalIncome = monthlyFirst.reduce((sum, p) => sum + p.income, 0);
        const quarterlyTotalIncome = quarterlyView.reduce((sum, p) => sum + p.income, 0);

        expect(Math.abs(monthlyTotalIncome - quarterlyTotalIncome)).toBeLessThan(0.01);
      }),
      { numRuns: 100 }
    );
  });

  it('should validate period consistency correctly', () => {
    fc.assert(
      fc.property(fc.array(financialRecordArb(), { minLength: 1, maxLength: 100 }), (records) => {
        const monthlyPeriods = aggregateFinancialData(records, 'monthly', 12);
        const quarterlyPeriods = aggregateFinancialData(records, 'quarterly', 12);

        const isConsistent = validatePeriodConsistency(records, monthlyPeriods, quarterlyPeriods);
        expect(isConsistent).toBe(true);
      }),
      { numRuns: 100 }
    );
  });
});
