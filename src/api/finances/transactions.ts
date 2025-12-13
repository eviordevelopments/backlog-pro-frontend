export interface CreateTransactionDto {
  type: 'income' | 'expense';
  category: string;
  amount: number;
  currency: string;
  date: string;
  description: string;
  clientId?: string;
  projectId?: string;
  isRecurring?: boolean;
  recurringFrequency?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual';
}

export interface UpdateTransactionDto {
  type?: 'income' | 'expense';
  category?: string;
  amount?: number;
  currency?: string;
  date?: string;
  description?: string;
  clientId?: string;
  projectId?: string;
  isRecurring?: boolean;
  recurringFrequency?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual';
}

export interface Transaction extends CreateTransactionDto {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

class TransactionService {
  private storageKey = 'transactions';

  private getTransactions(): Transaction[] {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : [];
  }

  private saveTransactions(transactions: Transaction[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(transactions));
  }

  createTransaction(input: CreateTransactionDto): Transaction {
    const transactions = this.getTransactions();
    
    const transaction: Transaction = {
      ...input,
      id: `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    transactions.push(transaction);
    this.saveTransactions(transactions);
    return transaction;
  }

  listTransactions(clientId?: string, projectId?: string): Transaction[] {
    const transactions = this.getTransactions();
    
    return transactions.filter(t => {
      if (t.deletedAt) return false;
      if (clientId && t.clientId !== clientId) return false;
      if (projectId && t.projectId !== projectId) return false;
      return true;
    });
  }

  getProjectExpenses(projectId: string): Transaction[] {
    const transactions = this.getTransactions();
    
    return transactions.filter(t => 
      !t.deletedAt && 
      t.projectId === projectId && 
      t.type === 'expense'
    );
  }

  getProjectIncome(projectId: string): Transaction[] {
    const transactions = this.getTransactions();
    
    return transactions.filter(t => 
      !t.deletedAt && 
      t.projectId === projectId && 
      t.type === 'income'
    );
  }

  updateTransaction(id: string, input: UpdateTransactionDto): Transaction {
    const transactions = this.getTransactions();
    const index = transactions.findIndex(t => t.id === id && !t.deletedAt);
    
    if (index === -1) {
      throw new Error(`Transaction with id ${id} not found`);
    }

    const updated: Transaction = {
      ...transactions[index],
      ...input,
      updatedAt: new Date().toISOString(),
    };

    transactions[index] = updated;
    this.saveTransactions(transactions);
    return updated;
  }

  deleteTransaction(id: string): boolean {
    const transactions = this.getTransactions();
    const index = transactions.findIndex(t => t.id === id && !t.deletedAt);
    
    if (index === -1) {
      throw new Error(`Transaction with id ${id} not found`);
    }

    transactions[index].deletedAt = new Date().toISOString();
    this.saveTransactions(transactions);
    return true;
  }

  getTransactionById(id: string): Transaction | null {
    const transactions = this.getTransactions();
    const transaction = transactions.find(t => t.id === id && !t.deletedAt);
    return transaction || null;
  }

  getRecurringTransactions(): Transaction[] {
    const transactions = this.getTransactions();
    return transactions.filter(t => !t.deletedAt && t.isRecurring);
  }

  getTotalByCategory(projectId: string, type: 'income' | 'expense'): Record<string, number> {
    const transactions = this.getTransactions();
    const filtered = transactions.filter(t => 
      !t.deletedAt && 
      t.projectId === projectId && 
      t.type === type
    );

    const totals: Record<string, number> = {};
    filtered.forEach(t => {
      totals[t.category] = (totals[t.category] || 0) + t.amount;
    });

    return totals;
  }

  getTotalAmount(projectId: string, type: 'income' | 'expense'): number {
    const transactions = this.getTransactions();
    return transactions
      .filter(t => !t.deletedAt && t.projectId === projectId && t.type === type)
      .reduce((sum, t) => sum + t.amount, 0);
  }
}

export const transactionService = new TransactionService();
