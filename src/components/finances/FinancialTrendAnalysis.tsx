import { useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { TrendingUp, AlertCircle } from 'lucide-react';
import { FinancialPeriod } from '@/types';

interface TrendDataPoint {
  period: string;
  income: number;
  expense: number;
  profit: number;
  incomeGrowth: number;
  expenseGrowth: number;
  profitGrowth: number;
  forecastedIncome?: number;
  forecastedExpense?: number;
  forecastedProfit?: number;
  isAnomaly?: boolean;
  anomalyType?: 'income' | 'expense' | 'profit';
}

function calculateMonthOverMonthGrowth(current: number, previous: number): number {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }
  return ((current - previous) / Math.abs(previous)) * 100;
}

function calculateYearOverYearGrowth(
  currentMonthData: FinancialPeriod[],
  previousYearData: FinancialPeriod[]
): Record<string, number> {
  const growth: Record<string, number> = {};

  for (let i = 0; i < Math.min(currentMonthData.length, previousYearData.length); i++) {
    const current = currentMonthData[i];
    const previous = previousYearData[i];

    if (previous) {
      growth[`income_${i}`] = calculateMonthOverMonthGrowth(current.income, previous.income);
      growth[`expense_${i}`] = calculateMonthOverMonthGrowth(current.expense, previous.expense);
      growth[`profit_${i}`] = calculateMonthOverMonthGrowth(current.profit, previous.profit);
    }
  }

  return growth;
}

function calculateSimpleMovingAverage(values: number[], windowSize: number = 3): number[] {
  const averages: number[] = [];

  for (let i = 0; i < values.length; i++) {
    const start = Math.max(0, i - Math.floor(windowSize / 2));
    const end = Math.min(values.length, i + Math.floor(windowSize / 2) + 1);
    const window = values.slice(start, end);
    const avg = window.reduce((a, b) => a + b, 0) / window.length;
    averages.push(avg);
  }

  return averages;
}

function forecastLinearTrend(values: number[], forecastPeriods: number = 3): number[] {
  if (values.length < 2) {
    return Array(forecastPeriods).fill(values[values.length - 1] || 0);
  }

  const n = values.length;
  const xValues = Array.from({ length: n }, (_, i) => i);
  const xMean = xValues.reduce((a, b) => a + b, 0) / n;
  const yMean = values.reduce((a, b) => a + b, 0) / n;

  let numerator = 0;
  let denominator = 0;

  for (let i = 0; i < n; i++) {
    numerator += (xValues[i] - xMean) * (values[i] - yMean);
    denominator += (xValues[i] - xMean) ** 2;
  }

  const slope = denominator === 0 ? 0 : numerator / denominator;
  const intercept = yMean - slope * xMean;

  const forecasts: number[] = [];
  for (let i = 0; i < forecastPeriods; i++) {
    const x = n + i;
    const forecast = Math.max(0, slope * x + intercept);
    forecasts.push(forecast);
  }

  return forecasts;
}

function detectAnomalies(
  values: number[],
  threshold: number = 2
): Array<{ index: number; type: string }> {
  if (values.length < 3) {
    return [];
  }

  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + (val - mean) ** 2, 0) / values.length;
  const stdDev = Math.sqrt(variance);

  const anomalies: Array<{ index: number; type: string }> = [];

  for (let i = 0; i < values.length; i++) {
    const zScore = Math.abs((values[i] - mean) / (stdDev || 1));
    if (zScore > threshold) {
      anomalies.push({ index: i, type: zScore > 0 ? 'spike' : 'dip' });
    }
  }

  return anomalies;
}

export default function FinancialTrendAnalysis() {
  const { aggregatedFinancialData } = useApp();

  const trendData = useMemo(() => {
    if (!aggregatedFinancialData || aggregatedFinancialData.length === 0) {
      return [];
    }

    const sortedData = [...aggregatedFinancialData].sort(
      (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );

    const incomeValues = sortedData.map(p => p.income);
    const expenseValues = sortedData.map(p => p.expense);
    const profitValues = sortedData.map(p => p.profit);

    const incomeAnomalies = detectAnomalies(incomeValues);
    const expenseAnomalies = detectAnomalies(expenseValues);
    const profitAnomalies = detectAnomalies(profitValues);

    const incomeForecasts = forecastLinearTrend(incomeValues, 3);
    const expenseForecasts = forecastLinearTrend(expenseValues, 3);
    const profitForecasts = forecastLinearTrend(profitValues, 3);

    const trendPoints: TrendDataPoint[] = sortedData.map((period, index) => {
      const prevPeriod = index > 0 ? sortedData[index - 1] : null;

      const incomeGrowth = prevPeriod
        ? calculateMonthOverMonthGrowth(period.income, prevPeriod.income)
        : 0;
      const expenseGrowth = prevPeriod
        ? calculateMonthOverMonthGrowth(period.expense, prevPeriod.expense)
        : 0;
      const profitGrowth = prevPeriod
        ? calculateMonthOverMonthGrowth(period.profit, prevPeriod.profit)
        : 0;

      const isIncomeAnomaly = incomeAnomalies.some(a => a.index === index);
      const isExpenseAnomaly = expenseAnomalies.some(a => a.index === index);
      const isProfitAnomaly = profitAnomalies.some(a => a.index === index);

      let anomalyType: 'income' | 'expense' | 'profit' | undefined;
      if (isIncomeAnomaly) anomalyType = 'income';
      else if (isExpenseAnomaly) anomalyType = 'expense';
      else if (isProfitAnomaly) anomalyType = 'profit';

      return {
        period: new Date(period.startDate).toLocaleString('default', {
          month: 'short',
          year: '2-digit',
        }),
        income: period.income,
        expense: period.expense,
        profit: period.profit,
        incomeGrowth: incomeGrowth || 0,
        expenseGrowth: expenseGrowth || 0,
        profitGrowth: profitGrowth || 0,
        isAnomaly: isIncomeAnomaly || isExpenseAnomaly || isProfitAnomaly,
        anomalyType,
      };
    });

    for (let i = 0; i < incomeForecasts.length; i++) {
      const forecastPeriod = new Date(sortedData[sortedData.length - 1].endDate);
      forecastPeriod.setMonth(forecastPeriod.getMonth() + i + 1);

      trendPoints.push({
        period: forecastPeriod.toLocaleString('default', { month: 'short', year: '2-digit' }),
        income: 0,
        expense: 0,
        profit: 0,
        incomeGrowth: 0,
        expenseGrowth: 0,
        profitGrowth: 0,
        forecastedIncome: incomeForecasts[i],
        forecastedExpense: expenseForecasts[i],
        forecastedProfit: profitForecasts[i],
      });
    }

    return trendPoints;
  }, [aggregatedFinancialData]);

  const stats = useMemo(() => {
    if (trendData.length === 0) {
      return { avgIncome: 0, avgExpense: 0, avgProfit: 0, anomalyCount: 0 };
    }

    const historicalData = trendData.filter(d => !d.forecastedIncome);
    const avgIncome = historicalData.reduce((sum, d) => sum + d.income, 0) / historicalData.length;
    const avgExpense = historicalData.reduce((sum, d) => sum + d.expense, 0) / historicalData.length;
    const avgProfit = historicalData.reduce((sum, d) => sum + d.profit, 0) / historicalData.length;
    const anomalyCount = historicalData.filter(d => d.isAnomaly).length;

    return { avgIncome, avgExpense, avgProfit, anomalyCount };
  }, [trendData]);

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}k`;
    }
    return `$${value.toFixed(0)}`;
  };

  const formatGrowth = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Financial Trends & Forecasting</h2>
        <p className="text-muted-foreground mt-1">
          Historical data with 3-month forecast and anomaly detection
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Monthly Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.avgIncome)}</div>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Monthly Expense</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.avgExpense)}</div>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Monthly Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.avgProfit >= 0 ? 'text-success' : 'text-destructive'}`}>
              {formatCurrency(stats.avgProfit)}
            </div>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Anomalies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.anomalyCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Trend Chart */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Income, Expense & Profit Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={trendData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis
                dataKey="period"
                stroke="rgba(255,255,255,0.5)"
                style={{ fontSize: '12px' }}
              />
              <YAxis stroke="rgba(255,255,255,0.5)" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0,0,0,0.8)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                }}
                formatter={(value: any) => formatCurrency(value)}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="income"
                stroke="#10b981"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="expense"
                stroke="#ef4444"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="profit"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="forecastedIncome"
                stroke="#10b981"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="forecastedExpense"
                stroke="#ef4444"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="forecastedProfit"
                stroke="#3b82f6"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                isAnimationActive={false}
              />
              <ReferenceLine y={0} stroke="rgba(255,255,255,0.2)" />
            </LineChart>
          </ResponsiveContainer>
          <p className="text-xs text-muted-foreground mt-4">
            Solid lines represent historical data. Dashed lines represent 3-month forecast based on linear trend analysis.
          </p>
        </CardContent>
      </Card>

      {/* Growth Rates Table */}
      <Card className="glass">
        <CardHeader>
          <CardTitle>Month-over-Month Growth Rates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-2 px-2">Period</th>
                  <th className="text-right py-2 px-2">Income Growth</th>
                  <th className="text-right py-2 px-2">Expense Growth</th>
                  <th className="text-right py-2 px-2">Profit Growth</th>
                </tr>
              </thead>
              <tbody>
                {trendData
                  .filter(d => !d.forecastedIncome)
                  .slice(-6)
                  .map((row, idx) => (
                    <tr key={idx} className="border-b border-white/5 hover:bg-white/5">
                      <td className="py-2 px-2">{row.period}</td>
                      <td className="text-right py-2 px-2">
                        <span className={row.incomeGrowth >= 0 ? 'text-success' : 'text-destructive'}>
                          {formatGrowth(row.incomeGrowth)}
                        </span>
                      </td>
                      <td className="text-right py-2 px-2">
                        <span className={row.expenseGrowth >= 0 ? 'text-destructive' : 'text-success'}>
                          {formatGrowth(row.expenseGrowth)}
                        </span>
                      </td>
                      <td className="text-right py-2 px-2">
                        <span className={row.profitGrowth >= 0 ? 'text-success' : 'text-destructive'}>
                          {formatGrowth(row.profitGrowth)}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Anomalies */}
      {stats.anomalyCount > 0 && (
        <Card className="glass border-warning/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-warning">
              <AlertCircle className="h-5 w-5" />
              Detected Anomalies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {trendData
                .filter(d => d.isAnomaly && !d.forecastedIncome)
                .map((row, idx) => (
                  <div key={idx} className="text-sm p-2 bg-warning/10 rounded border border-warning/20">
                    <span className="font-medium">{row.period}</span>
                    {' - '}
                    <span className="capitalize">{row.anomalyType} anomaly detected</span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
