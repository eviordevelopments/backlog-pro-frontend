import { useProjectContext } from "@/context/ProjectContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FinancialCalculators from "@/components/finances/FinancialCalculators";
import TransactionManager from "@/components/finances/TransactionManager";
import FinancialOverview from "@/components/finances/FinancialOverview";
import FinancialMetrics from "@/components/finances/FinancialMetrics";
import ProjectFinanceView from "@/components/finances/ProjectFinanceView";
import FinancialReportView from "@/components/finances/FinancialReportView";
import FundAccountsManager from "@/components/finances/FundAccountsManager";
import IncomeExpenseAnalysis from "@/components/finances/IncomeExpenseAnalysis";
import CostBreakdownAnalysis from "@/components/finances/CostBreakdownAnalysis";
import FinancialTrendAnalysis from "@/components/finances/FinancialTrendAnalysis";
import BudgetAllocationHistory from "@/components/finances/BudgetAllocationHistory";
import FinancialDataExport from "@/components/finances/FinancialDataExport";
import ProfitSharingCalculator from "@/components/finances/ProfitSharingCalculator";

export default function Finances() {
  const { selectedProject: currentProject } = useProjectContext();

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

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="glass grid w-full grid-cols-3 sm:grid-cols-4 md:grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="management">Management</TabsTrigger>
          <TabsTrigger value="more">More</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <FinancialOverview />
        </TabsContent>

        <TabsContent value="metrics" className="space-y-6">
          <FinancialMetrics />
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          <Tabs defaultValue="income-expense" className="space-y-6">
            <TabsList className="glass">
              <TabsTrigger value="income-expense">Income & Expense</TabsTrigger>
              <TabsTrigger value="costs">Cost Breakdown</TabsTrigger>
              <TabsTrigger value="trends">Trends</TabsTrigger>
            </TabsList>

            <TabsContent value="income-expense" className="space-y-6">
              <IncomeExpenseAnalysis />
            </TabsContent>

            <TabsContent value="costs" className="space-y-6">
              <CostBreakdownAnalysis />
            </TabsContent>

            <TabsContent value="trends" className="space-y-6">
              <FinancialTrendAnalysis />
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="management" className="space-y-6">
          <Tabs defaultValue="funds" className="space-y-6">
            <TabsList className="glass">
              <TabsTrigger value="funds">Fund Accounts</TabsTrigger>
              <TabsTrigger value="allocations">Allocations</TabsTrigger>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
            </TabsList>

            <TabsContent value="funds" className="space-y-6">
              <FundAccountsManager />
            </TabsContent>

            <TabsContent value="allocations" className="space-y-6">
              <BudgetAllocationHistory />
            </TabsContent>

            <TabsContent value="transactions" className="space-y-6">
              <TransactionManager />
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="more" className="space-y-6">
          <Tabs defaultValue="profit-sharing" className="space-y-6">
            <TabsList className="glass">
              <TabsTrigger value="profit-sharing">Profit Sharing</TabsTrigger>
              <TabsTrigger value="report">Report</TabsTrigger>
              <TabsTrigger value="calculators">Calculators</TabsTrigger>
              <TabsTrigger value="project">Project</TabsTrigger>
              <TabsTrigger value="export">Export</TabsTrigger>
            </TabsList>

            <TabsContent value="profit-sharing" className="space-y-6">
              <ProfitSharingCalculator />
            </TabsContent>

            <TabsContent value="report" className="space-y-6">
              <FinancialReportView />
            </TabsContent>

            <TabsContent value="calculators" className="space-y-6">
              <FinancialCalculators />
            </TabsContent>

            <TabsContent value="project" className="space-y-6">
              <ProjectFinanceView />
            </TabsContent>

            <TabsContent value="export" className="space-y-6">
              <FinancialDataExport />
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  );
}
