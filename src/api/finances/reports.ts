import { transactionService, Transaction } from './transactions';
import { invoiceService, Invoice } from './invoices';

export interface SalaryInfo {
  userId: string;
  userName: string;
  salary: number;
  idealHourlyRate: number;
}

export interface FinancialReport {
  projectId: string;
  projectName: string;
  budget: number;
  spent: number;
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  salaries: SalaryInfo[];
  teamMembers: number;
  transactions: number;
  invoices: number;
  generatedAt: string;
}

class ReportService {
  generateFinancialReport(
    projectId: string,
    projectName: string,
    budget: number = 0,
    teamMembers: any[] = [],
    transactions: Transaction[] = [],
    invoices: Invoice[] = []
  ): FinancialReport {
    const projectTransactions = transactions.filter(t => t.projectId === projectId);
    const projectInvoices = invoices.filter(i => i.projectId === projectId);

    const totalIncome = projectInvoices
      .filter(i => i.status === 'paid')
      .reduce((sum, i) => sum + i.total, 0);

    const totalExpenses = projectTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const netProfit = totalIncome - totalExpenses;
    const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;

    const salaries = this.calculateSalaries(projectId, teamMembers, budget);

    return {
      projectId,
      projectName,
      budget,
      spent: totalExpenses,
      totalIncome,
      totalExpenses,
      netProfit,
      profitMargin,
      salaries,
      teamMembers: teamMembers.length,
      transactions: projectTransactions.length,
      invoices: projectInvoices.length,
      generatedAt: new Date().toISOString(),
    };
  }

  calculateIdealHourlyRate(
    projectId: string,
    budget: number,
    teamMembers: any[] = [],
    transactions: Transaction[] = []
  ): number {
    if (budget <= 0 || teamMembers.length === 0) {
      return 0;
    }

    const projectTransactions = transactions.filter(t => t.projectId === projectId);
    const totalSalaries = projectTransactions
      .filter(t => t.type === 'expense' && t.category === 'salaries')
      .reduce((sum, t) => sum + t.amount, 0);

    const availableForWork = budget - totalSalaries;
    const estimatedHours = teamMembers.length * 160; // 160 hours per month per person

    return availableForWork > 0 ? availableForWork / estimatedHours : 0;
  }

  calculateSalaries(
    projectId: string,
    teamMembers: any[] = [],
    budget: number = 0
  ): SalaryInfo[] {
    if (teamMembers.length === 0) {
      return [];
    }

    const idealHourlyRate = this.calculateIdealHourlyRate(projectId, budget, teamMembers);
    const monthlyHours = 160;

    return teamMembers.map(member => ({
      userId: member.id,
      userName: member.name,
      salary: idealHourlyRate * monthlyHours,
      idealHourlyRate,
    }));
  }

  getProjectMetrics(
    projectId: string,
    budget: number = 0,
    teamMembers: any[] = [],
    transactions: Transaction[] = [],
    invoices: Invoice[] = []
  ) {
    const projectTransactions = transactions.filter(t => t.projectId === projectId);
    const projectInvoices = invoices.filter(i => i.projectId === projectId);

    const totalIncome = projectInvoices
      .filter(i => i.status === 'paid')
      .reduce((sum, i) => sum + i.total, 0);

    const totalExpenses = projectTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const expensesByCategory = this.getExpensesByCategory(projectId, transactions);
    const incomeByCategory = this.getIncomeByCategory(projectId, transactions);

    return {
      projectId,
      budget,
      spent: totalExpenses,
      remaining: budget - totalExpenses,
      percentageUsed: budget > 0 ? (totalExpenses / budget) * 100 : 0,
      totalIncome,
      totalExpenses,
      netProfit: totalIncome - totalExpenses,
      profitMargin: totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0,
      expensesByCategory,
      incomeByCategory,
      invoiceCount: projectInvoices.length,
      transactionCount: projectTransactions.length,
    };
  }

  getExpensesByCategory(projectId: string, transactions: Transaction[] = []): Record<string, number> {
    const projectTransactions = transactions.filter(t => 
      t.projectId === projectId && t.type === 'expense'
    );

    const byCategory: Record<string, number> = {};
    projectTransactions.forEach(t => {
      byCategory[t.category] = (byCategory[t.category] || 0) + t.amount;
    });

    return byCategory;
  }

  getIncomeByCategory(projectId: string, transactions: Transaction[] = []): Record<string, number> {
    const projectTransactions = transactions.filter(t => 
      t.projectId === projectId && t.type === 'income'
    );

    const byCategory: Record<string, number> = {};
    projectTransactions.forEach(t => {
      byCategory[t.category] = (byCategory[t.category] || 0) + t.amount;
    });

    return byCategory;
  }

  getCashFlow(projectId: string, transactions: Transaction[] = []) {
    const projectTransactions = transactions.filter(t => t.projectId === projectId);
    
    const byMonth: Record<string, { income: number; expenses: number; net: number }> = {};

    projectTransactions.forEach(t => {
      const month = t.date.substring(0, 7); // YYYY-MM
      if (!byMonth[month]) {
        byMonth[month] = { income: 0, expenses: 0, net: 0 };
      }

      if (t.type === 'income') {
        byMonth[month].income += t.amount;
      } else {
        byMonth[month].expenses += t.amount;
      }

      byMonth[month].net = byMonth[month].income - byMonth[month].expenses;
    });

    return byMonth;
  }

  getFinancialSummary(
    projectId: string,
    budget: number = 0,
    teamMembers: any[] = [],
    transactions: Transaction[] = [],
    invoices: Invoice[] = []
  ) {
    const metrics = this.getProjectMetrics(projectId, budget, teamMembers, transactions, invoices);
    const cashFlow = this.getCashFlow(projectId, transactions);

    return {
      metrics,
      cashFlow,
      summary: {
        totalBudget: budget,
        totalSpent: metrics.spent,
        remainingBudget: metrics.remaining,
        budgetUtilization: metrics.percentageUsed,
        totalRevenue: metrics.totalIncome,
        totalCosts: metrics.totalExpenses,
        netProfit: metrics.netProfit,
        profitMargin: metrics.profitMargin,
      },
    };
  }
}

export const reportService = new ReportService();
