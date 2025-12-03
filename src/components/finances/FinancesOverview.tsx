import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { useProjectContext } from '@/context/ProjectContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { PeriodType } from '@/utils/financialPeriods';

interface FinancialData {
  period: string;
  income: number;
  expense: number;
  profit: number;
}

export default function FinancesOverview() {
  const { selectedProject: currentProject } = useProjectContext();
  const { currentPeriodType, setCurrentPeriodType, aggregatedFinancialData } = useApp();
  const [period, setPeriod] = useState<PeriodType>(currentPeriodType);

  // Convert aggregated financial data to chart format
  const financialData: FinancialData[] = aggregatedFinancialData.map(p => ({
    period: p.startDate.split('T')[0].substring(5),
    income: p.income,
    expense: p.expense,
    profit: p.profit,
  }));

  const handlePeriodChange = (newPeriod: PeriodType) => {
    setPeriod(newPeriod);
    setCurrentPeriodType(newPeriod);
  };

  const totalIncome = financialData.reduce((sum, d) => sum + d.income, 0);
  const totalExpense = financialData.reduce((sum, d) => sum + d.expense, 0);
  const totalProfit = totalIncome - totalExpense;
  const profitMargin = totalIncome > 0 ? ((totalProfit / totalIncome) * 100).toFixed(1) : '0';

  const COLORS = ['#10b981', '#ef4444', '#3b82f6'];

  const formatCurrency = (value: any) => `${(Number(value) / 1000).toFixed(1)}k`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Financial Overview</h2>
          <p className="text-muted-foreground mt-1">
            {currentProject ? `${currentProject.name} - ` : ''}
            {period === 'monthly' ? 'Last 12 Months' : period === 'quarterly' ? 'Last 4 Quarters' : 'Last 3 Years'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={period === 'monthly' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handlePeriodChange('monthly')}
          >
            Monthly
          </Button>
          <Button
            variant={period === 'quarterly' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handlePeriodChange('quarterly')}
          >
            Quarterly
          </Button>
          <Button
            variant={period === 'annual' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handlePeriodChange('annual')}
          >
            Annual
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              ${(totalIncome / 1000).toFixed(1)}k
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {financialData.length} periods
            </p>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Expense</CardTitle>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              ${(totalExpense / 1000).toFixed(1)}k
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalIncome > 0 ? ((totalExpense / totalIncome) * 100).toFixed(0) : '0'}% of income
            </p>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-success' : 'text-destructive'}`}>
              ${(totalProfit / 1000).toFixed(1)}k
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {profitMargin}% margin
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line Chart - Income vs Expense */}
        <Card className="glass">
          <CardHeader>
            <CardTitle>Income vs Expense Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={financialData}>
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
                  dataKey="income"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Income"
                />
                <Line
                  type="monotone"
                  dataKey="expense"
                  stroke="#ef4444"
                  strokeWidth={2}
                  name="Expense"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Bar Chart - Profit */}
        <Card className="glass">
          <CardHeader>
            <CardTitle>Profit by Period</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={financialData}>
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
                <Bar
                  dataKey="profit"
                  fill="#3b82f6"
                  name="Profit"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie Chart - Income Distribution */}
        <Card className="glass">
          <CardHeader>
            <CardTitle>Income Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Income', value: totalIncome },
                    { name: 'Expense', value: totalExpense },
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${(Number(value) / 1000).toFixed(1)}k`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {COLORS.map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
                </Pie>
                <Tooltip formatter={formatCurrency} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Detailed Table */}
        <Card className="glass">
          <CardHeader>
            <CardTitle>Period Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {financialData.map((data, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium text-sm">{data.period}</p>
                  </div>
                  <div className="flex gap-4 text-sm">
                    <div className="text-right">
                      <p className="text-muted-foreground">Income</p>
                      <p className="font-semibold text-success">${(data.income / 1000).toFixed(1)}k</p>
                    </div>
                    <div className="text-right">
                      <p className="text-muted-foreground">Expense</p>
                      <p className="font-semibold text-destructive">${(data.expense / 1000).toFixed(1)}k</p>
                    </div>
                    <div className="text-right">
                      <p className="text-muted-foreground">Profit</p>
                      <p className={`font-semibold ${data.profit >= 0 ? 'text-success' : 'text-destructive'}`}>
                        ${(data.profit / 1000).toFixed(1)}k
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
