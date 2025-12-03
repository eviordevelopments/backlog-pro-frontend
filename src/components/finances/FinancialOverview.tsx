import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { useProjectContext } from '@/context/ProjectContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, TrendingDown, DollarSign, PieChart } from 'lucide-react';
import { format, startOfMonth, endOfMonth, isWithinInterval, subMonths } from 'date-fns';

interface Transaction {
  id: string;
  projectId: string;
  type: 'income' | 'expense' | 'investment';
  category: string;
  amount: number;
  date: string;
  description: string;
  is_recurring: boolean;
}

export default function FinancialOverview() {
  const { profitShares } = useApp();
  const { selectedProject: currentProject } = useProjectContext();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));

  // Load transactions from localStorage
  const loadTransactions = () => {
    const saved = localStorage.getItem('transactions');
    if (saved) {
      setTransactions(JSON.parse(saved));
    }
  };

  useEffect(() => {
    loadTransactions();
    
    // Listen for transaction updates
    const handleTransactionsUpdate = () => {
      loadTransactions();
    };
    
    window.addEventListener('transactionsUpdated', handleTransactionsUpdate);
    
    return () => {
      window.removeEventListener('transactionsUpdated', handleTransactionsUpdate);
    };
  }, []);

  // Filter transactions by project and month
  const projectTransactions = currentProject
    ? transactions.filter(t => t.projectId === currentProject.id)
    : transactions;

  const monthStart = startOfMonth(new Date(selectedMonth));
  const monthEnd = endOfMonth(new Date(selectedMonth));

  const monthTransactions = projectTransactions.filter(t => 
    isWithinInterval(new Date(t.date), { start: monthStart, end: monthEnd })
  );

  // Calculate metrics
  const totalIncome = monthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = monthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalInvestments = monthTransactions
    .filter(t => t.type === 'investment')
    .reduce((sum, t) => sum + t.amount, 0);

  const netProfit = totalIncome - totalExpenses - totalInvestments;
  const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;

  // Get profit sharing for current project
  const projectProfitShares = currentProject
    ? profitShares.filter(s => s.projectId === currentProject.id)
    : profitShares;

  // Generate month options (last 12 months)
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const date = subMonths(new Date(), i);
    return {
      value: format(date, 'yyyy-MM'),
      label: format(date, 'MMMM yyyy')
    };
  });

  return (
    <div className="space-y-6">
      {/* Month Selector */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Financial Overview</h3>
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {monthOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass glass-hover">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">${totalIncome.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {monthTransactions.filter(t => t.type === 'income').length} transactions
            </p>
          </CardContent>
        </Card>

        <Card className="glass glass-hover">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">${totalExpenses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {monthTransactions.filter(t => t.type === 'expense').length} transactions
            </p>
          </CardContent>
        </Card>

        <Card className="glass glass-hover">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netProfit >= 0 ? 'text-success' : 'text-destructive'}`}>
              ${netProfit.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Margin: {profitMargin.toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card className="glass glass-hover">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Investments</CardTitle>
            <PieChart className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">${totalInvestments.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {monthTransactions.filter(t => t.type === 'investment').length} transactions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Profit Sharing Summary */}
      {projectProfitShares.length > 0 && (
        <Card className="glass">
          <CardHeader>
            <CardTitle>Profit Sharing Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {projectProfitShares.map((share) => (
                <div key={share.memberId} className="flex items-center justify-between p-3 rounded-lg glass">
                  <div>
                    <p className="font-medium">{share.memberName}</p>
                    <p className="text-sm text-muted-foreground">{share.percentage}% share</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">${share.amount.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">
                      {netProfit > 0 ? `$${((netProfit * share.percentage) / 100).toLocaleString()} from profit` : 'No profit this month'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Expense Breakdown */}
      <Card className="glass">
        <CardHeader>
          <CardTitle>Expense Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(
              monthTransactions
                .filter(t => t.type === 'expense')
                .reduce((acc, t) => {
                  acc[t.category] = (acc[t.category] || 0) + t.amount;
                  return acc;
                }, {} as Record<string, number>)
            ).map(([category, amount]) => (
              <div key={category} className="flex items-center justify-between p-2 rounded glass">
                <span className="capitalize">{category.replace(/_/g, ' ')}</span>
                <span className="font-semibold">${amount.toLocaleString()}</span>
              </div>
            ))}
            {monthTransactions.filter(t => t.type === 'expense').length === 0 && (
              <p className="text-center text-muted-foreground py-4">No expenses this month</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
