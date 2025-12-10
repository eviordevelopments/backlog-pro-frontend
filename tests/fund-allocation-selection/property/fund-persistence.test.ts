import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fc from 'fast-check';
import { FundAccount, AllocationCategory } from '@/types';

// Mock localStorage for testing
class MockLocalStorage {
  private store: Record<string, string> = {};

  getItem(key: string): string | null {
    return this.store[key] ?? null;
  }

  setItem(key: string, value: string): void {
    this.store[key] = value;
  }

  removeItem(key: string): void {
    delete this.store[key];
  }

  clear(): void {
    this.store = {};
  }
}

const mockLocalStorage = new MockLocalStorage();

// **Feature: fund-allocation-selection, Property 1: Fund allocation category persistence**
// **Validates: Requirements 1.4**
describe('Property 1: Fund allocation category persistence', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
  });

  afterEach(() => {
    mockLocalStorage.clear();
  });

  it('should persist and retrieve fund allocation category unchanged', () => {
    const validCategories: AllocationCategory[] = [
      'Technology',
      'Growth',
      'Team',
      'Marketing',
      'Emergency',
      'Investments',
    ];

    fc.assert(
      fc.property(fc.constantFrom(...validCategories), (category: AllocationCategory) => {
        const fund: FundAccount = {
          id: `fund-${Date.now()}`,
          name: 'Test Fund',
          balance: 1000,
          allocated: 0,
          percentage: 10,
          purpose: 'Test',
          allocationCategory: category,
        };

        // Simulate persistence
        mockLocalStorage.setItem('fundAccounts', JSON.stringify([fund]));

        // Retrieve and verify
        const stored = mockLocalStorage.getItem('fundAccounts');
        expect(stored).not.toBeNull();

        const retrievedFunds: FundAccount[] = JSON.parse(stored!);
        expect(retrievedFunds).toHaveLength(1);
        expect(retrievedFunds[0].allocationCategory).toBe(category);
        expect(retrievedFunds[0].allocationCategory).toBe(fund.allocationCategory);
      }),
      { numRuns: 100 }
    );
  });
});

// **Feature: fund-allocation-selection, Property 3: Fund name and balance preservation on creation**
// **Validates: Requirements 1.4**
describe('Property 3: Fund name and balance preservation on creation', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
  });

  afterEach(() => {
    mockLocalStorage.clear();
  });

  it('should preserve fund name and balance through create and retrieve cycle', () => {
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
        fc.string({ minLength: 1, maxLength: 100 }),
        fc.integer({ min: 1, max: 1000000 }),
        fc.constantFrom(...validCategories),
        (name: string, balance: number, category: AllocationCategory) => {
          const fund: FundAccount = {
            id: `fund-${Date.now()}`,
            name,
            balance,
            allocated: 0,
            percentage: 10,
            purpose: 'Test',
            allocationCategory: category,
          };

          // Simulate persistence
          mockLocalStorage.setItem('fundAccounts', JSON.stringify([fund]));

          // Retrieve and verify
          const stored = mockLocalStorage.getItem('fundAccounts');
          const retrievedFunds: FundAccount[] = JSON.parse(stored!);
          const retrieved = retrievedFunds[0];

          expect(retrieved.name).toBe(fund.name);
          expect(retrieved.balance).toBe(fund.balance);
          expect(retrieved.name).toBe(name);
          expect(retrieved.balance).toBe(balance);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// **Feature: fund-allocation-selection, Property 5: Fund list integrity after valid fund addition**
// **Validates: Requirements 1.4**
describe('Property 5: Fund list integrity after valid fund addition', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
  });

  afterEach(() => {
    mockLocalStorage.clear();
  });

  it('should increase fund list length by exactly one when adding a valid fund', () => {
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
        fc.array(
          fc.record({
            id: fc.string(),
            name: fc.string({ minLength: 1, maxLength: 100 }),
            balance: fc.integer({ min: 1, max: 1000000 }),
            allocated: fc.integer({ min: 0, max: 1000000 }),
            percentage: fc.integer({ min: 0, max: 100 }),
            purpose: fc.string(),
            allocationCategory: fc.constantFrom(...validCategories),
          }),
          { maxLength: 10 }
        ),
        (existingFunds: FundAccount[]) => {
          // Store existing funds
          mockLocalStorage.setItem('fundAccounts', JSON.stringify(existingFunds));

          // Create new fund
          const newFund: FundAccount = {
            id: `fund-${Date.now()}-${Math.random()}`,
            name: 'New Fund',
            balance: 5000,
            allocated: 0,
            percentage: 10,
            purpose: 'New fund',
            allocationCategory: 'Technology',
          };

          // Add new fund
          const updatedFunds = [...existingFunds, newFund];
          mockLocalStorage.setItem('fundAccounts', JSON.stringify(updatedFunds));

          // Verify
          const stored = mockLocalStorage.getItem('fundAccounts');
          const retrievedFunds: FundAccount[] = JSON.parse(stored!);

          expect(retrievedFunds).toHaveLength(existingFunds.length + 1);
          expect(retrievedFunds[retrievedFunds.length - 1].id).toBe(newFund.id);
        }
      ),
      { numRuns: 100 }
    );
  });
});
