import { FinancialRecord, BudgetAllocation, FundAccount, FinancialMetrics } from '@/types';

const GRAPHQL_ENDPOINT = 'https://backlog-pro-backend.onrender.com/graphql';

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  currency: string;
  category: string;
  date: string;
  description: string;
  projectId: string;
  clientId?: string;
  isRecurring: boolean;
  createdAt: string;
}

export interface CreateTransactionDto {
  type: 'income' | 'expense';
  amount: number;
  currency: string;
  category: string;
  date: string;
  description: string;
  projectId: string;
  clientId?: string;
  isRecurring?: boolean;
}

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
  salaries: SalaryInfo[];
  teamMembers: number;
  transactions: number;
  invoices: number;
}

const CREATE_TRANSACTION_MUTATION = `
  mutation CreateTransaction($input: CreateTransactionDto!) {
    createTransaction(input: $input) {
      id
      type
      amount
      currency
      category
      date
      description
      projectId
      clientId
      isRecurring
      createdAt
    }
  }
`;

const GENERATE_FINANCIAL_REPORT_QUERY = `
  query GenerateFinancialReport($projectId: String!) {
    generateFinancialReport(projectId: $projectId) {
      projectId
      projectName
      budget
      spent
      totalIncome
      totalExpenses
      netProfit
      salaries {
        userId
        userName
        salary
        idealHourlyRate
      }
      teamMembers
      transactions
      invoices
    }
  }
`;

const CALCULATE_SALARIES_QUERY = `
  query CalculateSalaries($projectId: String!) {
    calculateSalaries(projectId: $projectId) {
      userId
      userName
      salary
      idealHourlyRate
    }
  }
`;

export async function createTransaction(
  token: string,
  input: CreateTransactionDto
): Promise<Transaction> {
  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: CREATE_TRANSACTION_MUTATION,
        variables: { input },
      }),
    });

    const result = await response.json();

    if (result.errors) {
      const error = result.errors[0];
      console.error('GraphQL Error:', result.errors);
      throw new Error(error.message || 'Failed to create transaction');
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (!result.data?.createTransaction) {
      throw new Error('No transaction data returned');
    }

    return result.data.createTransaction;
  } catch (error) {
    console.error('Create transaction error:', error);
    throw error;
  }
}

export async function generateFinancialReport(
  token: string,
  projectId: string
): Promise<FinancialReport> {
  try {
    if (!projectId) {
      throw new Error('Project ID is required');
    }

    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: GENERATE_FINANCIAL_REPORT_QUERY,
        variables: { projectId },
      }),
    });

    const result = await response.json();

    if (result.errors) {
      const error = result.errors[0];
      throw new Error(error.message || 'Failed to generate financial report');
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (!result.data?.generateFinancialReport) {
      throw new Error('No report data returned');
    }

    return result.data.generateFinancialReport;
  } catch (error) {
    throw error;
  }
}

export async function calculateSalaries(
  token: string,
  projectId: string
): Promise<SalaryInfo[]> {
  try {
    if (!projectId) {
      throw new Error('Project ID is required');
    }

    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: CALCULATE_SALARIES_QUERY,
        variables: { projectId },
      }),
    });

    const result = await response.json();

    if (result.errors) {
      const error = result.errors[0];
      console.error('GraphQL Error:', result.errors);
      throw new Error(error.message || 'Failed to calculate salaries');
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (!result.data?.calculateSalaries) {
      return [];
    }

    return result.data.calculateSalaries;
  } catch (error) {
    console.error('Calculate salaries error:', error);
    throw error;
  }
}


// Financial Record CRUD Operations

export function createFinancialRecord(record: Omit<FinancialRecord, 'id'>): FinancialRecord {
  if (!record.date || record.date.trim() === '') {
    throw new Error('Financial record date is required');
  }
  if (!record.type || !['income', 'expense'].includes(record.type)) {
    throw new Error('Financial record type must be "income" or "expense"');
  }
  if (typeof record.amount !== 'number' || record.amount < 0 || !isFinite(record.amount)) {
    throw new Error('Financial record amount must be a non-negative number');
  }
  if (!record.category || record.category.trim() === '') {
    throw new Error('Financial record category is required');
  }
  if (!record.projectId || record.projectId.trim() === '') {
    throw new Error('Financial record projectId is required');
  }
  if (!record.description || record.description.trim() === '') {
    throw new Error('Financial record description is required');
  }

  return {
    ...record,
    id: `record-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  };
}

export function updateFinancialRecord(
  record: FinancialRecord,
  updates: Partial<Omit<FinancialRecord, 'id'>>
): FinancialRecord {
  if (updates.amount !== undefined) {
    if (typeof updates.amount !== 'number' || updates.amount < 0 || !isFinite(updates.amount)) {
      throw new Error('Financial record amount must be a non-negative number');
    }
  }
  if (updates.type !== undefined) {
    if (!['income', 'expense'].includes(updates.type)) {
      throw new Error('Financial record type must be "income" or "expense"');
    }
  }

  return { ...record, ...updates };
}

export function validateFinancialRecord(record: FinancialRecord): boolean {
  return !!(
    record.id &&
    record.date &&
    ['income', 'expense'].includes(record.type) &&
    typeof record.amount === 'number' &&
    record.amount >= 0 &&
    isFinite(record.amount) &&
    record.category &&
    record.projectId &&
    record.description &&
    record.userId
  );
}

// Budget Allocation CRUD Operations

export function createBudgetAllocation(
  totalBudget: number,
  percentages: Record<string, number>,
  userId: string
): BudgetAllocation {
  if (typeof totalBudget !== 'number' || totalBudget < 0 || !isFinite(totalBudget)) {
    throw new Error('Total budget must be a non-negative number');
  }

  const fundNames = ['technology', 'growth', 'team', 'marketing', 'emergency', 'investments'];
  const allocations: Record<string, number> = {};
  let totalPercentage = 0;

  for (const fund of fundNames) {
    const percentage = percentages[fund] || 0;
    if (typeof percentage !== 'number' || percentage < 0 || percentage > 100 || !isFinite(percentage)) {
      throw new Error(`Fund ${fund} percentage must be between 0 and 100`);
    }
    allocations[fund] = (percentage / 100) * totalBudget;
    totalPercentage += percentage;
  }

  if (Math.abs(totalPercentage - 100) > 0.01) {
    throw new Error('Fund percentages must sum to 100%');
  }

  return {
    id: `allocation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    totalBudget,
    allocations: allocations as BudgetAllocation['allocations'],
    createdAt: new Date().toISOString(),
    status: 'pending',
    userId,
  };
}

export function updateBudgetAllocation(
  allocation: BudgetAllocation,
  updates: Partial<Omit<BudgetAllocation, 'id' | 'createdAt'>>
): BudgetAllocation {
  if (updates.totalBudget !== undefined) {
    if (typeof updates.totalBudget !== 'number' || updates.totalBudget < 0 || !isFinite(updates.totalBudget)) {
      throw new Error('Total budget must be a non-negative number');
    }
  }

  return { ...allocation, ...updates };
}

export function validateBudgetAllocation(allocation: BudgetAllocation): boolean {
  if (!allocation.id || !allocation.createdAt || !allocation.userId) {
    return false;
  }

  const fundNames = ['technology', 'growth', 'team', 'marketing', 'emergency', 'investments'];
  for (const fund of fundNames) {
    const amount = allocation.allocations[fund as keyof typeof allocation.allocations];
    if (typeof amount !== 'number' || amount < 0 || !isFinite(amount)) {
      return false;
    }
  }

  return true;
}

// Fund Account Operations

export function createFundAccount(
  name: FundAccount['name'],
  percentage: number,
  totalBudget: number
): FundAccount {
  if (typeof percentage !== 'number' || percentage < 0 || percentage > 100 || !isFinite(percentage)) {
    throw new Error('Fund percentage must be between 0 and 100');
  }

  const balance = (percentage / 100) * totalBudget;

  return {
    id: `fund-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name,
    balance,
    allocated: 0,
    percentage,
    purpose: `${name} fund for business operations`,
  };
}

export function updateFundBalance(fund: FundAccount, amount: number): FundAccount {
  const newBalance = fund.balance + amount;
  if (newBalance < 0) {
    throw new Error('Fund balance cannot be negative');
  }

  return { ...fund, balance: newBalance };
}

export function validateFundAccount(fund: FundAccount): boolean {
  return !!(
    fund.id &&
    fund.name &&
    typeof fund.balance === 'number' &&
    fund.balance >= 0 &&
    isFinite(fund.balance) &&
    typeof fund.allocated === 'number' &&
    fund.allocated >= 0 &&
    isFinite(fund.allocated) &&
    typeof fund.percentage === 'number' &&
    fund.percentage >= 0 &&
    fund.percentage <= 100 &&
    isFinite(fund.percentage) &&
    fund.purpose
  );
}

// Financial Metrics Calculations

export function calculateCAC(marketingSpend: number, newCustomers: number): number {
  if (newCustomers === 0) {
    return Infinity;
  }
  return marketingSpend / newCustomers;
}

export function calculateLTV(
  averageRevenuePerCustomer: number,
  retentionRate: number
): number {
  if (retentionRate <= 0 || retentionRate > 1) {
    return 0;
  }
  return averageRevenuePerCustomer / (1 - retentionRate);
}

export function calculateCashRunway(cashBalance: number, monthlyBurnRate: number): number {
  if (monthlyBurnRate <= 0) {
    return Infinity;
  }
  return cashBalance / monthlyBurnRate;
}

export function calculateBurnRate(totalExpenses: number, monthCount: number): number {
  if (monthCount <= 0) {
    return 0;
  }
  return totalExpenses / monthCount;
}

export function calculateChurnRate(lostCustomers: number, startingCustomers: number): number {
  if (startingCustomers === 0) {
    return 0;
  }
  return (lostCustomers / startingCustomers) * 100;
}

export function validateFinancialMetrics(metrics: FinancialMetrics): boolean {
  return (
    typeof metrics.cac === 'number' &&
    (isFinite(metrics.cac) || metrics.cac === Infinity) &&
    typeof metrics.ltv === 'number' &&
    (isFinite(metrics.ltv) || metrics.ltv === Infinity) &&
    typeof metrics.cashRunway === 'number' &&
    (isFinite(metrics.cashRunway) || metrics.cashRunway === Infinity) &&
    typeof metrics.burnRate === 'number' &&
    metrics.burnRate >= 0 &&
    isFinite(metrics.burnRate) &&
    typeof metrics.churnRate === 'number' &&
    metrics.churnRate >= 0 &&
    metrics.churnRate <= 100 &&
    isFinite(metrics.churnRate)
  );
}
