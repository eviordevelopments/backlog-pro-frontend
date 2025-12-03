import { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { ProjectFinancial } from '@/types';

type CostTypeFilter = 'all' | 'fixed' | 'variable';

export default function IncomeExpenseAnalysis() {
  const { financialRecords, projects } = useApp();
  const [costTypeFilter, setCostTypeFilter] = useState<CostTypeFilter>('all');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const projectFinancials = useMemo(() => {
    const financialsByProject: Record<string, ProjectFinancial> = {};

    projects.forEach(project => {
      financialsByProject[project.id] = {
        projectId: project.id,
        projectName: project.name,
        income: 0,
        fixedCosts: 0,
        variableCosts: 0,
        profit: 0,
        margin: 0,
      };
    });

    financialRecords.forEach(record => {
      if (!financialsByProject[record.projectId]) {
        financialsByProject[record.projectId] = {
          projectId: record.projectId,
          projectName: `Project ${record.projectId.substring(0, 8)}`,
          income: 0,
          fixedCosts: 0,
          variableCosts: 0,
          profit: 0,
          margin: 0,
        };
      }

      const project = financialsByProject[record.projectId];

      if (record.type === 'income') {
        project.income += record.amount;
      } else if (record.type === 'expense') {
        if (record.costType === 'fixed') {
          project.fixedCosts += record.amount;
        } else if (record.costType === 'variable') {
          project.variableCosts += record.amount;
        }
      }
    });

    Object.values(financialsByProject).forEach(project => {
      const totalCosts = project.fixedCosts + project.variableCosts;
      project.profit = project.income - totalCosts;
      project.margin = project.income > 0 ? (project.profit / project.income) * 100 : 0;
    });

    return Object.values(financialsByProject).sort((a, b) => b.income - a.income);
  }, [financialRecords, projects]);

  const filteredProjectFinancials = useMemo(() => {
    if (!selectedProjectId) {
      return projectFinancials;
    }
    return projectFinancials.filter(p => p.projectId === selectedProjectId);
  }, [projectFinancials, selectedProjectId]);

  const chartData = useMemo(() => {
    return filteredProjectFinancials.map(project => ({
      name: project.projectName,
      income: project.income,
      fixedCosts: project.fixedCosts,
      variableCosts: project.variableCosts,
      profit: project.profit,
    }));
  }, [filteredProjectFinancials]);

  const totals = useMemo(() => {
    return filteredProjectFinancials.reduce(
      (acc, project) => ({
        income: acc.income + project.income,
        fixedCosts: acc.fixedCosts + project.fixedCosts,
        variableCosts: acc.variableCosts + project.variableCosts,
        profit: acc.profit + project.profit,
      }),
      { income: 0, fixedCosts: 0, variableCosts: 0, profit: 0 }
    );
  }, [filteredProjectFinancials]);

  const totalCosts = totals.fixedCosts + totals.variableCosts;
  const profitMargin = totals.income > 0 ? ((totals.profit / totals.income) * 100).toFixed(1) : '0';

  const formatCurrency = (value: any) => `${(Number(value) / 1000).toFixed(1)}k`;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Income & Expense Analysis</h2>
        <p className="text-muted-foreground mt-1">Project-level breakdown with cost segregation</p>
      </div>

      {/* Project Filter */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedProjectId === null ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedProjectId(null)}
        >
          All Projects
        </Button>
        {projects.map(project => (
          <Button
            key={project.id}
            variant={selectedProjectId === project.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedProjectId(project.id)}
          >
            {project.name}
          </Button>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              {filteredProjectFinancials.length} project(s)
            </p>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Fixed Costs</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">
              ${(totals.fixedCosts / 1000).toFixed(1)}k
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalCosts > 0 ? ((totals.fixedCosts / totalCosts) * 100).toFixed(0) : '0'}% of costs
            </p>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Variable Costs</CardTitle>
            <DollarSign className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              ${(totals.variableCosts / 1000).toFixed(1)}k
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalCosts > 0 ? ((totals.variableCosts / totalCosts) * 100).toFixed(0) : '0'}% of costs
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

      {/* Cost Type Filter */}
      <div className="flex gap-2">
        <Button
          variant={costTypeFilter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setCostTypeFilter('all')}
        >
          All Costs
        </Button>
        <Button
          variant={costTypeFilter === 'fixed' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setCostTypeFilter('fixed')}
        >
          Fixed Only
        </Button>
        <Button
          variant={costTypeFilter === 'variable' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setCostTypeFilter('variable')}
        >
          Variable Only
        </Button>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income vs Costs Bar Chart */}
        <Card className="glass">
          <CardHeader>
            <CardTitle>Income vs Costs by Project</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="name" />
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
                {(costTypeFilter === 'all' || costTypeFilter === 'fixed') && (
                  <Bar dataKey="fixedCosts" fill="#3b82f6" name="Fixed Costs" radius={[8, 8, 0, 0]} />
                )}
                {(costTypeFilter === 'all' || costTypeFilter === 'variable') && (
                  <Bar dataKey="variableCosts" fill="#ef4444" name="Variable Costs" radius={[8, 8, 0, 0]} />
                )}
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Profit by Project */}
        <Card className="glass">
          <CardHeader>
            <CardTitle>Profit by Project</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="name" />
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
                  fill="#8b5cf6"
                  name="Profit"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Detailed Project Table */}
        <Card className="glass lg:col-span-2">
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredProjectFinancials.map((project, idx) => (
                <div key={idx} className="p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-semibold text-sm">{project.projectName}</p>
                    <p className={`font-bold text-sm ${project.profit >= 0 ? 'text-success' : 'text-destructive'}`}>
                      ${(project.profit / 1000).toFixed(1)}k
                    </p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
                    <div>
                      <p className="text-muted-foreground">Income</p>
                      <p className="font-semibold text-success">${(project.income / 1000).toFixed(1)}k</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Fixed</p>
                      <p className="font-semibold text-blue-500">${(project.fixedCosts / 1000).toFixed(1)}k</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Variable</p>
                      <p className="font-semibold text-red-500">${(project.variableCosts / 1000).toFixed(1)}k</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total Costs</p>
                      <p className="font-semibold">${((project.fixedCosts + project.variableCosts) / 1000).toFixed(1)}k</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Margin</p>
                      <p className={`font-semibold ${project.margin >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {project.margin.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {filteredProjectFinancials.length === 0 && (
                <div className="p-4 text-center text-muted-foreground">
                  No financial data available for selected projects
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
