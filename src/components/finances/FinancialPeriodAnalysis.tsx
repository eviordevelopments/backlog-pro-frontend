import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { useFinancialPeriodFilter, PeriodType } from '@/hooks/use-financial-period-filter';

export default function FinancialPeriodAnalysis() {
  const { financialRecords } = useApp();
  const { filter, setFilter, periodData, totals, availableYears } = useFinancialPeriodFilter(financialRecords);

  const handlePeriodChange = (periodType: PeriodType) => {
    setFilter(prev => ({
      ...prev,
      periodType,
      selectedQuarter: undefined,
    }));
  };

  const handleYearChange = (year: number) => {
    setFilter(prev => ({
      ...prev,
      selectedYear: year,
    }));
  };

  const handleQuarterChange = (quarter: number) => {
    setFilter(prev => ({
      ...prev,
      selectedQuarter: quarter,
    }));
  };

  const formatCurrency = (value: number) => `$${(Number(value) / 1000).toFixed(1)}k`;
  const profitMargin = totals.income > 0 ? ((totals.profit / totals.income) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Financial Period Analysis</h2>
        <p className="text-muted-foreground mt-1">View income, expenses, and profit by period</p>
      </div>

      {/* Period Type Filter */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={filter.periodType === 'monthly' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handlePeriodChange('monthly')}
        >
          Monthly
        </Button>
        <Button
          variant={filter.periodType === 'quarterly' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handlePeriodChange('quarterly')}
        >
          Quarterly (3 Months)
        </Button>
        <Button
          variant={filter.periodType === 'annual' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handlePeriodChange('annual')}
        >
          Annual (Yearly)
        </Button>
      </div>

      {/* Year Filter */}
      <div className="flex flex-wrap gap-2">
        <span className="text-sm font-medium self-center">Year:</span>
        {availableYears.map(year => (
          <Button
            key={year}
            variant={filter.selectedYear === year ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleYearChange(year)}
          >
            {year}
          </Button>
        ))}
      </div>

      {/* Quarter Filter (only show when quarterly is selected) */}
      {filter.periodType === 'quarterly' && (
        <div className="flex flex-wrap gap-2">
          <span className="text-sm font-medium self-center">Quarter:</span>
          {[1, 2, 3, 4].map(quarter => (
            <Button
              key={quarter}
              variant={filter.selectedQuarter === quarter ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleQuarterChange(quarter)}
            >
              Q{quarter}
            </Button>
          ))}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              ${(totals.income / 1000).toFixed(1)}k
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {periodData.length} period(s)
            </p>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <DollarSign className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              ${(totals.expenses / 1000).toFixed(1)}k
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {totals.income > 0 ? ((totals.expenses / totals.income) * 100).toFixed(0) : '0'}% of income
            </p>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
            <TrendingDown className={`h-4 w-4 ${totals.profit >= 0 ? 'text-success' : 'text-destructive'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totals.profit >= 0 ? 'text-success' : 'text-destructive'}`}>
              ${(totals.profit / 1000).toFixed(1)}k
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {profitMargin}% margin
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income vs Expenses Bar Chart */}
        <Card className="glass">
          <CardHeader>
            <CardTitle>Income vs Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={periodData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    border: 'none',
                    borderRadius: '8px',
                  }}
                  formatter={formatCurrency}
                />
                <Legend />
                <Bar dataKey="income" fill="#10b981" name="Income" radius={[8, 8, 0, 0]} />
                <Bar dataKey="expenses" fill="#ef4444" name="Expenses" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Profit Trend Line Chart */}
        <Card className="glass">
          <CardHeader>
            <CardTitle>Profit Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={periodData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    border: 'none',
                    borderRadius: '8px',
                  }}
                  formatter={formatCurrency}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="profit"
                  stroke="#8b5cf6"
                  name="Profit"
                  strokeWidth={2}
                  dot={{ fill: '#8b5cf6', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Detailed Period Table */}
        <Card className="glass lg:col-span-2">
          <CardHeader>
            <CardTitle>Period Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {periodData.length > 0 ? (
                periodData.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center justify-between mb-3">
                      <p className="font-semibold text-sm">{item.period}</p>
                      <p className={`font-bold text-sm ${item.profit >= 0 ? 'text-success' : 'text-destructive'}`}>
                        ${(item.profit / 1000).toFixed(1)}k
                      </p>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-xs">
                      <div>
                        <p className="text-muted-foreground">Income</p>
                        <p className="font-semibold text-success">${(item.income / 1000).toFixed(1)}k</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Expenses</p>
                        <p className="font-semibold text-red-500">${(item.expenses / 1000).toFixed(1)}k</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Margin</p>
                        <p className={`font-semibold ${item.income > 0 && item.profit >= 0 ? 'text-success' : 'text-destructive'}`}>
                          {item.income > 0 ? ((item.profit / item.income) * 100).toFixed(1) : '0'}%
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-muted-foreground">
                  No financial data available for the selected period
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
