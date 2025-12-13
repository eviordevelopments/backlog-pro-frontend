const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: response.statusText }));
        throw new Error(error.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Transactions
  async createTransaction(data: any) {
    return this.request('/finances/transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async listTransactions(clientId?: string, projectId?: string) {
    const params = new URLSearchParams();
    if (clientId) params.append('clientId', clientId);
    if (projectId) params.append('projectId', projectId);

    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/finances/transactions${query}`);
  }

  async getTransaction(id: string) {
    return this.request(`/finances/transactions/${id}`);
  }

  async updateTransaction(id: string, data: any) {
    return this.request(`/finances/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteTransaction(id: string) {
    return this.request(`/finances/transactions/${id}`, {
      method: 'DELETE',
    });
  }

  async getProjectExpenses(projectId: string) {
    return this.request(`/finances/projects/${projectId}/expenses`);
  }

  // Invoices
  async createInvoice(data: any) {
    return this.request('/finances/invoices', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async listInvoices(clientId?: string, projectId?: string) {
    const params = new URLSearchParams();
    if (clientId) params.append('clientId', clientId);
    if (projectId) params.append('projectId', projectId);

    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/finances/invoices${query}`);
  }

  async getInvoice(id: string) {
    return this.request(`/finances/invoices/${id}`);
  }

  async updateInvoice(id: string, data: any) {
    return this.request(`/finances/invoices/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteInvoice(id: string) {
    return this.request(`/finances/invoices/${id}`, {
      method: 'DELETE',
    });
  }

  async markInvoiceAsPaid(id: string, paidDate?: string) {
    return this.request(`/finances/invoices/${id}/mark-paid`, {
      method: 'PUT',
      body: JSON.stringify({ paidDate }),
    });
  }

  // Reports
  async generateFinancialReport(projectId: string, projectName: string, budget?: number) {
    const params = new URLSearchParams();
    params.append('projectName', projectName);
    if (budget) params.append('budget', budget.toString());

    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/finances/projects/${projectId}/report${query}`);
  }
}

export const apiClient = new ApiClient();
