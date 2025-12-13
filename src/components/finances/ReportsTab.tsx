import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFinances } from "@/hooks/use-finances";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface ReportsTabProps {
  projectId: string;
  projectName: string;
  budget?: number;
}

const COLORS = ['#5B63F5', '#14B8A6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export default function ReportsTab({ projectId, projectName, budget = 0 }: ReportsTabProps) {
  const { getProjectMetrics, getFinancialSummary, generateFinancialReport } = useFinances();
  const [metrics, setMetrics] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);
  const [report, setReport] = useState<any>(null);

  useEffect(() => {
    try {
      const projectMetrics = getProjectMetrics(projectId, budget);
      setMetrics(projectMetrics);

      const financialSummary = getFinancialSummary(projectId, budget);
      setSummary(financialSummary);

      const financialReport = generateFinancialReport(projectId, projectName, budget);
      setReport(financialReport);
    } catch (error) {
      console.error("Failed to load reports:", error);
    }
  }, [projectId, projectName, budget]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  if (!metrics || !summary) {
    return (
      <Card className="glass">
        <CardContent className="pt-6">
          <p className="text-muted-foreground">Loading financial reports...</p>
        </CardContent>
      </Card>
    );
  }

  // Prepare data for expense chart
  const expenseData = Object.entries(metrics.expensesByCategory).map(([category, amount]) => ({
    name: category,
    value: amount as number,
  }));

  // Prepare data for income chart
  const incomeData = Object.entries(metrics.incomeByCategory).map(([category, amount]) => ({
    name: category,
    value: amount as number,
  }));

  // Prepare cash flow data
  const cashFlowData = Object.entries(summary.cashFlow).map(([month, data]: any) => ({
    month,
    income: data.income,
    expenses: data.expenses,
    net: data.net,
  }));

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.summary.totalBudget)}</div>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{formatCurrency(summary.summary.totalSpent)}</div>
            <p className="text-xs text-muted-foreground">{formatPercent(summary.summary.budgetUtilization)}</p>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{formatCurrency(summary.summary.totalRevenue)}</div>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.summary.netProfit)}</div>
            <p className="text-xs text-muted-foreground">{formatPercent(summary.summary.profitMargin)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expenses by Category */}
        {expenseData.length > 0 && (
          <Card className="glass">
            <CardHeader>
              <CardTitle>Expenses by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={expenseData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${formatCurrency(value as number)}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {expenseData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Income by Category */}
        {incomeData.length > 0 && (
          <Card className="glass">
            <CardHeader>
              <CardTitle>Income by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={incomeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${formatCurrency(value as number)}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {incomeData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Cash Flow Chart */}
      {cashFlowData.length > 0 && (
        <Card className="glass">
          <CardHeader>
            <CardTitle>Cash Flow</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={cashFlowData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                <Legend />
                <Bar dataKey="income" fill="#10B981" name="Income" />
                <Bar dataKey="expenses" fill="#EF4444" name="Expenses" />
                <Bar dataKey="net" fill="#5B63F5" name="Net" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Detailed Metrics */}
      <Card className="glass">
        <CardHeader>
          <CardTitle>Financial Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Budget Utilization</p>
                <p className="text-2xl font-bold">{formatPercent(metrics.percentageUsed)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Remaining Budget</p>
                <p className="text-2xl font-bold">{formatCurrency(metrics.remaining)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Profit Margin</p>
                <p className="text-2xl font-bold">{formatPercent(metrics.profitMargin)}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Transactions</p>
                <p className="text-2xl font-bold">{metrics.transactionCount}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Invoices</p>
                <p className="text-2xl font-bold">{metrics.invoiceCount}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Report Generated</p>
                <p className="text-sm text-muted-foreground">{new Date(report.generatedAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Salary Information */}
      {report.salaries && report.salaries.length > 0 && (
        <Card className="glass">
          <CardHeader>
            <CardTitle>Team Salaries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {report.salaries.map((salary: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                  <div>
                    <p className="font-medium">{salary.userName}</p>
                    <p className="text-sm text-muted-foreground">Hourly Rate: {formatCurrency(salary.idealHourlyRate)}</p>
                  </div>
                  <p className="font-bold">{formatCurrency(salary.salary)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
