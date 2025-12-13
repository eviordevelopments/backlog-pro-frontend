import express from 'express';
import bcrypt from 'bcrypt';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());

// In-memory storage for demo purposes
const transactions: any[] = [];
const invoices: any[] = [];

// ============================================================================
// AUTH ENDPOINTS
// ============================================================================

// POST /api/auth/verify-password
app.post('/api/auth/verify-password', async (req, res) => {
  try {
    const { plainPassword, hash } = req.body;

    if (!plainPassword || !hash) {
      return res.status(400).json({ error: 'Missing password or hash' });
    }

    const valid = await bcrypt.compare(plainPassword, hash);

    res.json({ valid });
  } catch (error) {
    console.error('Password verification error:', error);
    res.status(500).json({ error: 'Password verification failed', valid: false });
  }
});

// ============================================================================
// TRANSACTIONS ENDPOINTS
// ============================================================================

// POST /api/finances/transactions - Create transaction
app.post('/api/finances/transactions', (req, res) => {
  try {
    const { type, category, amount, currency, date, description, projectId, clientId, isRecurring, recurringFrequency } = req.body;

    if (!type || !category || !amount || !currency || !date || !description) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const transaction = {
      id: `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      category,
      amount: parseFloat(amount),
      currency,
      date,
      description,
      projectId,
      clientId,
      isRecurring: isRecurring || false,
      recurringFrequency: recurringFrequency || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    transactions.push(transaction);
    res.status(201).json({ data: { createTransaction: transaction } });
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
});

// GET /api/finances/transactions - List transactions
app.get('/api/finances/transactions', (req, res) => {
  try {
    const { clientId, projectId } = req.query;

    let filtered = transactions;

    if (clientId) {
      filtered = filtered.filter(t => t.clientId === clientId);
    }

    if (projectId) {
      filtered = filtered.filter(t => t.projectId === projectId);
    }

    res.json({ data: { listTransactions: filtered } });
  } catch (error) {
    console.error('List transactions error:', error);
    res.status(500).json({ error: 'Failed to list transactions' });
  }
});

// GET /api/finances/transactions/:id - Get transaction
app.get('/api/finances/transactions/:id', (req, res) => {
  try {
    const transaction = transactions.find(t => t.id === req.params.id);

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json({ data: { transaction } });
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({ error: 'Failed to get transaction' });
  }
});

// PUT /api/finances/transactions/:id - Update transaction
app.put('/api/finances/transactions/:id', (req, res) => {
  try {
    const index = transactions.findIndex(t => t.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    const updated = {
      ...transactions[index],
      ...req.body,
      updatedAt: new Date().toISOString(),
    };

    transactions[index] = updated;
    res.json({ data: { updateTransaction: updated } });
  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({ error: 'Failed to update transaction' });
  }
});

// DELETE /api/finances/transactions/:id - Delete transaction
app.delete('/api/finances/transactions/:id', (req, res) => {
  try {
    const index = transactions.findIndex(t => t.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    transactions.splice(index, 1);
    res.json({ data: { deleteTransaction: true } });
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({ error: 'Failed to delete transaction' });
  }
});

// GET /api/finances/projects/:projectId/expenses - Get project expenses
app.get('/api/finances/projects/:projectId/expenses', (req, res) => {
  try {
    const expenses = transactions.filter(t => 
      t.projectId === req.params.projectId && t.type === 'expense'
    );

    res.json({ data: { getProjectExpenses: expenses } });
  } catch (error) {
    console.error('Get project expenses error:', error);
    res.status(500).json({ error: 'Failed to get project expenses' });
  }
});

// ============================================================================
// INVOICES ENDPOINTS
// ============================================================================

// POST /api/finances/invoices - Create invoice
app.post('/api/finances/invoices', (req, res) => {
  try {
    const { invoiceNumber, clientId, projectId, amount, tax, total, status, issueDate, dueDate, items, notes } = req.body;

    if (!invoiceNumber || !clientId || !amount || !total || !status || !issueDate || !dueDate) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if invoice number already exists
    if (invoices.some(i => i.invoiceNumber === invoiceNumber)) {
      return res.status(400).json({ error: 'Invoice number already exists' });
    }

    const invoice = {
      id: `inv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      invoiceNumber,
      clientId,
      projectId,
      amount: parseFloat(amount),
      tax: parseFloat(tax),
      total: parseFloat(total),
      status,
      issueDate,
      dueDate,
      paidDate: null,
      items: items || [],
      notes: notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    invoices.push(invoice);
    res.status(201).json({ data: { createInvoice: invoice } });
  } catch (error) {
    console.error('Create invoice error:', error);
    res.status(500).json({ error: 'Failed to create invoice' });
  }
});

// GET /api/finances/invoices - List invoices
app.get('/api/finances/invoices', (req, res) => {
  try {
    const { clientId, projectId } = req.query;

    let filtered = invoices;

    if (clientId) {
      filtered = filtered.filter(i => i.clientId === clientId);
    }

    if (projectId) {
      filtered = filtered.filter(i => i.projectId === projectId);
    }

    res.json({ data: { listInvoices: filtered } });
  } catch (error) {
    console.error('List invoices error:', error);
    res.status(500).json({ error: 'Failed to list invoices' });
  }
});

// GET /api/finances/invoices/:id - Get invoice
app.get('/api/finances/invoices/:id', (req, res) => {
  try {
    const invoice = invoices.find(i => i.id === req.params.id);

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    res.json({ data: { invoice } });
  } catch (error) {
    console.error('Get invoice error:', error);
    res.status(500).json({ error: 'Failed to get invoice' });
  }
});

// PUT /api/finances/invoices/:id - Update invoice
app.put('/api/finances/invoices/:id', (req, res) => {
  try {
    const index = invoices.findIndex(i => i.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    const updated = {
      ...invoices[index],
      ...req.body,
      updatedAt: new Date().toISOString(),
    };

    invoices[index] = updated;
    res.json({ data: { updateInvoice: updated } });
  } catch (error) {
    console.error('Update invoice error:', error);
    res.status(500).json({ error: 'Failed to update invoice' });
  }
});

// DELETE /api/finances/invoices/:id - Delete invoice
app.delete('/api/finances/invoices/:id', (req, res) => {
  try {
    const index = invoices.findIndex(i => i.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    invoices.splice(index, 1);
    res.json({ data: { deleteInvoice: true } });
  } catch (error) {
    console.error('Delete invoice error:', error);
    res.status(500).json({ error: 'Failed to delete invoice' });
  }
});

// PUT /api/finances/invoices/:id/mark-paid - Mark invoice as paid
app.put('/api/finances/invoices/:id/mark-paid', (req, res) => {
  try {
    const index = invoices.findIndex(i => i.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    const updated = {
      ...invoices[index],
      status: 'paid',
      paidDate: req.body.paidDate || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    invoices[index] = updated;
    res.json({ data: { markInvoiceAsPaid: updated } });
  } catch (error) {
    console.error('Mark invoice as paid error:', error);
    res.status(500).json({ error: 'Failed to mark invoice as paid' });
  }
});

// ============================================================================
// REPORTS ENDPOINTS
// ============================================================================

// GET /api/finances/projects/:projectId/report - Generate financial report
app.get('/api/finances/projects/:projectId/report', (req, res) => {
  try {
    const { projectId } = req.params;
    const { projectName = 'Project', budget = 0 } = req.query;

    const projectTransactions = transactions.filter(t => t.projectId === projectId);
    const projectInvoices = invoices.filter(i => i.projectId === projectId);

    const totalIncome = projectInvoices
      .filter(i => i.status === 'paid')
      .reduce((sum, i) => sum + i.total, 0);

    const totalExpenses = projectTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const netProfit = totalIncome - totalExpenses;

    const report = {
      projectId,
      projectName,
      budget: parseFloat(budget as string),
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

    res.json({ data: { generateFinancialReport: report } });
  } catch (error) {
    console.error('Generate report error:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
