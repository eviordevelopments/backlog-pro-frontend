export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface CreateInvoiceDto {
  invoiceNumber: string;
  clientId: string;
  projectId?: string;
  amount: number;
  tax: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  issueDate: string;
  dueDate: string;
  paidDate?: string;
  items: InvoiceItem[];
  notes?: string;
}

export interface UpdateInvoiceDto {
  invoiceNumber?: string;
  clientId?: string;
  projectId?: string;
  amount?: number;
  tax?: number;
  total?: number;
  status?: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  issueDate?: string;
  dueDate?: string;
  paidDate?: string;
  items?: InvoiceItem[];
  notes?: string;
}

export interface Invoice extends CreateInvoiceDto {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

class InvoiceService {
  private storageKey = 'invoices';

  private getInvoices(): Invoice[] {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : [];
  }

  private saveInvoices(invoices: Invoice[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(invoices));
  }

  createInvoice(input: CreateInvoiceDto): Invoice {
    const invoices = this.getInvoices();
    
    // Check if invoice number already exists
    if (invoices.some(i => i.invoiceNumber === input.invoiceNumber && !i.deletedAt)) {
      throw new Error(`Invoice number ${input.invoiceNumber} already exists`);
    }

    const invoice: Invoice = {
      ...input,
      id: `inv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    invoices.push(invoice);
    this.saveInvoices(invoices);
    return invoice;
  }

  listInvoices(clientId?: string, projectId?: string): Invoice[] {
    const invoices = this.getInvoices();
    
    return invoices.filter(i => {
      if (i.deletedAt) return false;
      if (clientId && i.clientId !== clientId) return false;
      if (projectId && i.projectId !== projectId) return false;
      return true;
    });
  }

  getInvoiceById(id: string): Invoice | null {
    const invoices = this.getInvoices();
    const invoice = invoices.find(i => i.id === id && !i.deletedAt);
    return invoice || null;
  }

  updateInvoice(id: string, input: UpdateInvoiceDto): Invoice {
    const invoices = this.getInvoices();
    const index = invoices.findIndex(i => i.id === id && !i.deletedAt);
    
    if (index === -1) {
      throw new Error(`Invoice with id ${id} not found`);
    }

    // Check if new invoice number already exists
    if (input.invoiceNumber && input.invoiceNumber !== invoices[index].invoiceNumber) {
      if (invoices.some(i => i.invoiceNumber === input.invoiceNumber && !i.deletedAt)) {
        throw new Error(`Invoice number ${input.invoiceNumber} already exists`);
      }
    }

    const updated: Invoice = {
      ...invoices[index],
      ...input,
      updatedAt: new Date().toISOString(),
    };

    invoices[index] = updated;
    this.saveInvoices(invoices);
    return updated;
  }

  deleteInvoice(id: string): boolean {
    const invoices = this.getInvoices();
    const index = invoices.findIndex(i => i.id === id && !i.deletedAt);
    
    if (index === -1) {
      throw new Error(`Invoice with id ${id} not found`);
    }

    invoices[index].deletedAt = new Date().toISOString();
    this.saveInvoices(invoices);
    return true;
  }

  getTotalRevenue(projectId?: string): number {
    const invoices = this.getInvoices();
    return invoices
      .filter(i => !i.deletedAt && i.status === 'paid' && (!projectId || i.projectId === projectId))
      .reduce((sum, i) => sum + i.total, 0);
  }

  getPendingAmount(projectId?: string): number {
    const invoices = this.getInvoices();
    return invoices
      .filter(i => !i.deletedAt && (i.status === 'sent' || i.status === 'overdue') && (!projectId || i.projectId === projectId))
      .reduce((sum, i) => sum + i.total, 0);
  }

  getOverdueInvoices(): Invoice[] {
    const invoices = this.getInvoices();
    const today = new Date().toISOString().split('T')[0];
    
    return invoices.filter(i => 
      !i.deletedAt && 
      (i.status === 'sent' || i.status === 'overdue') && 
      i.dueDate < today
    );
  }

  markAsPaid(id: string, paidDate?: string): Invoice {
    return this.updateInvoice(id, {
      status: 'paid',
      paidDate: paidDate || new Date().toISOString(),
    });
  }

  getInvoicesByStatus(status: string, projectId?: string): Invoice[] {
    const invoices = this.getInvoices();
    return invoices.filter(i => 
      !i.deletedAt && 
      i.status === status && 
      (!projectId || i.projectId === projectId)
    );
  }
}

export const invoiceService = new InvoiceService();
