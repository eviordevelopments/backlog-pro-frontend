import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

type CostType = 'all' | 'fixed' | 'variable';

interface ProjectExpense {
  project: string;
  fixed: number;
  variable: number;
  total: number;
}

interface CostBreakdown {
  category: string;
  fixed: number;
  variable: number;
}

export default function ExpenseBreakdown() {
  const [costType, setCostType] = useState<CostType>('all');

  // Sample data for expenses by project
  const projectExpenses: ProjectExpense[] = [
    { project: 'Project A', fixed: 15000, variable: 8000, total: 23000 },
    { project: 'Project B', fixed: 12000, variable: 6000, total: 18000 },
    { project: 'Project C', fixed: 10000, variable: 5000, total: 15000 },
    { project: 'Project D', fixed: 8000, variable: 4000, total: 12000 },
  ];

  // Sample data for cost breakdown by category
  const costBreakdown: CostBreakdown[] = [
    { category: 'Salaries', fixed: 35000, variable: 5000 },
    { category: 'Infrastructure', fixed: 8000, variable: 2000 },
    { category: 'Marketing', fixed: 5000, variable: 8000 },
    { category: 'Tools & Software', fixed: 3000, variable: 1000 },
    { category: 'Operations', fixed: 2000, variable: 3000 },
  ];

  const totalFixed = projectExpenses.reduce((sum, p) => sum + p.fixed, 0);
  const totalVariable = projectExpenses.reduce((sum, p) => sum + p.variable, 0);
  const totalExpense = totalFixed + totalVariable;

  const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Expense Breakdown</h2>
        <p className="text-muted-foreground mt-1">Fixed vs Variable costs analysis</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Fixed Costs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">${(totalFixed / 1000).toFixed(1)}k</div>
            <p className="text-xs text-muted-foreground mt-1">
              {((totalFixed / totalExpense) * 100).toFixed(0)}% of total
            </p>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Variable Costs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">${(totalVariable / 1000).toFixed(1)}k</div>
            <p className="text-xs text-muted-foreground mt-1">
              {((totalVariable / totalExpense) * 100).toFixed(0)}% of total
            </p>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(totalExpense / 1000).toFixed(1)}k</div>
            <p className="text-xs text-muted-foreground mt-1">Monthly total</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2">
        <Button
          variant={costType === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setCostType('all')}
        >
          All Costs
        </Button>
        <Button
          variant={costType === 'fixed' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setCostType('fixed')}
        >
          Fixed Only
        </Button>
        <Button
          variant={costType === 'variable' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setCostType('variable')}
        >
          Variable Only
        </Button>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expenses by Project */}
        <Card className="glass">
          <CardHeader>
            <CardTitle>Expenses by Project</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={projectExpenses}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="project" />
                <YAxis />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    border: 'none',
                    borderRadius: '8px',
                  }}
                  formatter={(value) => `$${(value / 1000).toFixed(1)}k`}
                />
                <Legend />
                {(costType === 'all' || costType === 'fixed') && (
                  <Bar dataKey="fixed" fill="#3b82f6" name="Fixed" radius={[8, 8, 0, 0]} />
                )}
                {(costType === 'all' || costType === 'variable') && (
                  <Bar dataKey="variable" fill="#ef4444" name="Variable" radius={[8, 8, 0, 0]} />
                )}
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Cost Breakdown by Category */}
        <Card className="glass">
          <CardHeader>
            <CardTitle>Cost Breakdown by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={costBreakdown}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    border: 'none',
                    borderRadius: '8px',
                  }}
                  formatter={(value) => `$${(value / 1000).toFixed(1)}k`}
                />
                <Legend />
                {(costType === 'all' || costType === 'fixed') && (
                  <Bar dataKey="fixed" fill="#3b82f6" name="Fixed" radius={[8, 8, 0, 0]} />
                )}
                {(costType === 'all' || costType === 'variable') && (
                  <Bar dataKey="variable" fill="#ef4444" name="Variable" radius={[8, 8, 0, 0]} />
                )}
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Fixed vs Variable Pie Chart */}
        <Card className="glass">
          <CardHeader>
            <CardTitle>Fixed vs Variable Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Fixed', value: totalFixed },
                    { name: 'Variable', value: totalVariable },
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: $${(value / 1000).toFixed(1)}k`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  <Cell fill="#3b82f6" />
                  <Cell fill="#ef4444" />
                </Pie>
                <Tooltip formatter={(value) => `$${(value / 1000).toFixed(1)}k`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Detailed Breakdown Table */}
        <Card className="glass">
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {projectExpenses.map((project, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-sm">{project.project}</p>
                    <p className="font-bold text-sm">${(project.total / 1000).toFixed(1)}k</p>
                  </div>
                  <div className="flex gap-4 text-xs">
                    <div className="flex-1">
                      <p className="text-muted-foreground">Fixed</p>
                      <p className="font-semibold text-blue-500">${(project.fixed / 1000).toFixed(1)}k</p>
                    </div>
                    <div className="flex-1">
                      <p className="text-muted-foreground">Variable</p>
                      <p className="font-semibold text-red-500">${(project.variable / 1000).toFixed(1)}k</p>
                    </div>
                    <div className="flex-1">
                      <p className="text-muted-foreground">Ratio</p>
                      <p className="font-semibold">
                        {((project.fixed / project.total) * 100).toFixed(0)}% / {((project.variable / project.total) * 100).toFixed(0)}%
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
