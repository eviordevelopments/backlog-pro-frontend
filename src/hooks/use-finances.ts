import { useState, useCallback } from 'react';
import type { CreateTransactionDto, UpdateTransactionDto, Transaction } from '@/api/finances/transactions';
import type { CreateInvoiceDto, UpdateInvoiceDto, Invoice } from '@/api/finances/invoices';
import type { FinancialReport } from '@/api/finances/reports';

// Local storage service
const storageService = {
  getTransactions: () => {
    const data = localStorage.getItem('finances_transactions');
    return data ? JSON.parse(data) : [];
  },
  saveTransactions: (transactions: Transaction[]) => {
    localStorage.setItem('finances_transactions', JSON.stringify(transactions));
  },
  getInvoices: () => {
    const data = localStorage.getItem('finances_invoices');
    return data ? JSON.parse(data) : [];
  },
  saveInvoices: (invoices: Invoice[]) => {
    localStorage.setItem('finances_invoices', JSON.stringify(invoices));
  },
  getProfitShares: () => {
    const data = localStorage.getItem('finances_profit_shares');
    return data ? JSON.parse(data) : [];
  },
  saveProfitShares: (shares: any[]) => {
    localStorage.setItem('finances_profit_shares', JSON.stringify(shares));
  },
};

export const useFinances = () => {
  const [transactions, setTransactions] = useState<Transaction[]>(() => storageService.getTransactions());
  const [invoices, setInvoices] = useState<Invoice[]>(() => storageService.getInvoices());
  const [profitShares, setProfitShares] = useState<any[]>(() => storageService.getProfitShares());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Transaction operations
  const createTransaction = useCallback((input: CreateTransactionDto) => {
    try {
      setLoading(true);
      setError(null);
      const transaction: Transaction = {
        ...input,
        id: `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const updated = [...transactions, transaction];
      setTransactions(updated);
      storageService.saveTransactions(updated);
      return transaction;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create transaction';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [transactions]);

  const listTransactions = useCallback((clientId?: string, projectId?: string) => {
    try {
      setLoading(true);
      setError(null);
      let result = transactions;
      if (clientId) result = result.filter(t => t.clientId === clientId);
      if (projectId) result = result.filter(t => t.projectId === projectId);
      setTransactions(result);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to list transactions';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [transactions]);

  const getProjectExpenses = useCallback((projectId: string) => {
    try {
      setLoading(true);
      setError(null);
      return transactions.filter(t => t.projectId === projectId && t.type === 'expense');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get project expenses';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [transactions]);

  const updateTransaction = useCallback((id: string, input: UpdateTransactionDto) => {
    try {
      setLoading(true);
      setError(null);
      const updated = transactions.map(t => 
        t.id === id ? { ...t, ...input, updatedAt: new Date().toISOString() } : t
      );
      setTransactions(updated);
      storageService.saveTransactions(updated);
      return updated.find(t => t.id === id);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update transaction';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [transactions]);

  const deleteTransaction = useCallback((id: string) => {
    try {
      setLoading(true);
      setError(null);
      const updated = transactions.filter(t => t.id !== id);
      setTransactions(updated);
      storageService.saveTransactions(updated);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete transaction';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [transactions]);

  // Invoice operations
  const createInvoice = useCallback((input: CreateInvoiceDto) => {
    try {
      setLoading(true);
      setError(null);
      const invoice: Invoice = {
        ...input,
        id: `inv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const updated = [...invoices, invoice];
      setInvoices(updated);
      storageService.saveInvoices(updated);
      return invoice;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create invoice';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [invoices]);

  const listInvoices = useCallback((clientId?: string, projectId?: string) => {
    try {
      setLoading(true);
      setError(null);
      let result = invoices;
      if (clientId) result = result.filter(i => i.clientId === clientId);
      if (projectId) result = result.filter(i => i.projectId === projectId);
      setInvoices(result);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to list invoices';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [invoices]);

  const updateInvoice = useCallback((id: string, input: UpdateInvoiceDto) => {
    try {
      setLoading(true);
      setError(null);
      const updated = invoices.map(i => 
        i.id === id ? { ...i, ...input, updatedAt: new Date().toISOString() } : i
      );
      setInvoices(updated);
      storageService.saveInvoices(updated);
      return updated.find(i => i.id === id);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update invoice';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [invoices]);

  const deleteInvoice = useCallback((id: string) => {
    try {
      setLoading(true);
      setError(null);
      const updated = invoices.filter(i => i.id !== id);
      setInvoices(updated);
      storageService.saveInvoices(updated);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete invoice';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [invoices]);

  const markInvoiceAsPaid = useCallback((id: string, paidDate?: string) => {
    try {
      setLoading(true);
      setError(null);
      const updated = invoices.map(i => 
        i.id === id ? { ...i, status: 'paid' as const, paidDate: paidDate || new Date().toISOString(), updatedAt: new Date().toISOString() } : i
      );
      setInvoices(updated);
      storageService.saveInvoices(updated);
      return updated.find(i => i.id === id);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to mark invoice as paid';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [invoices]);

  // Report operations
  const generateFinancialReport = useCallback((
    projectId: string,
    projectName: string,
    budget?: number
  ) => {
    try {
      setLoading(true);
      setError(null);
      const projectTransactions = transactions.filter(t => t.projectId === projectId);
      const projectInvoices = invoices.filter(i => i.projectId === projectId);

      const totalIncome = projectInvoices
        .filter(i => i.status === 'paid')
        .reduce((sum, i) => sum + i.total, 0);

      const totalExpenses = projectTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      const netProfit = totalIncome - totalExpenses;

      return {
        projectId,
        projectName,
        budget: budget || 0,
        spent: totalExpenses,
        totalIncome,
        totalExpenses,
        netProfit,
        profitMargin: totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0,
        salaries: [],
        teamMembers: 0,
        transactions: projectTransactions.length,
        invoices: projectInvoices.length,
        generatedAt: new Date().toISOString(),
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate report';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [transactions, invoices]);

  const calculateIdealHourlyRate = useCallback((
    projectId: string,
    budget: number
  ) => {
    try {
      setLoading(true);
      setError(null);
      const report = generateFinancialReport(projectId, 'Project', budget);
      return report.profitMargin || 0;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to calculate hourly rate';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [generateFinancialReport]);

  const calculateSalaries = useCallback((
    projectId: string,
    budget: number
  ) => {
    try {
      setLoading(true);
      setError(null);
      const report = generateFinancialReport(projectId, 'Project', budget);
      return report.salaries || [];
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to calculate salaries';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [generateFinancialReport]);

  const getProjectMetrics = useCallback((
    projectId: string,
    budget?: number
  ) => {
    try {
      setLoading(true);
      setError(null);
      const report = generateFinancialReport(projectId, 'Project', budget);
      
      return {
        projectId,
        budget: report.budget || 0,
        spent: report.spent || 0,
        remaining: (report.budget || 0) - (report.spent || 0),
        percentageUsed: report.budget ? (report.spent / report.budget) * 100 : 0,
        totalIncome: report.totalIncome || 0,
        totalExpenses: report.totalExpenses || 0,
        netProfit: report.netProfit || 0,
        profitMargin: report.profitMargin || 0,
        expensesByCategory: {},
        incomeByCategory: {},
        invoiceCount: report.invoices || 0,
        transactionCount: report.transactions || 0,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get metrics';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [generateFinancialReport]);

  const getFinancialSummary = useCallback((
    projectId: string,
    budget?: number
  ) => {
    try {
      setLoading(true);
      setError(null);
      const report = generateFinancialReport(projectId, 'Project', budget);
      
      return {
        metrics: {
          projectId,
          budget: report.budget || 0,
          spent: report.spent || 0,
          remaining: (report.budget || 0) - (report.spent || 0),
          percentageUsed: report.budget ? (report.spent / report.budget) * 100 : 0,
          totalIncome: report.totalIncome || 0,
          totalExpenses: report.totalExpenses || 0,
          netProfit: report.netProfit || 0,
          profitMargin: report.profitMargin || 0,
          expensesByCategory: {},
          incomeByCategory: {},
          invoiceCount: report.invoices || 0,
          transactionCount: report.transactions || 0,
        },
        cashFlow: {},
        summary: {
          totalBudget: report.budget || 0,
          totalSpent: report.spent || 0,
          remainingBudget: (report.budget || 0) - (report.spent || 0),
          budgetUtilization: report.budget ? (report.spent / report.budget) * 100 : 0,
          totalRevenue: report.totalIncome || 0,
          totalCosts: report.totalExpenses || 0,
          netProfit: report.netProfit || 0,
          profitMargin: report.profitMargin || 0,
        },
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get summary';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [generateFinancialReport]);

  // Profit Share Distribution
  const calculateProfitShares = useCallback((projectId: string, totalRevenue: number, teamMembers: any[]) => {
    try {
      setLoading(true);
      setError(null);
      
      if (teamMembers.length === 0) {
        return [];
      }

      // Calcular porcentaje por miembro basado en disponibilidad
      const totalAvailability = teamMembers.reduce((sum, m) => sum + (m.availability || 0), 0);
      
      const shares = teamMembers.map(member => {
        const percentage = totalAvailability > 0 ? (member.availability / totalAvailability) * 100 : 0;
        const amount = (totalRevenue * percentage) / 100;
        
        return {
          id: `share-${projectId}-${member.id}`,
          projectId,
          memberId: member.id,
          memberName: member.name,
          percentage,
          amount,
          createdAt: new Date().toISOString(),
        };
      });

      return shares;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to calculate profit shares';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfitShares = useCallback((projectId: string, shares: any[]) => {
    try {
      setLoading(true);
      setError(null);
      
      // Filtrar shares del proyecto actual y agregar los nuevos
      const otherShares = profitShares.filter(s => s.projectId !== projectId);
      const updated = [...otherShares, ...shares];
      
      setProfitShares(updated);
      storageService.saveProfitShares(updated);
      return updated;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update profit shares';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [profitShares]);

  const getProfitSharesByProject = useCallback((projectId: string) => {
    try {
      setLoading(true);
      setError(null);
      return profitShares.filter(s => s.projectId === projectId);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get profit shares';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [profitShares]);

  const getTotalDistributedAmount = useCallback((projectId: string) => {
    try {
      return profitShares
        .filter(s => s.projectId === projectId)
        .reduce((sum, s) => sum + (s.amount || 0), 0);
    } catch (err) {
      console.error('Failed to calculate total distributed amount:', err);
      return 0;
    }
  }, [profitShares]);

  return {
    // State
    transactions,
    invoices,
    profitShares,
    loading,
    error,
    
    // Transaction methods
    createTransaction,
    listTransactions,
    getProjectExpenses,
    updateTransaction,
    deleteTransaction,
    
    // Invoice methods
    createInvoice,
    listInvoices,
    updateInvoice,
    deleteInvoice,
    markInvoiceAsPaid,
    
    // Report methods
    generateFinancialReport,
    calculateIdealHourlyRate,
    calculateSalaries,
    getProjectMetrics,
    getFinancialSummary,
    
    // Profit Share methods
    calculateProfitShares,
    updateProfitShares,
    getProfitSharesByProject,
    getTotalDistributedAmount,
  };
};
