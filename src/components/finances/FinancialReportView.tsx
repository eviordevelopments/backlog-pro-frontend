import { useState, useEffect } from 'react';
import { useProjectContext } from '@/context/ProjectContext';
import { useFinances } from '@/hooks/use-finances';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FinancialReport } from '@/api/finances/finances';
import { DollarSign, Users, FileText, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

export default function FinancialReportView() {
  const { selectedProject: currentProject } = useProjectContext();
  const { generateFinancialReport } = useFinances();
  const { tasks } = useApp();
  const [report, setReport] = useState<FinancialReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateLocalReport = (): FinancialReport => {
    if (!currentProject) {
      return {
        projectId: '',
        projectName: '',
        budget: 0,
        spent: 0,
        totalIncome: 0,
        totalExpenses: 0,
        netProfit: 0,
        salaries: [],
        teamMembers: 0,
        transactions: 0,
        invoices: 0,
      };
    }

    const projectTasks = tasks.filter(t => t.projectId === currentProject.id);
    const completedTasks = projectTasks.filter(t => t.status === 'done').length;
    const budget = currentProject.budget || 0;
    const spent = currentProject.spent || 0;

    // Load transactions from localStorage
    const savedTransactions = localStorage.getItem('transactions');
    const allTransactions = savedTransactions ? JSON.parse(savedTransactions) : [];
    const projectTransactions = allTransactions.filter((t: any) => t.projectId === currentProject.id);
    
    const totalIncome = projectTransactions
      .filter((t: any) => t.type === 'income')
      .reduce((sum: number, t: any) => sum + (t.amount || 0), 0);
    
    const totalExpenses = projectTransactions
      .filter((t: any) => t.type === 'expense')
      .reduce((sum: number, t: any) => sum + (t.amount || 0), 0);

    return {
      projectId: currentProject.id,
      projectName: currentProject.name,
      budget,
      spent,
      totalIncome,
      totalExpenses,
      netProfit: totalIncome - totalExpenses,
      salaries: [],
      teamMembers: 0,
      transactions: projectTransactions.length,
      invoices: 0,
    };
  };

  const loadReport = async () => {
    if (!currentProject) {
      toast.error('Please select a project first');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      // Try to load from backend first
      try {
        const data = await generateFinancialReport(currentProject.id);
        setReport(data);
      } catch (backendError) {
        // If backend fails, use local data silently
        const localReport = generateLocalReport();
        setReport(localReport);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentProject) {
      loadReport();
    }
  }, [currentProject?.id]);

  if (!report) {
    return (
      <Card className="glass">
        <CardHeader>
          <CardTitle>Financial Report</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            {error || 'No report data available'}
          </p>
          <Button onClick={loadReport} disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Generate Report'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const profitMargin = report.budget > 0 ? ((report.netProfit / report.budget) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{report.projectName}</h2>
          <p className="text-muted-foreground">Financial Summary</p>
        </div>
        <Button onClick={loadReport} disabled={isLoading}>
          {isLoading ? 'Refreshing...' : 'Refresh Report'}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${report.budget.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total allocated</p>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Spent</CardTitle>
            <TrendingUp className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${report.spent.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {((report.spent / report.budget) * 100).toFixed(1)}% of budget
            </p>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <FileText className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${report.netProfit >= 0 ? 'text-success' : 'text-destructive'}`}>
              ${report.netProfit.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {profitMargin}% margin
            </p>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Income</CardTitle>
            <DollarSign className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">${report.totalIncome.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total revenue</p>
          </CardContent>
        </Card>
      </div>

      {/* Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass">
          <CardHeader>
            <CardTitle>Financial Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="text-muted-foreground">Total Income</span>
              <span className="font-bold text-success">${report.totalIncome.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="text-muted-foreground">Total Expenses</span>
              <span className="font-bold text-destructive">${report.totalExpenses.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="text-muted-foreground">Budget Allocated</span>
              <span className="font-bold">${report.budget.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="text-muted-foreground">Amount Spent</span>
              <span className="font-bold">${report.spent.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center pt-2 bg-primary/10 p-2 rounded">
              <span className="font-medium">Net Profit</span>
              <span className={`font-bold text-lg ${report.netProfit >= 0 ? 'text-success' : 'text-destructive'}`}>
                ${report.netProfit.toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader>
            <CardTitle>Project Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="text-muted-foreground">Team Members</span>
              <span className="font-bold">{report.teamMembers}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="text-muted-foreground">Transactions</span>
              <span className="font-bold">{report.transactions}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="text-muted-foreground">Invoices</span>
              <span className="font-bold">{report.invoices}</span>
            </div>
            <div className="flex justify-between items-center pt-2 bg-accent/10 p-2 rounded">
              <span className="font-medium">Budget Utilization</span>
              <span className="font-bold">
                {((report.spent / report.budget) * 100).toFixed(1)}%
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Salaries */}
      {report.salaries.length > 0 && (
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Team Salaries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {report.salaries.map((salary) => (
                <div key={salary.userId} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                  <div>
                    <p className="font-medium">{salary.userName}</p>
                    <p className="text-sm text-muted-foreground">
                      ${salary.idealHourlyRate}/hr
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">${salary.salary.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Total</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
