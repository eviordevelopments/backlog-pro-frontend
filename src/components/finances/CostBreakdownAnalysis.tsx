import { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { Download, TrendingDown } from 'lucide-react';

type CostTypeFilter = 'all' | 'fixed' | 'variable';
type CategoryFilter = 'all' | string;

interface CategoryBreakdown {
  category: string;
  amount: number;
  costType: 'fixed' | 'variable';
  percentage: number;
}

export default function CostBreakdownAnalysis() {
  const { financialRecords } = useApp();
  const [costTypeFilter, setCostTypeFilter] = useState<CostTypeFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');

  const categoryBreakdown = useMemo(() => {
    const breakdown: Record<string, CategoryBreakdown> = {};
    let totalExpenses = 0;

    financialRecords.forEach(record => {
      if (record.type === 'expense') {
        totalExpenses += record.amount;
        if (!breakdown[record.category]) {
          breakdown[record.category] = {
            category: record.category,
            amount: 0,
            costType: record.costType || 'variable',
            percentage: 0,
          };
        }
        breakdown[record.category].amount += record.amount;
        breakdown[record.category].costType = record.costType || 'variable';
      }
    });

    Object.values(breakdown).forEach(item => {
      item.percentage = totalExpenses > 0 ? (item.amount / totalExpenses) * 100 : 0;
    });

    return {
      categories: Object.values(breakdown).sort((a, b) => b.amount - a.amount),
      totalExpenses,
    };
  }, [financialRecords]);

  const filteredCategories = useMemo(() => {
    return categoryBreakdown.categories.filter(cat => {
      const matchesCostType = costTypeFilter === 'all' || cat.costType === costTypeFilter;
      const matchesCategory = categoryFilter === 'all' || cat.category === categoryFilter;
      return matchesCostType && matchesCategory;
    });
  }, [categoryBreakdown.categories, costTypeFilter, categoryFilter]);

  const costTypeBreakdown = useMemo(() => {
    const fixed = categoryBreakdown.categories
      .filter(cat => cat.costType === 'fixed')
      .reduce((sum, cat) => sum + cat.amount, 0);
    const variable = categoryBreakdown.categories
      .filter(cat => cat.costType === 'variable')
      .reduce((sum, cat) => sum + cat.amount, 0);

    return [
      {
        name: 'Fixed Costs',
        value: fixed,
        percentage: categoryBreakdown.totalExpenses > 0 ? (fixed / categoryBreakdown.totalExpenses) * 100 : 0,
      },
      {
        name: 'Variable Costs',
        value: variable,
        percentage: categoryBreakdown.totalExpenses > 0 ? (variable / categoryBreakdown.totalExpenses) * 100 : 0,
      },
    ];
  }, [categoryBreakdown]);

  const chartData = useMemo(() => {
    return filteredCategories.map(cat => ({
      name: cat.category,
      amount: cat.amount,
      percentage: cat.percentage,
    }));
  }, [filteredCategories]);

  const uniqueCategories = useMemo(() => {
    return Array.from(new Set(categoryBreakdown.categories.map(cat => cat.category)));
  }, [categoryBreakdown.categories]);

  const handleExport = () => {
    const headers = ['Category', 'Cost Type', 'Amount', 'Percentage of Total'];
    const rows = filteredCategories.map(cat => [
      cat.category,
      cat.costType,
      cat.amount.toFixed(2),
      cat.percentage.toFixed(2) + '%',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
      '',
      ['Total Expenses', '', categoryBreakdown.totalExpenses.toFixed(2), '100%'].join(','),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cost-breakdown-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

  const formatCurrency = (value: any) => `$${(Number(value) / 1000).toFixed(1)}k`;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Cost Breakdown Analysis</h2>
        <p className="text-muted-foreground mt-1">Detailed expense categories and cost type segregation</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              ${(categoryBreakdown.totalExpenses / 1000).toFixed(1)}k
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {categoryBreakdown.categories.length} categories
            </p>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Fixed Costs</CardTitle>
            <div className="h-3 w-3 rounded-full bg-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">
              ${(costTypeBreakdown[0].value / 1000).toFixed(1)}k
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {costTypeBreakdown[0].percentage.toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Variable Costs</CardTitle>
            <div className="h-3 w-3 rounded-full bg-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              ${(costTypeBreakdown[1].value / 1000).toFixed(1)}k
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {costTypeBreakdown[1].percentage.toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="space-y-4">
        <div>
          <p className="text-sm font-medium mb-2">Filter by Cost Type</p>
          <div className="flex flex-wrap gap-2">
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
        </div>

        <div>
          <p className="text-sm font-medium mb-2">Filter by Category</p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={categoryFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCategoryFilter('all')}
            >
              All Categories
            </Button>
            {uniqueCategories.map(cat => (
              <Button
                key={cat}
                variant={categoryFilter === cat ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCategoryFilter(cat)}
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fixed vs Variable Pie Chart */}
        <Card className="glass">
          <CardHeader>
            <CardTitle>Fixed vs Variable Costs</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={costTypeBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  <Cell fill="#3b82f6" />
                  <Cell fill="#ef4444" />
                </Pie>
                <Tooltip formatter={(value: any) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Breakdown Bar Chart */}
        <Card className="glass">
          <CardHeader>
            <CardTitle>Expenses by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    border: 'none',
                    borderRadius: '8px',
                  }}
                  formatter={formatCurrency}
                />
                <Bar dataKey="amount" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Category Table */}
      <Card className="glass">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Category Details</CardTitle>
          <Button
            size="sm"
            variant="outline"
            onClick={handleExport}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredCategories.length > 0 ? (
              filteredCategories.map((cat, idx) => (
                <div key={idx} className="p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                      />
                      <p className="font-semibold text-sm">{cat.category}</p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-muted">
                      {cat.costType === 'fixed' ? 'Fixed' : 'Variable'}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-xs">
                    <div>
                      <p className="text-muted-foreground">Amount</p>
                      <p className="font-semibold">${(cat.amount / 1000).toFixed(1)}k</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Percentage</p>
                      <p className="font-semibold">{cat.percentage.toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Progress</p>
                      <div className="w-full bg-muted rounded-full h-2 mt-1">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                          style={{ width: `${cat.percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-muted-foreground">
                No expense data available for selected filters
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
