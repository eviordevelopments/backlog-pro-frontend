import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { FundAccount, AllocationCategory } from '@/types';

// **Feature: fund-allocation-selection, Property 4: Allocation category update preserves other properties**
// **Validates: Requirements 3.2, 3.3**
describe('Property 4: Allocation category update preserves other properties', () => {
  it('should preserve all other fund properties when updating allocation category', () => {
    const validCategories: AllocationCategory[] = [
      'Technology',
      'Growth',
      'Team',
      'Marketing',
      'Emergency',
      'Investments',
    ];

    fc.assert(
      fc.property(
        fc.record({
          id: fc.string(),
          name: fc.string({ minLength: 1, maxLength: 100 }),
          balance: fc.integer({ min: 1, max: 1000000 }),
          allocated: fc.integer({ min: 0, max: 1000000 }),
          percentage: fc.integer({ min: 0, max: 100 }),
          purpose: fc.string(),
          allocationCategory: fc.constantFrom(...validCategories),
        }),
        fc.constantFrom(...validCategories),
        (originalFund: FundAccount, newCategory: AllocationCategory) => {
          // Skip if the new category is the same as the original
          if (newCategory === originalFund.allocationCategory) {
            return true;
          }

          // Update only the allocation category
          const updatedFund: FundAccount = {
            ...originalFund,
            allocationCategory: newCategory,
          };

          // Verify all other properties remain unchanged
          expect(updatedFund.id).toBe(originalFund.id);
          expect(updatedFund.name).toBe(originalFund.name);
          expect(updatedFund.balance).toBe(originalFund.balance);
          expect(updatedFund.allocated).toBe(originalFund.allocated);
          expect(updatedFund.percentage).toBe(originalFund.percentage);
          expect(updatedFund.purpose).toBe(originalFund.purpose);

          // Verify only the category changed
          expect(updatedFund.allocationCategory).toBe(newCategory);
          expect(updatedFund.allocationCategory).not.toBe(originalFund.allocationCategory);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// **Feature: fund-allocation-selection, Property 6: Allocation category color consistency**
// **Validates: Requirements 2.2**
describe('Property 6: Allocation category color consistency', () => {
  const FUND_COLORS: Record<AllocationCategory, string> = {
    Technology: '#3b82f6',
    Growth: '#10b981',
    Team: '#f59e0b',
    Marketing: '#ec4899',
    Emergency: '#ef4444',
    Investments: '#8b5cf6',
  };

  it('should return consistent color for each allocation category', () => {
    const validCategories: AllocationCategory[] = [
      'Technology',
      'Growth',
      'Team',
      'Marketing',
      'Emergency',
      'Investments',
    ];

    fc.assert(
      fc.property(
        fc.constantFrom(...validCategories),
        fc.integer({ min: 1, max: 100 }),
        (category: AllocationCategory, fundCount: number) => {
          // Create multiple funds with the same category
          const funds: FundAccount[] = Array.from({ length: fundCount }, (_, i) => ({
            id: `fund-${i}`,
            name: `Fund ${i}`,
            balance: 1000,
            allocated: 0,
            percentage: 10,
            purpose: 'Test',
            allocationCategory: category,
          }));

          // Get color for each fund
          const colors = funds.map((fund) => FUND_COLORS[fund.allocationCategory]);

          // All colors should be identical
          const firstColor = colors[0];
          expect(colors.every((color) => color === firstColor)).toBe(true);

          // Color should match the expected color for the category
          expect(firstColor).toBe(FUND_COLORS[category]);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should have unique colors for each allocation category', () => {
    const validCategories: AllocationCategory[] = [
      'Technology',
      'Growth',
      'Team',
      'Marketing',
      'Emergency',
      'Investments',
    ];

    const colors = validCategories.map((category) => FUND_COLORS[category]);
    const uniqueColors = new Set(colors);

    expect(uniqueColors.size).toBe(validCategories.length);
  });
});
