import { useAuth } from '@/context/AuthContext';
import {
  createTransaction,
  generateFinancialReport,
  calculateSalaries,
  CreateTransactionDto,
  Transaction,
  FinancialReport,
  SalaryInfo,
} from '@/api/finances/finances';

export const useFinances = () => {
  const { user } = useAuth();

  const getToken = (): string => {
    const sessionData = localStorage.getItem('auth_session');
    if (!sessionData) {
      throw new Error('No active session');
    }
    const session = JSON.parse(sessionData);
    return session.accessToken;
  };

  return {
    createTransaction: async (input: CreateTransactionDto): Promise<Transaction> => {
      const token = getToken();
      return createTransaction(token, input);
    },

    generateFinancialReport: async (projectId: string): Promise<FinancialReport> => {
      const token = getToken();
      return generateFinancialReport(token, projectId);
    },

    calculateSalaries: async (projectId: string): Promise<SalaryInfo[]> => {
      const token = getToken();
      return calculateSalaries(token, projectId);
    },
  };
};
