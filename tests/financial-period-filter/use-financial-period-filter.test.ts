import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFinancialPeriodFilter } from '@/hooks/use-financial-period-filter';
import { FinancialRecord } from '@/types';

describe('useFinancialPeriodFilter', () => {
  const mockRecords: FinancialRecord[] = [
    {
      id: '1',
      date: '2024-01-15',
      type: 'income',
      category: 'Sales',
      amount: 5000,
      projectId: 'proj-1',
      description: 'Q1 Income',
      userId: 'user-1',
    },
    {
      id: '2',
      date: '2024-02-10',
      type: 'expense',
      category: 'Operations',
      amount: 2000,
      projectId: 'proj-1',
      description: 'Q1 Expense',
      userId: 'user-1',
    },
    {
      id: '3',
      date: '2024-04-20',
      type: 'income',
      category: 'Sales',
      amount: 6000,
      projectId: 'proj-1',
      description: 'Q2 Income',
      userId: 'user-1',
    },
    {
      id: '4',
      date: '2024-05-15',
      type: 'expense',
      category: 'Operations',
      amount: 2500,
      projectId: 'proj-1',
      description: 'Q2 Expense',
      userId: 'user-1',
    },
    {
      id: '5',
      date: '2024-07-10',
      type: 'income',
      category: 'Sales',
      amount: 7000,
      projectId: 'proj-1',
      description: 'Q3 Income',
      userId: 'user-1',
    },
    {
      id: '6',
      date: '2024-10-05',
      type: 'income',
      category: 'Sales',
      amount: 8000,
      projectId: 'proj-1',
      description: 'Q4 Income',
      userId: 'user-1',
    },
    {
      id: '7',
      date: '2023-06-15',
      type: 'income',
      category: 'Sales',
      amount: 4000,
      projectId: 'proj-1',
      description: '2023 Income',
      userId: 'user-1',
    },
  ];

  describe('Monthly view', () => {
    it('should return all records for the selected year in monthly view', () => {
      const { result } = renderHook(() => useFinancialPeriodFilter(mockRecords));

      expect(result.current.periodData.length).toBeGreaterThan(0);
      expect(result.current.filter.periodType).toBe('monthly');
    });

    it('should calculate correct totals for monthly view', () => {
      const { result } = renderHook(() => useFinancialPeriodFilter(mockRecords));

      const expectedIncome = 5000 + 6000 + 7000 + 8000;
      const expectedExpenses = 2000 + 2500;

      expect(result.current.totals.income).toBe(expectedIncome);
      expect(result.current.totals.expenses).toBe(expectedExpenses);
      expect(result.current.totals.profit).toBe(expectedIncome - expectedExpenses);
    });
  });

  describe('Quarterly view', () => {
    it('should filter records by quarter', () => {
      const { result } = renderHook(() => useFinancialPeriodFilter(mockRecords));

      act(() => {
        result.current.setFilter({
          periodType: 'quarterly',
          selectedYear: 2024,
          selectedQuarter: 1,
        });
      });

      expect(result.current.filter.periodType).toBe('quarterly');
      expect(result.current.filter.selectedQuarter).toBe(1);
      expect(result.current.totals.income).toBe(5000);
      expect(result.current.totals.expenses).toBe(2000);
    });

    it('should calculate Q2 totals correctly', () => {
      const { result } = renderHook(() => useFinancialPeriodFilter(mockRecords));

      act(() => {
        result.current.setFilter({
          periodType: 'quarterly',
          selectedYear: 2024,
          selectedQuarter: 2,
        });
      });

      expect(result.current.totals.income).toBe(6000);
      expect(result.current.totals.expenses).toBe(2500);
      expect(result.current.totals.profit).toBe(3500);
    });

    it('should calculate Q3 totals correctly', () => {
      const { result } = renderHook(() => useFinancialPeriodFilter(mockRecords));

      act(() => {
        result.current.setFilter({
          periodType: 'quarterly',
          selectedYear: 2024,
          selectedQuarter: 3,
        });
      });

      expect(result.current.totals.income).toBe(7000);
      expect(result.current.totals.expenses).toBe(0);
      expect(result.current.totals.profit).toBe(7000);
    });

    it('should calculate Q4 totals correctly', () => {
      const { result } = renderHook(() => useFinancialPeriodFilter(mockRecords));

      act(() => {
        result.current.setFilter({
          periodType: 'quarterly',
          selectedYear: 2024,
          selectedQuarter: 4,
        });
      });

      expect(result.current.totals.income).toBe(8000);
      expect(result.current.totals.expenses).toBe(0);
      expect(result.current.totals.profit).toBe(8000);
    });
  });

  describe('Annual view', () => {
    it('should filter records by year', () => {
      const { result } = renderHook(() => useFinancialPeriodFilter(mockRecords));

      act(() => {
        result.current.setFilter({
          periodType: 'annual',
          selectedYear: 2024,
        });
      });

      expect(result.current.filter.periodType).toBe('annual');
      expect(result.current.filter.selectedYear).toBe(2024);
    });

    it('should calculate 2024 annual totals correctly', () => {
      const { result } = renderHook(() => useFinancialPeriodFilter(mockRecords));

      act(() => {
        result.current.setFilter({
          periodType: 'annual',
          selectedYear: 2024,
        });
      });

      const expectedIncome = 5000 + 6000 + 7000 + 8000;
      const expectedExpenses = 2000 + 2500;

      expect(result.current.totals.income).toBe(expectedIncome);
      expect(result.current.totals.expenses).toBe(expectedExpenses);
      expect(result.current.totals.profit).toBe(expectedIncome - expectedExpenses);
    });

    it('should calculate 2023 annual totals correctly', () => {
      const { result } = renderHook(() => useFinancialPeriodFilter(mockRecords));

      act(() => {
        result.current.setFilter({
          periodType: 'annual',
          selectedYear: 2023,
        });
      });

      expect(result.current.totals.income).toBe(4000);
      expect(result.current.totals.expenses).toBe(0);
      expect(result.current.totals.profit).toBe(4000);
    });
  });

  describe('Available years', () => {
    it('should return all available years from records', () => {
      const { result } = renderHook(() => useFinancialPeriodFilter(mockRecords));

      expect(result.current.availableYears).toContain(2024);
      expect(result.current.availableYears).toContain(2023);
      expect(result.current.availableYears.length).toBe(2);
    });

    it('should sort years in descending order', () => {
      const { result } = renderHook(() => useFinancialPeriodFilter(mockRecords));

      expect(result.current.availableYears[0]).toBe(2024);
      expect(result.current.availableYears[1]).toBe(2023);
    });
  });

  describe('Year switching', () => {
    it('should update totals when switching years', () => {
      const { result } = renderHook(() => useFinancialPeriodFilter(mockRecords));

      act(() => {
        result.current.setFilter({
          periodType: 'annual',
          selectedYear: 2024,
        });
      });

      const totals2024 = { ...result.current.totals };

      act(() => {
        result.current.setFilter({
          periodType: 'annual',
          selectedYear: 2023,
        });
      });

      expect(result.current.totals.income).not.toBe(totals2024.income);
      expect(result.current.totals.income).toBe(4000);
    });
  });

  describe('Empty records', () => {
    it('should handle empty records array', () => {
      const { result } = renderHook(() => useFinancialPeriodFilter([]));

      expect(result.current.periodData).toEqual([]);
      expect(result.current.totals.income).toBe(0);
      expect(result.current.totals.expenses).toBe(0);
      expect(result.current.totals.profit).toBe(0);
    });

    it('should return empty available years for empty records', () => {
      const { result } = renderHook(() => useFinancialPeriodFilter([]));

      expect(result.current.availableYears).toEqual([]);
    });
  });

  describe('Profit calculation', () => {
    it('should calculate profit correctly for each period', () => {
      const { result } = renderHook(() => useFinancialPeriodFilter(mockRecords));

      act(() => {
        result.current.setFilter({
          periodType: 'quarterly',
          selectedYear: 2024,
          selectedQuarter: 1,
        });
      });

      expect(result.current.totals.profit).toBe(result.current.totals.income - result.current.totals.expenses);
    });

    it('should handle negative profit', () => {
      const recordsWithLoss: FinancialRecord[] = [
        {
          id: '1',
          date: '2024-01-15',
          type: 'income',
          category: 'Sales',
          amount: 1000,
          projectId: 'proj-1',
          description: 'Income',
          userId: 'user-1',
        },
        {
          id: '2',
          date: '2024-01-20',
          type: 'expense',
          category: 'Operations',
          amount: 5000,
          projectId: 'proj-1',
          description: 'Expense',
          userId: 'user-1',
        },
      ];

      const { result } = renderHook(() => useFinancialPeriodFilter(recordsWithLoss));

      expect(result.current.totals.profit).toBe(-4000);
    });
  });
});
