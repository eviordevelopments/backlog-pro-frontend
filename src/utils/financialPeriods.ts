import { FinancialRecord, FinancialPeriod } from '@/types';

export type PeriodType = 'monthly' | 'quarterly' | 'annual';

export interface PeriodRange {
  startDate: Date;
  endDate: Date;
  label: string;
}

export function getPeriodRanges(type: PeriodType, monthsBack: number = 12): PeriodRange[] {
  const ranges: PeriodRange[] = [];
  const now = new Date();

  if (type === 'monthly') {
    for (let i = monthsBack - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextDate = new Date(date.getFullYear(), date.getMonth() + 1, 1);
      const label = date.toLocaleString('default', { month: 'short', year: '2-digit' });
      ranges.push({
        startDate: date,
        endDate: new Date(nextDate.getTime() - 1),
        label,
      });
    }
  } else if (type === 'quarterly') {
    const quarters = Math.ceil(monthsBack / 3);
    for (let i = quarters - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i * 3, 1);
      const quarterNum = Math.floor(date.getMonth() / 3) + 1;
      const nextDate = new Date(date.getFullYear(), date.getMonth() + 3, 1);
      const label = `Q${quarterNum} ${date.getFullYear()}`;
      ranges.push({
        startDate: date,
        endDate: new Date(nextDate.getTime() - 1),
        label,
      });
    }
  } else {
    const years = Math.ceil(monthsBack / 12);
    for (let i = years - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear() - i, 0, 1);
      const nextDate = new Date(date.getFullYear() + 1, 0, 1);
      const label = date.getFullYear().toString();
      ranges.push({
        startDate: date,
        endDate: new Date(nextDate.getTime() - 1),
        label,
      });
    }
  }

  return ranges;
}

export function aggregateFinancialData(
  records: FinancialRecord[],
  periodType: PeriodType,
  monthsBack: number = 12
): FinancialPeriod[] {
  const ranges = getPeriodRanges(periodType, monthsBack);
  const periods: FinancialPeriod[] = [];

  for (const range of ranges) {
    const periodRecords = records.filter(record => {
      const recordDate = new Date(record.date);
      // Use strict comparison to avoid floating point issues
      return recordDate.getTime() >= range.startDate.getTime() && 
             recordDate.getTime() <= range.endDate.getTime();
    });

    const income = periodRecords
      .filter(r => r.type === 'income')
      .reduce((sum, r) => sum + r.amount, 0);

    const expense = periodRecords
      .filter(r => r.type === 'expense')
      .reduce((sum, r) => sum + r.amount, 0);

    periods.push({
      type: periodType,
      startDate: range.startDate.toISOString(),
      endDate: range.endDate.toISOString(),
      income,
      expense,
      profit: income - expense,
    });
  }

  return periods;
}

export function validatePeriodConsistency(
  records: FinancialRecord[],
  monthlyPeriods: FinancialPeriod[],
  quarterlyPeriods: FinancialPeriod[]
): boolean {
  // Verify that quarterly aggregation equals sum of monthly data
  for (let q = 0; q < quarterlyPeriods.length; q++) {
    const quarterlyIncome = quarterlyPeriods[q].income;
    const quarterlyExpense = quarterlyPeriods[q].expense;

    const monthlyIncome = monthlyPeriods
      .slice(q * 3, q * 3 + 3)
      .reduce((sum, p) => sum + p.income, 0);

    const monthlyExpense = monthlyPeriods
      .slice(q * 3, q * 3 + 3)
      .reduce((sum, p) => sum + p.expense, 0);

    const incomeDiff = Math.abs(quarterlyIncome - monthlyIncome);
    const expenseDiff = Math.abs(quarterlyExpense - monthlyExpense);

    if (incomeDiff > 0.01 || expenseDiff > 0.01) {
      return false;
    }
  }

  return true;
}
