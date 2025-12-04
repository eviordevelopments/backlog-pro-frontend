import { useState, useMemo } from 'react';
import { FinancialRecord } from '@/types';

export type PeriodType = 'monthly' | 'quarterly' | 'annual';

interface PeriodFilterState {
  periodType: PeriodType;
  selectedYear?: number;
  selectedQuarter?: number;
}

export const useFinancialPeriodFilter = (records: FinancialRecord[]) => {
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    records.forEach(record => {
      const year = new Date(record.date).getFullYear();
      years.add(year);
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [records]);

  const defaultYear = availableYears.length > 0 ? availableYears[0] : new Date().getFullYear();

  const [filter, setFilter] = useState<PeriodFilterState>({
    periodType: 'monthly',
    selectedYear: defaultYear,
  });

  const filteredRecords = useMemo(() => {
    return records.filter(record => {
      const recordDate = new Date(record.date);
      const recordYear = recordDate.getFullYear();

      if (recordYear !== filter.selectedYear) {
        return false;
      }

      if (filter.periodType === 'quarterly' && filter.selectedQuarter !== undefined) {
        const month = recordDate.getMonth();
        const quarter = Math.floor(month / 3) + 1;
        return quarter === filter.selectedQuarter;
      }

      return true;
    });
  }, [records, filter]);

  const periodData = useMemo(() => {
    const data: Record<string, { income: number; expenses: number; profit: number }> = {};

    filteredRecords.forEach(record => {
      let key: string;

      if (filter.periodType === 'monthly') {
        const date = new Date(record.date);
        key = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      } else if (filter.periodType === 'quarterly') {
        const date = new Date(record.date);
        const quarter = Math.floor(date.getMonth() / 3) + 1;
        key = `Q${quarter} ${date.getFullYear()}`;
      } else {
        key = `${filter.selectedYear}`;
      }

      if (!data[key]) {
        data[key] = { income: 0, expenses: 0, profit: 0 };
      }

      if (record.type === 'income') {
        data[key].income += record.amount;
      } else {
        data[key].expenses += record.amount;
      }

      data[key].profit = data[key].income - data[key].expenses;
    });

    return Object.entries(data).map(([period, values]) => ({
      period,
      ...values,
    }));
  }, [filteredRecords, filter]);

  const totals = useMemo(() => {
    return periodData.reduce(
      (acc, item) => ({
        income: acc.income + item.income,
        expenses: acc.expenses + item.expenses,
        profit: acc.profit + item.profit,
      }),
      { income: 0, expenses: 0, profit: 0 }
    );
  }, [periodData]);

  return {
    filter,
    setFilter,
    periodData,
    totals,
    availableYears,
  };
};
