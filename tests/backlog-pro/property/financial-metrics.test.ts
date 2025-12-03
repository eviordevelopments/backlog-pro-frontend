import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import {
  calculateCAC,
  calculateLTV,
  calculateCashRunway,
  calculateBurnRate,
  calculateChurnRate,
} from '@/api/finances/finances';

describe('Financial Metrics Calculations', () => {
  describe('Property 5: CAC Calculation Validity', () => {
    it('should calculate CAC as marketing spend divided by new customers', () => {
      // **Feature: advanced-finances-system, Property 5: CAC Calculation Validity**
      // **Validates: Requirements 3.2**
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 1000000 }),
          fc.integer({ min: 1, max: 10000 }),
          (marketingSpend, newCustomers) => {
            const cac = calculateCAC(marketingSpend, newCustomers);
            const expected = marketingSpend / newCustomers;
            expect(cac).toBeCloseTo(expected, 2);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return Infinity when no customers acquired', () => {
      // **Feature: advanced-finances-system, Property 5: CAC Calculation Validity**
      // **Validates: Requirements 3.2**
      const cac = calculateCAC(50000, 0);
      expect(cac).toBe(Infinity);
    });

    it('should return Infinity for zero marketing spend with zero customers', () => {
      // **Feature: advanced-finances-system, Property 5: CAC Calculation Validity**
      // **Validates: Requirements 3.2**
      const cac = calculateCAC(0, 0);
      expect(cac).toBe(Infinity);
    });

    it('should return zero CAC when marketing spend is zero', () => {
      // **Feature: advanced-finances-system, Property 5: CAC Calculation Validity**
      // **Validates: Requirements 3.2**
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 10000 }),
          (newCustomers) => {
            const cac = calculateCAC(0, newCustomers);
            expect(cac).toBe(0);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 6: Cash Runway Validity', () => {
    it('should calculate cash runway as cash balance divided by monthly burn rate', () => {
      // **Feature: advanced-finances-system, Property 6: Cash Runway Validity**
      // **Validates: Requirements 3.4**
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 10000000 }),
          fc.integer({ min: 1, max: 1000000 }),
          (cashBalance, monthlyBurnRate) => {
            const runway = calculateCashRunway(cashBalance, monthlyBurnRate);
            const expected = cashBalance / monthlyBurnRate;
            expect(runway).toBeCloseTo(expected, 2);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return Infinity when burn rate is zero or negative', () => {
      // **Feature: advanced-finances-system, Property 6: Cash Runway Validity**
      // **Validates: Requirements 3.4**
      expect(calculateCashRunway(100000, 0)).toBe(Infinity);
      expect(calculateCashRunway(100000, -1000)).toBe(Infinity);
    });

    it('should return zero runway when cash balance is zero', () => {
      // **Feature: advanced-finances-system, Property 6: Cash Runway Validity**
      // **Validates: Requirements 3.4**
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 1000000 }),
          (monthlyBurnRate) => {
            const runway = calculateCashRunway(0, monthlyBurnRate);
            expect(runway).toBe(0);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 4: Profit Calculation Accuracy', () => {
    it('should calculate burn rate as total expenses divided by month count', () => {
      // **Feature: advanced-finances-system, Property 4: Profit Calculation Accuracy**
      // **Validates: Requirements 2.4, 3.5**
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 10000000 }),
          fc.integer({ min: 1, max: 120 }),
          (totalExpenses, monthCount) => {
            const burnRate = calculateBurnRate(totalExpenses, monthCount);
            const expected = totalExpenses / monthCount;
            expect(burnRate).toBeCloseTo(expected, 2);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return zero burn rate when expenses are zero', () => {
      // **Feature: advanced-finances-system, Property 4: Profit Calculation Accuracy**
      // **Validates: Requirements 2.4, 3.5**
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 120 }),
          (monthCount) => {
            const burnRate = calculateBurnRate(0, monthCount);
            expect(burnRate).toBe(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return zero burn rate when month count is zero or negative', () => {
      // **Feature: advanced-finances-system, Property 4: Profit Calculation Accuracy**
      // **Validates: Requirements 2.4, 3.5**
      expect(calculateBurnRate(100000, 0)).toBe(0);
      expect(calculateBurnRate(100000, -1)).toBe(0);
    });
  });

  describe('Property 9: Fund Percentage Validity', () => {
    it('should calculate churn rate as lost customers divided by starting customers times 100', () => {
      // **Feature: advanced-finances-system, Property 9: Fund Percentage Validity**
      // **Validates: Requirements 5.5**
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 10000 }),
          fc.integer({ min: 1, max: 10000 }),
          (lostCustomers, startingCustomers) => {
            // Ensure lost customers doesn't exceed starting customers
            const actualLostCustomers = Math.min(lostCustomers, startingCustomers);
            const churnRate = calculateChurnRate(actualLostCustomers, startingCustomers);
            const expected = (actualLostCustomers / startingCustomers) * 100;
            expect(churnRate).toBeCloseTo(expected, 2);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return zero churn rate when starting customers is zero', () => {
      // **Feature: advanced-finances-system, Property 9: Fund Percentage Validity**
      // **Validates: Requirements 5.5**
      expect(calculateChurnRate(100, 0)).toBe(0);
    });

    it('should return zero churn rate when no customers are lost', () => {
      // **Feature: advanced-finances-system, Property 9: Fund Percentage Validity**
      // **Validates: Requirements 5.5**
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 10000 }),
          (startingCustomers) => {
            const churnRate = calculateChurnRate(0, startingCustomers);
            expect(churnRate).toBe(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return 100 churn rate when all customers are lost', () => {
      // **Feature: advanced-finances-system, Property 9: Fund Percentage Validity**
      // **Validates: Requirements 5.5**
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 10000 }),
          (startingCustomers) => {
            const churnRate = calculateChurnRate(startingCustomers, startingCustomers);
            expect(churnRate).toBeCloseTo(100, 2);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('LTV Calculation', () => {
    it('should calculate LTV as average revenue per customer divided by (1 - retention rate)', () => {
      // **Feature: advanced-finances-system, Property: LTV Calculation**
      // **Validates: Requirements 3.3**
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 100000 }),
          fc.tuple(fc.integer({ min: 1, max: 99 }), fc.integer({ min: 1, max: 100 })),
          (averageRevenue, [numerator, denominator]) => {
            const retentionRate = numerator / denominator;
            if (retentionRate > 0 && retentionRate < 1) {
              const ltv = calculateLTV(averageRevenue, retentionRate);
              const expected = averageRevenue / (1 - retentionRate);
              expect(ltv).toBeCloseTo(expected, 2);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return zero LTV when retention rate is zero or negative', () => {
      // **Feature: advanced-finances-system, Property: LTV Calculation**
      // **Validates: Requirements 3.3**
      expect(calculateLTV(50000, 0)).toBe(0);
      expect(calculateLTV(50000, -0.5)).toBe(0);
    });

    it('should return zero LTV when retention rate is greater than 1', () => {
      // **Feature: advanced-finances-system, Property: LTV Calculation**
      // **Validates: Requirements 3.3**
      expect(calculateLTV(50000, 1.5)).toBe(0);
      expect(calculateLTV(50000, 2)).toBe(0);
    });

    it('should return Infinity when retention rate is exactly 1', () => {
      // **Feature: advanced-finances-system, Property: LTV Calculation**
      // **Validates: Requirements 3.3**
      const ltv = calculateLTV(50000, 1);
      expect(ltv).toBe(Infinity);
    });

    it('should return zero LTV when average revenue is zero', () => {
      // **Feature: advanced-finances-system, Property: LTV Calculation**
      // **Validates: Requirements 3.3**
      fc.assert(
        fc.property(
          fc.tuple(fc.integer({ min: 1, max: 99 }), fc.integer({ min: 1, max: 100 })),
          ([numerator, denominator]) => {
            const retentionRate = numerator / denominator;
            if (retentionRate > 0 && retentionRate < 1) {
              const ltv = calculateLTV(0, retentionRate);
              expect(ltv).toBe(0);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
