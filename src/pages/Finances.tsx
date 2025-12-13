import { useState, useEffect } from "react";
import { useProjectContext } from "@/context/ProjectContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, TrendingUp, Wallet } from "lucide-react";
import TransactionsTab from "../components/finances/TransactionsTab";
import InvoicesTab from "../components/finances/InvoicesTab";
import ReportsTab from "../components/finances/ReportsTab";
import ProfitDistributionTab from "../components/finances/ProfitDistributionTab";
import { useFinances } from "@/hooks/use-finances";

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
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
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

      <Tabs defaultValue="transactions" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

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
              teamMembers={teamMembers}
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
