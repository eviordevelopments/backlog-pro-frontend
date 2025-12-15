import { useState, useEffect } from "react";
import { useProjectContext } from "@/context/ProjectContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, TrendingUp, Wallet, AlertCircle } from "lucide-react";
import TransactionsTab from "../components/finances/TransactionsTab";
import InvoicesTab from "../components/finances/InvoicesTab";
import ReportsTab from "../components/finances/ReportsTab";
import ProfitDistributionTab from "../components/finances/ProfitDistributionTab";
import ProfitSharingCalculator from "../components/finances/ProfitSharingCalculator";
import TeamSalaryDistribution from "../components/finances/TeamSalaryDistribution";
import IncomeExpenseAnalysis from "../components/finances/IncomeExpenseAnalysis";
import FinancialMetrics from "../components/finances/FinancialMetrics";
import FinancesOverview from "../components/finances/FinancesOverview";
import CalculatedSalaries from "../components/finances/CalculatedSalaries";
import { useFinances } from "@/hooks/use-finances";

interface TabConfig {
  value: string;
  label: string;
  isMocked: boolean;
}

const TAB_CONFIGS: TabConfig[] = [
  { value: "overview", label: "Overview", isMocked: false },
  { value: "transactions", label: "Transactions", isMocked: false },
  { value: "invoices", label: "Invoices", isMocked: false },
  { value: "distribution", label: "Distribution", isMocked: false },
  { value: "profit-sharing", label: "Profit Sharing", isMocked: true },
  { value: "team-salary", label: "Team Salary", isMocked: true },
  { value: "income-expense", label: "Income/Expense", isMocked: true },
  { value: "metrics", label: "Metrics", isMocked: true },
  { value: "calculated-salaries", label: "Salaries", isMocked: true },
  { value: "reports", label: "Reports", isMocked: false },
];

export default function Finances() {
  const { selectedProject: currentProject } = useProjectContext();
  const { generateFinancialReport } = useFinances();
  const [metrics, setMetrics] = useState<any>({
    budget: 0,
    spent: 0,
    percentageUsed: 0,
    netProfit: 0,
    profitMargin: 0,
  });
  const [totalRevenue, setTotalRevenue] = useState(0);

  useEffect(() => {
    if (currentProject) {
      const report = generateFinancialReport(currentProject.id, currentProject.name, currentProject.budget);
      setMetrics({
        budget: currentProject.budget || 0,
        spent: report.spent || 0,
        percentageUsed: currentProject.budget ? (report.spent / currentProject.budget) * 100 : 0,
        netProfit: report.netProfit || 0,
        profitMargin: report.profitMargin || 0,
      });
      setTotalRevenue(report.totalIncome || 0);
    }
  }, [currentProject]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const renderTabTrigger = (config: TabConfig) => (
    <div className="flex items-center gap-2">
      <TabsTrigger value={config.value} className="relative">
        {config.label}
        {config.isMocked && (
          <div 
            className="absolute -top-1 -right-1 w-2 h-2 bg-destructive rounded-full"
            title="Datos mockeados - Implementación pendiente"
          />
        )}
      </TabsTrigger>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-gradient">Finances</h1>
        <p className="text-muted-foreground mt-2">
          {currentProject 
            ? `Financial management for ${currentProject.name}` 
            : "Manage your financial data and metrics"}
        </p>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <AlertCircle className="w-4 h-4 text-destructive" />
        <span>Punto rojo = Datos mockeados (pendiente implementación)</span>
      </div>

      {currentProject && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="glass glass-hover">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(metrics.budget)}</div>
              <p className="text-xs text-muted-foreground">Project budget</p>
            </CardContent>
          </Card>

          <Card className="glass glass-hover">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <TrendingUp className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(metrics.spent)}</div>
              <p className="text-xs text-muted-foreground">{metrics.percentageUsed.toFixed(1)}% of budget</p>
            </CardContent>
          </Card>

          <Card className="glass glass-hover">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
              <Wallet className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(metrics.netProfit)}</div>
              <p className="text-xs text-muted-foreground">{metrics.profitMargin.toFixed(1)}% margin</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="flex w-full overflow-x-auto bg-muted/50 p-1 rounded-lg gap-1 flex-wrap">
          {TAB_CONFIGS.map((config) => renderTabTrigger(config))}
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {currentProject ? (
            <FinancesOverview />
          ) : (
            <Card className="glass">
              <CardContent className="pt-6">
                <p className="text-muted-foreground">Select a project to view financial overview</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          {currentProject ? (
            <TransactionsTab projectId={currentProject.id} />
          ) : (
            <Card className="glass">
              <CardContent className="pt-6">
                <p className="text-muted-foreground">Select a project to manage transactions</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="invoices" className="space-y-4">
          {currentProject ? (
            <InvoicesTab projectId={currentProject.id} />
          ) : (
            <Card className="glass">
              <CardContent className="pt-6">
                <p className="text-muted-foreground">Select a project to manage invoices</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="distribution" className="space-y-4">
          {currentProject ? (
            <ProfitDistributionTab 
              projectId={currentProject.id} 
              teamMembers={[]}
              totalRevenue={totalRevenue}
            />
          ) : (
            <Card className="glass">
              <CardContent className="pt-6">
                <p className="text-muted-foreground">Select a project to manage profit distribution</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="profit-sharing" className="space-y-4">
          <ProfitSharingCalculator />
        </TabsContent>

        <TabsContent value="team-salary" className="space-y-4">
          {currentProject ? (
            <TeamSalaryDistribution 
              operationalPercentage={50}
              totalRevenue={metrics.budget}
            />
          ) : (
            <Card className="glass">
              <CardContent className="pt-6">
                <p className="text-muted-foreground">Select a project to manage team salary distribution</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="income-expense" className="space-y-4">
          <IncomeExpenseAnalysis />
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <FinancialMetrics />
        </TabsContent>

        <TabsContent value="calculated-salaries" className="space-y-4">
          {currentProject ? (
            <CalculatedSalaries operationalBudget={metrics.budget * 0.5} />
          ) : (
            <Card className="glass">
              <CardContent className="pt-6">
                <p className="text-muted-foreground">Select a project to view calculated salaries</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          {currentProject ? (
            <ReportsTab projectId={currentProject.id} projectName={currentProject.name} budget={currentProject.budget} />
          ) : (
            <Card className="glass">
              <CardContent className="pt-6">
                <p className="text-muted-foreground">Select a project to view financial reports</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
